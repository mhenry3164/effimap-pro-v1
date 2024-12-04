import { User } from './user';
import { Branch } from './branch';
import { Territory } from './territory';

export type SubscriptionTier = 'basic' | 'professional' | 'enterprise';

export interface OrganizationSettings {
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName: string;
  };
  mapDefaults: {
    center: [number, number];
    zoom: number;
    boundaryColors: {
      fill: string;
      stroke: string;
    };
  };
  territoryRules: {
    allowOverlap: boolean;
    requireApproval: boolean;
    autoAssignReps: boolean;
  };
  integrations: {
    enabled: string[];
    configurations: Record<string, any>;
  };
}

export interface Division {
  id: string;
  name: string;
  organizationId: string;
  adminIds: string[];
  branchIds: string[];
  settings: {
    regionalCenter: [number, number];
    customSettings: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  settings: OrganizationSettings;
  features: {
    enabled: string[];
    customFeatures: Record<string, any>;
  };
  adminIds: string[];
  divisions: Division[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastBillingDate: Date;
    status: 'active' | 'suspended' | 'cancelled';
  };
}
