export interface TenantSubscription {
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCustomerId?: string;
  limits: {
    users: number;
    storage: number;
    features: string[];
  };
}
