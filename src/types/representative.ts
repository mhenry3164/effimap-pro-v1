import { Timestamp } from 'firebase/firestore';

export interface Representative {
  id: string;
  displayName: string;
  email: string;
  divisionId: string;
  organizationRoles: string[];
  permissions: string[];
  tenantId: string;
  metadata: {
    createdAt: Timestamp;
    createdBy: string;
    updatedAt: Timestamp;
    updatedBy: string;
  };
}

// Used for creating/updating representatives
export interface RepresentativeInput {
  displayName: string;
  email: string;
  divisionId: string;
  organizationRoles?: string[];
  permissions?: string[];
}
