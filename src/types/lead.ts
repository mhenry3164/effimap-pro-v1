export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  notes?: string;
  assignedTo?: string;
  territoryId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
}
