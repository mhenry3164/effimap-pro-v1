import { create } from 'zustand';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './authStore';

interface Organization {
  id: string;
  name: string;
  plan: string;
  features: {
    enableAdvancedMapping: boolean;
    enableAnalytics: boolean;
    enableApiAccess: boolean;
    enableCustomBoundaries: boolean;
    enableTeamManagement: boolean;
  };
  settings: {
    autoAssignTerritories: boolean;
    enableNotifications: boolean;
    rateLimit: number;
  };
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

interface OrganizationState {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  fetchOrganization: (orgId: string) => Promise<void>;
  setOrganization: (org: Organization | null) => void;
  clearOrganization: () => void;
}

export const useOrganization = create<OrganizationState>((set) => ({
  organization: null,
  loading: false,
  error: null,

  fetchOrganization: async (orgId: string) => {
    set({ loading: true, error: null });
    try {
      const orgDoc = await getDoc(doc(db, 'organizations', orgId));
      if (orgDoc.exists()) {
        const orgData = orgDoc.data() as Organization;
        set({ organization: { ...orgData, id: orgDoc.id }, loading: false });
      } else {
        set({ error: 'Organization not found', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch organization', loading: false });
    }
  },

  setOrganization: (org: Organization | null) => set({ organization: org }),
  
  clearOrganization: () => set({ organization: null, error: null }),
}));
