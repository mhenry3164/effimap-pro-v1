import { PlatformRole, OrganizationRole } from './roles';

export interface NotificationPreferences {
  email: {
    assignments: boolean;
    updates: boolean;
    reminders: boolean;
    security: boolean;
  };
  push: {
    assignments: boolean;
    updates: boolean;
    reminders: boolean;
    security: boolean;
  };
  sms: {
    assignments: boolean;
    security: boolean;
  };
}

export interface User {
  uid: string;
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  title?: string;
  department?: string;
  location?: string;
  platformRole?: PlatformRole;
  tenantId?: string;
  divisionId?: string;
  branchId?: string;
  organizationId?: string;
  organizationRoles?: OrganizationRole[];
  settings?: {
    defaultMapCenter?: [number, number];
    defaultMapZoom?: number;
    theme?: 'light' | 'dark';
    twoFactorEnabled?: boolean;
    notificationPreferences?: NotificationPreferences;
  };
  metadata?: {
    createdAt: any;
    updatedAt: any;
    lastLoginAt?: any;
    status: 'active' | 'inactive' | 'suspended';
  };
}
