import { Timestamp } from 'firebase/firestore';

export type PlatformRole = 
  | 'platformAdmin'
  | 'supportAdmin'
  | 'supportAgent';

export type OrganizationRole =
  | 'orgAdmin'
  | 'divisionAdmin'
  | 'branchAdmin'
  | 'territoryManager'
  | 'salesRepresentative'
  | 'viewer';

export type RoleScope = 'platform' | 'organization' | 'division' | 'branch' | 'territory';

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'assign'
  | 'view';

export type PermissionResource = 
  | 'territories'
  | 'users'
  | 'roles'
  | 'organizations'
  | 'divisions'
  | 'branches'
  | 'reports'
  | 'settings';

export interface Permission {
  id: string;
  name: string;
  description: string;
  scope: RoleScope;
  action: PermissionAction;
  resource: PermissionResource;
  conditions?: Record<string, any>;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  organizationId?: string; // Null for platform roles
  permissions: string[]; // Permission IDs
  isCustom: boolean;
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
    version: number;
  };
}

export interface UserRole {
  userId: string;
  organizationId: string;
  roles: (PlatformRole | OrganizationRole)[];
  divisionIds?: string[];
  branchIds?: string[];
  territoryIds?: string[];
  permissions?: string[]; // Additional custom permissions
  metadata: {
    assignedAt: Timestamp;
    assignedBy: string;
    lastUpdated: Timestamp;
    expiresAt?: Timestamp;
  };
}

export interface RoleAssignment {
  roleId: string;
  userId: string;
  scope: RoleScope;
  scopeId: string;
  assignedBy: string;
  assignedAt: Timestamp;
  expiresAt?: Timestamp;
}

// Helper type to check if a user has required permissions
export type RequiredPermissions = {
  action: PermissionAction;
  resource: PermissionResource;
  scope: RoleScope;
}[];
