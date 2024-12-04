import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from '../utils/admin';
import { sendEmail } from '../utils/email';

interface Invitation {
  email: string;
  role: string;
  tenantId: string;
  inviterId: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: admin.firestore.Timestamp;
  expiresAt: admin.firestore.Timestamp;
}

export const createInvitation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to create invitations'
    );
  }

  const { email, role, tenantId } = data;
  if (!email || !role || !tenantId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields'
    );
  }

  // Check if tenant exists and user has permission
  const tenantDoc = await db.collection('tenants').doc(tenantId).get();
  if (!tenantDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Tenant not found');
  }

  const tenant = tenantDoc.data();
  if (!tenant) {
    throw new functions.https.HttpsError('not-found', 'Tenant data not found');
  }

  const currentUserCount = (await db.collection('users')
    .where('tenantId', '==', tenantId)
    .count()
    .get()).data().count;

  // Check user limit based on subscription
  const maxUsers = tenant.subscription?.maxUsers || 5; // Default to 5 users for basic plan
  if (currentUserCount >= maxUsers) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'User limit reached for current subscription plan'
    );
  }

  // Create invitation
  const inviteCode = generateInviteCode();
  const inviteUrl = `${functions.config().app.url}/invite/${inviteCode}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const invitation: Invitation = {
    email,
    role,
    tenantId,
    inviterId: context.auth.uid,
    status: 'pending',
    createdAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
  };

  await db.collection('invitations').doc(inviteCode).set(invitation);

  // Send invitation email
  await sendEmail({
    to: email,
    subject: `Invitation to join ${tenant.name}`,
    template: 'user-invitation',
    data: {
      inviteUrl,
      role,
      organizationName: tenant.name,
      inviterName: context.auth.token.name || 'A team member'
    }
  });

  return { success: true, inviteCode };
});

export const acceptInvitation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to accept invitation'
    );
  }

  const { inviteCode } = data;
  const inviteDoc = await db.collection('invitations').doc(inviteCode).get();

  if (!inviteDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Invitation not found');
  }

  const invite = inviteDoc.data() as Invitation;
  if (invite.status !== 'pending') {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invitation is no longer valid'
    );
  }

  if (invite.expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Invitation has expired'
    );
  }

  if (invite.email !== context.auth.token.email) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Invitation is for a different email address'
    );
  }

  // Add user to tenant
  await db.collection('users').doc(context.auth.uid).update({
    tenantId: invite.tenantId,
    role: invite.role
  });

  // Mark invitation as accepted
  await inviteDoc.ref.update({
    status: 'accepted',
    acceptedAt: admin.firestore.Timestamp.now()
  });

  return { success: true };
});

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}
