import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { NotificationType } from './types';

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
  createdAt: admin.firestore.Timestamp;
  read: boolean;
}

/**
 * Creates a notification for a user
 */
const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
  metadata?: Record<string, any>
) => {
  const notificationData: NotificationData = {
    userId,
    title,
    message,
    type,
    metadata,
    createdAt: admin.firestore.Timestamp.now(),
    read: false,
  };

  await admin
    .firestore()
    .collection('notifications')
    .add(notificationData);
};

/**
 * Triggered when a territory is assigned to a user
 */
export const onTerritoryAssignment = functions.firestore
  .document('territories/{territoryId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Check if assignedTo field has changed
    if (newData.assignedTo !== previousData.assignedTo && newData.assignedTo) {
      await createNotification(
        newData.assignedTo,
        'New Territory Assignment',
        `You have been assigned to territory ${newData.name}`,
        'info',
        {
          territoryId: context.params.territoryId,
          link: `/territories/${context.params.territoryId}`,
        }
      );
    }
  });

/**
 * Triggered when a user's role changes
 */
export const onUserRoleChange = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    if (newData.role !== previousData.role) {
      await createNotification(
        context.params.userId,
        'Role Update',
        `Your role has been updated to ${newData.role}`,
        'info',
        {
          userId: context.params.userId,
          link: '/profile',
        }
      );
    }
  });

/**
 * Triggered when a subscription status changes
 */
export const onSubscriptionChange = functions.firestore
  .document('tenants/{tenantId}/subscription/status')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    if (newData.status !== previousData.status) {
      const tenant = await admin
        .firestore()
        .collection('tenants')
        .doc(context.params.tenantId)
        .get();

      const adminUsers = tenant.data()?.admins || [];

      // Notify all admin users
      await Promise.all(
        adminUsers.map((adminId: string) =>
          createNotification(
            adminId,
            'Subscription Update',
            `Your subscription status has changed to ${newData.status}`,
            newData.status === 'active' ? 'success' : 'warning',
            {
              tenantId: context.params.tenantId,
              link: '/settings/subscription',
            }
          )
        )
      );
    }
  });

/**
 * Triggered when system updates or maintenance is scheduled
 */
export const sendSystemUpdateNotification = functions.https.onCall(
  async (data, context) => {
    if (!context.auth?.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can send system update notifications'
      );
    }

    const { message, scheduledTime, affectedUsers } = data;

    // Send notifications to affected users
    await Promise.all(
      affectedUsers.map((userId: string) =>
        createNotification(
          userId,
          'System Update',
          message,
          'warning',
          {
            scheduledTime,
            link: '/system-status',
          }
        )
      )
    );
  }
);

/**
 * Cleanup old notifications (older than 30 days)
 */
export const cleanupOldNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const oldNotifications = await admin
      .firestore()
      .collection('notifications')
      .where('createdAt', '<', thirtyDaysAgo)
      .get();

    const batch = admin.firestore().batch();
    oldNotifications.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  });
