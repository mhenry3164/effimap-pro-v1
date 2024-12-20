import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store';

interface Tenant {
  id: string;
  name: string;
  settings?: {
    mapDefaults?: {
      center?: { lat: number; lng: number };
      zoom?: number;
    };
    territoryTypes?: string[];
    customFields?: {
      [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'date';
        label: string;
        required?: boolean;
      };
    };
  };
  territories?: {
    [id: string]: {
      id: string;
      name: string;
      type: string;
      coordinates: { lat: number; lng: number }[];
      assignedTo?: string;
      branchId?: string;
      metadata?: {
        createdAt: string;
        createdBy: string;
        lastModifiedAt: string;
        lastModifiedBy: string;
      };
      customFields?: {
        [key: string]: any;
      };
    };
  };
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: Error | null;
  updateTenant: (data: Partial<Tenant>) => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
  updateTenant: async () => {},
});

export const useTenant = () => useContext(TenantContext);

interface TenantProviderProps {
  children: React.ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user } = useStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!user?.tenantId) {
        setTenant(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const tenantRef = doc(collection(db, 'tenants'), user.tenantId);
        const tenantDoc = await getDoc(tenantRef);

        if (tenantDoc.exists()) {
          setTenant({ id: tenantDoc.id, ...tenantDoc.data() } as Tenant);
        } else {
          throw new Error('Tenant not found');
        }
      } catch (err) {
        console.error('Error fetching tenant:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch tenant'));
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [user?.tenantId]);

  const updateTenant = async (data: Partial<Tenant>) => {
    if (!tenant) return;

    try {
      const tenantRef = doc(collection(db, 'tenants'), tenant.id);
      await tenantRef.update(data);
      setTenant({ ...tenant, ...data });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update tenant');
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, loading, error, updateTenant }}>
      {children}
    </TenantContext.Provider>
  );
}
