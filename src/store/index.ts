import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Branch, Representative, Tenant } from '../types/tenant';
import { Territory } from '../types/territory';
import { User } from '../types/user';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, setDoc, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface LoadingState {
  auth: boolean;
  territories: boolean;
  branches: boolean;
  representatives: boolean;
}

interface StoreState {
  // User and Auth
  user: User | null;
  loading: LoadingState;
  setUser: (user: User | null) => void;
  initAuth: () => Promise<User | null>;
  
  // Loading State
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  
  // Tenant
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  
  // Territories
  territories: Territory[];
  setTerritories: (territories: Territory[]) => void;
  selectedTerritory: Territory | null;
  setSelectedTerritory: (territory: Territory | null) => void;
  updateTerritory: (territory: Territory) => Promise<void>;
  addTerritory: (territory: Omit<Territory, 'id'>) => Promise<void>;
  
  // Branches
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  
  // Representatives
  representatives: Representative[];
  setRepresentatives: (representatives: Representative[]) => void;
  selectedRepresentative: Representative | null;
  setSelectedRepresentative: (representative: Representative | null) => void;

  // Async Actions
  fetchBranches: () => Promise<Branch[]>;
  fetchRepresentatives: () => Promise<Representative[]>;
}

export const useStore = create<StoreState>()(
  devtools(
    (set, get) => ({
      // User and Auth
      user: null,
      loading: {
        auth: true,
        territories: false,
        branches: false,
        representatives: false
      },
      setUser: (user) => set({ user }),
      initAuth: () => {
        console.log('Initializing auth...');
        set(state => ({ loading: { ...state.loading, auth: true } }));
        
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user?.email);
            if (user) {
              try {
                // Fetch user profile from Firestore
                console.log('Fetching user profile for uid:', user.uid);
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                console.log('User doc exists?', userDoc.exists());
                
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  console.log('User data found:', userData);

                  // Convert Firebase user to our User type with roles
                  const appUser: User = {
                    id: user.uid,
                    email: user.email || '',
                    displayName: userData.displayName || user.displayName || '',
                    photoURL: userData.photoURL || user.photoURL || '',
                    tenantId: userData.tenantId || '',
                    organizationRoles: userData.organizationRoles || [],
                    platformRole: userData.platformRole || 'user',
                    metadata: userData.metadata || {
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      status: 'active'
                    }
                  };

                  // Set user in store
                  set({ user: appUser });

                  // If user has a tenant ID, fetch tenant data
                  if (appUser.tenantId) {
                    try {
                      const tenantRef = doc(db, 'tenants', appUser.tenantId);
                      const tenantDoc = await getDoc(tenantRef);
                      
                      if (tenantDoc.exists()) {
                        const tenantData = { id: tenantDoc.id, ...tenantDoc.data() } as Tenant;
                        set({ tenant: tenantData });
                      }
                    } catch (error) {
                      console.error('Error fetching tenant data:', error);
                      set({ tenant: null });
                    }
                  }

                  resolve(appUser);
                } else {
                  console.log('No user document found');
                  set({ user: null, tenant: null });
                  resolve(null);
                }
              } catch (error) {
                console.error('Error fetching user profile:', error);
                set({ user: null, tenant: null });
                resolve(null);
              } finally {
                set(state => ({ loading: { ...state.loading, auth: false } }));
              }
            } else {
              console.log('No authenticated user');
              set({ user: null, tenant: null, loading: { ...get().loading, auth: false } });
              resolve(null);
            }
          });

          // Cleanup subscription on unmount
          return () => unsubscribe();
        });
      },
      
      // Loading State
      setLoading: (key, value) => 
        set(state => ({ 
          loading: { ...state.loading, [key]: value } 
        })),
      
      // Tenant
      tenant: null,
      setTenant: (tenant) => set({ tenant }),
      
      // Territories
      territories: [],
      setTerritories: (territories) => set({ territories }),
      selectedTerritory: null,
      setSelectedTerritory: (territory) => set({ selectedTerritory: territory }),
      updateTerritory: async (territory) => {
        const { user } = get();
        if (!user?.tenantId) return;
        
        try {
          set(state => ({
            territories: state.territories.map(t => 
              t.id === territory.id ? territory : t
            )
          }));
          
          // Update in Firestore
          const territoryRef = doc(db, 'tenants', user.tenantId, 'territories', territory.id);
          await updateDoc(territoryRef, territory);
        } catch (error) {
          console.error('Error updating territory:', error);
          throw error;
        }
      },
      addTerritory: async (territory) => {
        const { user } = get();
        if (!user?.tenantId) return;
        
        try {
          // Add to Firestore
          const territoriesRef = collection(db, 'tenants', user.tenantId, 'territories');
          const docRef = await addDoc(territoriesRef, {
            ...territory,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          const newTerritory = {
            ...territory,
            id: docRef.id
          } as Territory;
          
          // Update local state
          set(state => ({
            territories: [...state.territories, newTerritory]
          }));
        } catch (error) {
          console.error('Error adding territory:', error);
          throw error;
        }
      },
      
      // Branches
      branches: [],
      setBranches: (branches) => set({ branches }),
      selectedBranch: null,
      setSelectedBranch: (branch) => set({ selectedBranch: branch }),
      
      // Representatives
      representatives: [],
      setRepresentatives: (representatives) => set({ representatives }),
      selectedRepresentative: null,
      setSelectedRepresentative: (representative) => set({ selectedRepresentative: representative }),

      // Async Actions
      fetchBranches: async () => {
        const { user } = get();
        if (!user?.tenantId) return [];
        
        set(state => ({ loading: { ...state.loading, branches: true } }));
        try {
          const branchesRef = collection(db, 'tenants', user.tenantId, 'branches');
          const branchesSnap = await getDocs(branchesRef);
          const branches = branchesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Branch[];
          
          set({ branches });
          return branches;
        } finally {
          set(state => ({ loading: { ...state.loading, branches: false } }));
        }
      },
      
      fetchRepresentatives: async () => {
        const { user } = get();
        if (!user?.tenantId) return [];
        
        set(state => ({ loading: { ...state.loading, representatives: true } }));
        try {
          const repsRef = collection(db, 'tenants', user.tenantId, 'representatives');
          const repsSnap = await getDocs(repsRef);
          const representatives = repsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Representative[];
          
          set({ representatives });
          return representatives;
        } finally {
          set(state => ({ loading: { ...state.loading, representatives: false } }));
        }
      }
    }),
    {
      name: 'effimap-store'
    }
  )
);