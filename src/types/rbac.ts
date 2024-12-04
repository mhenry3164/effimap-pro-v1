export type ResourceType = 
  | 'organization' 
  | 'division' 
  | 'branch' 
  | 'territory' 
  | 'user' 
  | 'report' 
  | '*';  // Wildcard for full access

export type ActionType = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage' 
  | '*';  // Wildcard for all actions

export interface Permission {
  resource: ResourceType;
  action: ActionType;
  conditions?: {
    ownOnly?: boolean;
    divisionId?: string;
    branchId?: string;
    [key: string]: any;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'platform' | 'organization';
  permissions: Permission[];
  inherits?: string[]; // IDs of roles this role inherits from
  metadata?: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

// Helper type for role assignments
export interface UserRoleAssignment {
  roleId: string;
  scope?: {
    divisionId?: string;
    branchId?: string;
  };
  assignedAt: Date;
  assignedBy: string;
}
