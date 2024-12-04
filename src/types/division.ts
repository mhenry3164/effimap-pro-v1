import { Timestamp } from 'firebase/firestore';

export interface Division {
  id: string;
  code: string;
  name: string;
  status: string;
  tenantId?: string;
  metadata: {
    createdAt: Timestamp;
    createdBy: string;
    updatedAt: Timestamp;
    updatedBy: string;
  };
}

// Used for creating/updating divisions
export interface DivisionInput {
  code: string;
  name: string;
  status?: string;
}
