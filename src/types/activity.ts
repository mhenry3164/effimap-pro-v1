export interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'territory' | 'branch' | 'representative';
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details?: {
    [key: string]: any;
  };
}
