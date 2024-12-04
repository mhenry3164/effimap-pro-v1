import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { TenantMetadata } from '../types/tenant';

export type ActivityType = 
  | 'territory.create' 
  | 'territory.edit' 
  | 'territory.delete'
  | 'territory.assign'
  | 'branch.create'
  | 'branch.edit'
  | 'branch.delete'
  | 'user.create'
  | 'user.edit'
  | 'user.delete'
  | 'user.invite'
  | 'settings.update';

export type EntityType = 'territory' | 'branch' | 'user' | 'settings';

export interface Activity {
  id?: string;
  type: ActivityType;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  tenantId: string;
  timestamp: Date;
  metadata?: Partial<TenantMetadata>;
  details?: {
    previousState?: any;
    newState?: any;
    reason?: string;
    changes?: Record<string, { old: any; new: any; }>;
  };
}

export const activityService = {
  async logActivity(tenantId: string, activity: Omit<Activity, 'id' | 'timestamp' | 'metadata'>) {
    try {
      // Get current user's display name
      let userName = activity.userName;
      if (!userName && activity.userId) {
        const userDoc = await getDoc(doc(db, 'users', activity.userId));
        if (userDoc.exists()) {
          userName = userDoc.data().displayName || 'Unknown User';
        }
      }

      // Log to activities collection directly
      const activityRef = collection(db, 'activities');
      const newActivity = {
        ...activity,
        userName: userName || 'Unknown User',
        tenantId,
        timestamp: Timestamp.now(),
        metadata: {
          createdAt: Timestamp.now(),
          createdBy: activity.userId,
          version: 1
        }
      };

      const docRef = await addDoc(activityRef, newActivity);
      return docRef.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  async getRecentActivities(tenantId: string, limitCount = 10) {
    try {
      // Query the activities collection directly with tenantId filter
      const activitiesRef = collection(db, 'activities');
      const activitiesQuery = query(
        activitiesRef,
        where('tenantId', '==', tenantId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(activitiesQuery);
      if (snapshot.empty) {
        return [];
      }

      // Get all unique user IDs from activities
      const userIds = new Set(snapshot.docs.map(doc => doc.data().userId));
      const userDocs = await Promise.all(
        Array.from(userIds).map(async userId => {
          if (!userId) return null;
          const userDoc = await getDoc(doc(db, 'users', userId));
          return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
        })
      );

      // Create a map of user IDs to display names
      const userMap = new Map();
      userDocs.forEach(user => {
        if (user) {
          userMap.set(user.id, user.displayName || 'Unknown User');
        }
      });

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          userName: data.userName || userMap.get(data.userId) || 'Unknown User',
          timestamp: data.timestamp.toDate(),
          metadata: {
            ...data.metadata,
            createdAt: data.metadata?.createdAt?.toDate(),
            updatedAt: data.metadata?.updatedAt?.toDate()
          }
        };
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }
};
