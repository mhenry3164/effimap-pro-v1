import { Dispatch, SetStateAction } from 'react';

export interface FeatureFlags {
  enableAdvancedMapping: boolean;
  enableAnalytics: boolean;
  enableCustomBoundaries: boolean;
  enableTeamManagement: boolean;
  enableApiAccess: boolean;
}

export interface TenantSettings {
  mapDefaults: {
    center: [number, number];
    zoom: number;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
  api: {
    rateLimit: number;
  };
}

export interface TenantState {
  organizationId: string;
  divisionId?: string;
  branchId?: string;
  roles: string[];
  features: FeatureFlags;
  settings: TenantSettings;
  permissions: string[];
  isLoading: boolean;
  error: string | null;
}

export interface TenantContextType {
  tenant: TenantState;
  setTenant: Dispatch<SetStateAction<TenantState>>;
}

export type OrganizationRole = 'orgAdmin' | 'divisionAdmin' | 'branchAdmin' | 'territoryManager';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  scope?: {
    divisionId?: string;
    branchId?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription: {
    status: 'active' | 'inactive' | 'trial';
    expiresAt: Date;
    userLimit: number;
  };
  features: FeatureFlags;
  settings: TenantSettings;
}
