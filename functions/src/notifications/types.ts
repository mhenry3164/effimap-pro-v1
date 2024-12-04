export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface NotificationMetadata {
  link?: string;
  territoryId?: string;
  userId?: string;
  tenantId?: string;
  scheduledTime?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
  createdAt: Date;
  read: boolean;
}
