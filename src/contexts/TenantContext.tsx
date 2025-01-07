import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store';
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
  updateTenant: (data: Partial<Tenant>) => Promise<void>;
}

// Export the context so it can be used by the hook
export const TenantContext = createContext<TenantContextType>({
  tenant: null,
  hierarchy: {},
  loading: true,
  error: null,
  updateTenant: async () => {},
});

interface TenantProviderProps {
  children: React.ReactNode;
}

// List of tenant IDs that get legacy access
const LEGACY_TENANTS = {
  'heavy-machines': {
    reason: 'Employer Organization',
    plan: 'enterprise' as const,
  },
  // Add other legacy tenants here
};

// Export the provider component
export function TenantProvider({ children }: TenantProviderProps) {
  const { user, tenant: storeTenant, setTenant: setStoreTenant } = useStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [hierarchy, setHierarchy] = useState<TenantHierarchy>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  console.log('[DEBUG] TenantProvider - Initial render with user:', user?.tenantId);

  useEffect(() => {
    console.log('[DEBUG] TenantProvider - Effect triggered with tenantId:', user?.tenantId);
    const fetchTenant = async () => {
      if (!user?.tenantId) {
        console.log('[DEBUG] TenantProvider - No tenant ID in user object');
        setTenant(null);
        setStoreTenant(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check store first
        if (storeTenant && storeTenant.id === user.tenantId) {
          console.log('[DEBUG] TenantProvider - Using cached tenant:', storeTenant.id);
          setTenant(storeTenant);
          setLoading(false);
          return;
        }

        console.log('[DEBUG] TenantProvider - Fetching tenant:', user.tenantId);
        const tenantRef = doc(db, 'tenants', user.tenantId);
        const tenantDoc = await getDoc(tenantRef);

        if (tenantDoc.exists()) {
          // Handle legacy tenants
          const isLegacy = LEGACY_TENANTS[user.tenantId as keyof typeof LEGACY_TENANTS];
          const tenantData = {
            id: tenantDoc.id,
            ...tenantDoc.data(),
            billing: {
              type: isLegacy ? 'legacy' : 'stripe',
              legacyAccess: isLegacy,
            },
          } as Tenant;

          console.log('[DEBUG] TenantProvider - Tenant found:', tenantData.id);
          setTenant(tenantData);
          setStoreTenant(tenantData);

          // Fetch hierarchy data
          const [divisionData, branchData] = await Promise.all([
            user.divisionId ? divisionService.getDivision(user.divisionId) : null,
            user.branchId ? branchService.getBranch(user.branchId) : null,
          ]);

          setHierarchy({
            divisionId: user.divisionId,
            branchId: user.branchId,
            divisionData,
            branchData,
          });
        } else {
          console.log('[DEBUG] TenantProvider - Tenant not found');
          throw new Error('Tenant not found');
        }
      } catch (err) {
        console.error('[DEBUG] TenantProvider - Error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch tenant'));
        setTenant(null);
        setStoreTenant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [user?.tenantId, user?.divisionId, user?.branchId, storeTenant, setStoreTenant]);

  const updateTenant = async (data: Partial<Tenant>) => {
    if (!tenant?.id) return;

    try {
      const tenantRef = doc(db, 'tenants', tenant.id);
      await updateDoc(tenantRef, data);
      const updatedTenant = { ...tenant, ...data };
      setTenant(updatedTenant);
      setStoreTenant(updatedTenant);
    } catch (error) {
      console.error('[DEBUG] TenantProvider - Error updating tenant:', error);
      throw error;
    }
  };

  const value = {
    tenant,
    hierarchy,
    loading,
    error,
    updateTenant,
  };

  console.log('[DEBUG] TenantProvider - Rendering with tenant:', tenant?.id);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

// Export everything
export type { Tenant, TenantContextType, TenantHierarchy, TenantProviderProps };
export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
export default TenantProvider;
