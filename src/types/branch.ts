import { Timestamp } from 'firebase/firestore';

export interface Branch {
  id: string;
  code: string;
  name: string;
  status: string;
  divisionId: string;
  manager: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  metadata: {
    createdAt: Timestamp;
    createdBy: string;
    updatedAt: Timestamp;
    updatedBy: string;
  };
  tenantId?: string;
}

export interface BranchInput {
  code: string;
  name: string;
  status?: string;
  divisionId: string;
  manager: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}
