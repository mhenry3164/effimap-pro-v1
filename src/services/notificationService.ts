import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

class NotificationService {
  private notificationsRef = collection(db, 'notifications');
  private unsubscribeHandler: Unsubscribe | null = null;

  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const q = query(
      this.notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notification[];
  }

  async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      this.notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(this.notificationsRef, notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      this.notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(this.notificationsRef, {
      ...notification,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): void {
    if (this.unsubscribeHandler) {
      this.unsubscribeHandler();
    }

    const q = query(
      this.notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    this.unsubscribeHandler = onSnapshot(q, snapshot => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Notification[];
      callback(notifications);
    });
  }

  unsubscribe(): void {
    if (this.unsubscribeHandler) {
      this.unsubscribeHandler();
      this.unsubscribeHandler = null;
    }
  }

  // Helper method to create system notifications
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.createNotification({
      userId,
      title,
      message,
      type,
      read: false,
      metadata,
    });
  }
}

export const notificationService = new NotificationService();
