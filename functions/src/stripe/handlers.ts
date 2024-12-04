import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from '../utils/admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

async function updateSubscriptionInFirestore(
  tenantId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const tenantRef = db.collection('tenants').doc(tenantId);
  
  await tenantRef.update({
    'subscription.status': subscription.status,
    'subscription.currentPeriodEnd': subscription.current_period_end,
    'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
    'subscription.stripeSubscriptionId': subscription.id
  });
}

export const createCustomer = async (
  email: string,
  tenantId: string,
  metadata: Record<string, string> = {}
) => {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      tenantId,
      ...metadata,
    },
  });

  await db.collection('tenants').doc(tenantId).update({
    stripeCustomerId: customer.id,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return customer;
};

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { priceId, tenantId } = data;
  const tenantDoc = await db.collection('tenants').doc(tenantId).get();
  const tenant = tenantDoc.data();

  if (!tenant) {
    throw new functions.https.HttpsError('not-found', 'Tenant not found');
  }

  let customer: string;

  if (tenant.stripeCustomerId) {
    customer = tenant.stripeCustomerId;
  } else {
    // Create new customer
    const customerData = await stripe.customers.create({
      email: tenant.ownerEmail,
      metadata: {
        tenantId,
        firebaseUid: context.auth.uid
      }
    });
    customer = customerData.id;

    // Update tenant with customer ID
    await tenantDoc.ref.update({
      stripeCustomerId: customer
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: priceId === 'basic-monthly' ? 14 : undefined,
      metadata: {
        tenantId,
      }
    },
    success_url: `${functions.config().app.url}/settings/subscription?success=true`,
    cancel_url: `${functions.config().app.url}/settings/subscription?canceled=true`,
  });

  return { url: session.url };
});

export const createPortalSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to access billing portal'
    );
  }

  const { tenantId } = data;
  const tenantDoc = await db.collection('tenants').doc(tenantId).get();
  const tenant = tenantDoc.data();

  if (!tenant?.stripeCustomerId) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'No Stripe customer found for this tenant'
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${functions.config().app.url}/settings/subscription`,
  });

  return { url: session.url };
});

export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      res.status(400).send('No signature found');
      return;
    }

    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantDoc = await db.collection('tenants')
          .where('subscription.stripeSubscriptionId', '==', subscription.id)
          .get();

        if (!tenantDoc.empty) {
          await updateSubscriptionInFirestore(tenantDoc.docs[0].id, subscription);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const tenantDoc = await db.collection('tenants')
            .where('subscription.stripeSubscriptionId', '==', invoice.subscription)
            .get();

          if (!tenantDoc.empty) {
            await tenantDoc.docs[0].ref.update({
              'subscription.status': 'active',
              'subscription.lastPayment': admin.firestore.Timestamp.now()
            });
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const tenantDoc = await db.collection('tenants')
            .where('subscription.stripeSubscriptionId', '==', invoice.subscription)
            .get();

          if (!tenantDoc.empty) {
            await tenantDoc.docs[0].ref.update({
              'subscription.status': 'past_due'
            });
          }
        }
        break;
      }
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const trialEnd = subscription.trial_end;
        if (trialEnd) {
          const tenantDoc = await db.collection('tenants')
            .where('subscription.stripeSubscriptionId', '==', subscription.id)
            .get();

          if (!tenantDoc.empty) {
            await tenantDoc.docs[0].ref.update({
              'subscription.trialEnding': true,
              'subscription.trialEndDate': new Date(trialEnd * 1000)
            });
          }
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: unknown) {
    console.error('Stripe webhook error:', error);
    if (error instanceof Error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    } else {
      res.status(400).send('Webhook Error: Unknown error occurred');
    }
  }
});
