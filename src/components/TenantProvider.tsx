import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useStore } from '../store';
import { Tenant, TenantContextType } from '../types/tenant';

// Create the context with default values
export const TenantContext = createContext<TenantContextType>({
  tenant: null,
  setTenant: () => {},
  loading: false,
  error: null
});

const db = getFirestore();

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps): JSX.Element => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const store = useStore();

  useEffect(() => {
    const loadTenantContext = async () => {
      if (!store.user?.tenantId) {
        setTenant(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const tenantDoc = await getDoc(doc(db, 'tenants', store.user.tenantId));
        if (tenantDoc.exists()) {
          const tenantData = tenantDoc.data() as Tenant;
          // Ensure required fields are present
          if (!tenantData.settings) {
            tenantData.settings = {
              features: {},
              notifications: {
                email: false,
                sms: false,
                push: false
              }
            };
          }
          setTenant(tenantData);
        } else {
          throw new Error('Tenant not found');
        }
      } catch (err) {
        console.error('Error loading tenant:', err);
        setError(err instanceof Error ? err : new Error('Failed to load tenant'));
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    void loadTenantContext();
  }, [store.user?.tenantId]);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
