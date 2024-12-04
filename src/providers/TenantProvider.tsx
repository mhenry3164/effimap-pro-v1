import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useStore } from '../store';
import { adminService } from '../services/adminService';
import { divisionService } from '../services/divisionService';
import { branchService } from '../services/branchService';

interface TenantSubscription {
  plan: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  trialEndDate?: string;
  currentPeriodEnd?: string;
  stripeSubscriptionId?: string;
}

interface TenantBilling {
  type: 'stripe' | 'legacy';
  legacyAccess?: {
    reason: string;
    expiryDate?: string;  // Optional expiry date for legacy access
    plan: 'basic' | 'professional' | 'enterprise';
  };
}

interface Tenant {
  id: string;
  name: string;
  subscription?: TenantSubscription;
  billing: TenantBilling;
  features?: Record<string, boolean>;
  settings?: Record<string, any>;
  userCount?: number;
  branchCount?: number;
  territoryCount?: number;
  lastUpdated?: string;
}

interface TenantHierarchy {
  divisionId?: string;
  branchId?: string;
  divisionData?: any;
  branchData?: any;
  metrics?: {
    userCount: number;
    branchCount: number;
    territoryCount: number;
  };
}

interface TenantContextType {
  tenant: Tenant | null;
  hierarchy: TenantHierarchy;
  loading: boolean;
  error: Error | null;
}

// Export the context so it can be used by the hook
export const TenantContext = createContext<TenantContextType>({
  tenant: null,
  hierarchy: {},
  loading: true,
  error: null
});

export const useTenant = () => useContext(TenantContext);

interface TenantProviderProps {
  children: React.ReactNode;
}

// List of tenant IDs that get legacy access
const LEGACY_TENANTS = {
  'heavy-machines': {
    reason: 'Employer Organization',
    plan: 'enterprise' as const
  },
  'test-tenant': {
    reason: 'Test Environment',
    plan: 'professional' as const
  },
  'basic-test-tenant': {
    reason: 'Basic Test Environment',
    plan: 'basic' as const
  }
};

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user } = useStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [hierarchy, setHierarchy] = useState<TenantHierarchy>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load organizational hierarchy
  useEffect(() => {
    const loadHierarchy = async () => {
      if (!user?.tenantId) return;

      try {
        let hierarchyData: TenantHierarchy = {
          divisionId: user.divisionId,
          branchId: user.branchId
        };

        // Load division data if user has a division
        if (user.divisionId) {
          const divisionData = await divisionService.getById(user.tenantId, user.divisionId);
          if (divisionData) {
            hierarchyData.divisionData = divisionData;
            const metrics = await divisionService.getMetrics(user.tenantId, user.divisionId);
            hierarchyData.metrics = metrics;
          }
        }

        // Load branch data if user has a branch
        if (user.branchId) {
          const branchData = await branchService.getById(user.tenantId, user.branchId);
          if (branchData) {
            hierarchyData.branchData = branchData;
            // If user is branch-level, get branch-specific metrics
            if (!user.divisionId) {
              hierarchyData.metrics = {
                userCount: await branchService.getUserCount(user.tenantId, user.branchId),
                branchCount: 1,
                territoryCount: await branchService.getTerritoryCount(user.tenantId, user.branchId)
              };
            }
          }
        }

        setHierarchy(hierarchyData);
      } catch (err) {
        console.error('Error loading hierarchy:', err);
      }
    };

    loadHierarchy();
  }, [user?.tenantId, user?.divisionId, user?.branchId]);

  // Load tenant data
  useEffect(() => {
    const loadTenant = async () => {
      if (!user?.tenantId) {
        console.log('No tenantId found for user, clearing tenant state');
        setTenant(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Loading tenant data for ID:', user.tenantId);
        setLoading(true);
        setError(null);

        // Get tenant document
        const tenantRef = doc(db, 'tenants', user.tenantId);
        const tenantDoc = await getDoc(tenantRef);

        if (!tenantDoc.exists()) {
          console.log('No tenant document found, checking legacy access');
          // Check if this should be a legacy tenant
          const legacyAccess = LEGACY_TENANTS[user.tenantId];
          
          if (!legacyAccess) {
            console.error('No tenant document or legacy access found');
            setError(new Error('Tenant not found'));
            setTenant(null);
            return;
          }

          // Create new tenant with appropriate billing type
          const newTenantData: Tenant = {
            id: user.tenantId,
            name: legacyAccess ? 'Legacy Enterprise Tenant' : 'New Tenant',
            billing: legacyAccess ? {
              type: 'legacy',
              legacyAccess: {
                reason: legacyAccess.reason,
                plan: legacyAccess.plan
              }
            } : {
              type: 'stripe'
            },
            subscription: legacyAccess ? {
              plan: legacyAccess.plan,
              status: 'active',
              currentPeriodEnd: '2099-12-31T23:59:59.999Z'
            } : undefined,
            features: legacyAccess ? {
              enableAdvancedMapping: true,
              enableAnalytics: true,
              enableCustomBoundaries: true,
              enableTeamManagement: true,
              enableApiAccess: true
            } : {
              enableAdvancedMapping: false,
              enableAnalytics: false,
              enableCustomBoundaries: false,
              enableTeamManagement: false,
              enableApiAccess: false
            },
            lastUpdated: new Date().toISOString()
          };
          
          console.log('Creating new tenant document:', newTenantData);
          await setDoc(tenantRef, newTenantData);
          setTenant(newTenantData);
        } else {
          console.log('Tenant document found:', tenantDoc.data());
          const tenantData = {
            id: tenantDoc.id,
            ...tenantDoc.data()
          } as Tenant;
          setTenant(tenantData);
        }
      } catch (err) {
        console.error('Error loading tenant:', err);
        setError(err as Error);
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [user?.tenantId]);

  // Update counts periodically
  useEffect(() => {
    if (!tenant?.id) return;

    const updateCounts = async () => {
      try {
        await adminService.updateTenantCounts(tenant.id);
        const updatedDoc = await getDoc(doc(db, 'tenants', tenant.id));
        const updatedData = {
          id: updatedDoc.id,
          ...updatedDoc.data()
        } as Tenant;
        setTenant(updatedData);
      } catch (err) {
        console.error('Error updating tenant counts:', err);
      }
    };

    const interval = setInterval(updateCounts, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [tenant?.id]);

  const contextValue = { tenant, hierarchy, loading, error };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantProvider;
