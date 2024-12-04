"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptInvitation = exports.createInvitation = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const admin_1 = require("../utils/admin");
const email_1 = require("../utils/email");
exports.createInvitation = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to create invitations');
    }
    const { email, role, tenantId } = data;
    if (!email || !role || !tenantId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    // Check if tenant exists and user has permission
    const tenantDoc = await admin_1.db.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Tenant not found');
    }
    const tenant = tenantDoc.data();
    if (!tenant) {
        throw new functions.https.HttpsError('not-found', 'Tenant data not found');
    }
    const currentUserCount = (await admin_1.db.collection('users')
        .where('tenantId', '==', tenantId)
        .count()
        .get()).data().count;
    // Check user limit based on subscription
    const maxUsers = ((_a = tenant.subscription) === null || _a === void 0 ? void 0 : _a.maxUsers) || 5; // Default to 5 users for basic plan
    if (currentUserCount >= maxUsers) {
        throw new functions.https.HttpsError('resource-exhausted', 'User limit reached for current subscription plan');
    }
    // Create invitation
    const inviteCode = generateInviteCode();
    const inviteUrl = `${functions.config().app.url}/invite/${inviteCode}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    const invitation = {
        email,
        role,
        tenantId,
        inviterId: context.auth.uid,
        status: 'pending',
        createdAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
    };
    await admin_1.db.collection('invitations').doc(inviteCode).set(invitation);
    // Send invitation email
    await (0, email_1.sendEmail)({
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
exports.acceptInvitation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to accept invitation');
    }
    const { inviteCode } = data;
    const inviteDoc = await admin_1.db.collection('invitations').doc(inviteCode).get();
    if (!inviteDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Invitation not found');
    }
    const invite = inviteDoc.data();
    if (invite.status !== 'pending') {
        throw new functions.https.HttpsError('failed-precondition', 'Invitation is no longer valid');
    }
    if (invite.expiresAt.toDate() < new Date()) {
        throw new functions.https.HttpsError('failed-precondition', 'Invitation has expired');
    }
    if (invite.email !== context.auth.token.email) {
        throw new functions.https.HttpsError('permission-denied', 'Invitation is for a different email address');
    }
    // Add user to tenant
    await admin_1.db.collection('users').doc(context.auth.uid).update({
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
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
//# sourceMappingURL=invitations.js.map