import { env } from './env';

export const STRIPE_CONFIG = {
    PUBLISHABLE_KEY: env.STRIPE_PUBLISHABLE_KEY,
};

export const SUBSCRIPTION_PLANS = {
    BASIC: {
        name: 'EffiMap Basic',
        monthlyPriceId: 'prod_RHRUFDfTuy9efW',
        annualPriceId: 'prod_RHRXEs3b4p7Gqn',
        pricing: {
            monthly: 99,
            annual: 950,
        },
        description: 'Territory management and visualization platform with essential mapping features. Perfect for small sales teams and single location businesses.',
        features: [
            'Up to 5 users',
            'Basic territory mapping',
            'Customer location plotting',
            'Basic reporting',
            'Email support',
        ],
        limits: {
            users: 5,
            storage: 5, // GB
            apiCalls: 10000, // per month
        },
    },
    PROFESSIONAL: {
        name: 'EffiMap Professional',
        monthlyPriceId: 'prod_RHRYkFGh8j9Kpq',
        annualPriceId: 'prod_RHRZmNqP3v2Wxy',
        pricing: {
            monthly: 199,
            annual: 1990,
        },
        description: 'Advanced territory management with powerful analytics and collaboration features. Ideal for growing businesses with multiple territories.',
        features: [
            'Up to 20 users',
            'Advanced territory mapping',
            'Real-time collaboration',
            'Advanced analytics',
            'API access',
            'Priority support',
        ],
        limits: {
            users: 20,
            storage: 20, // GB
            apiCalls: 50000, // per month
        },
    },
    ENTERPRISE: {
        name: 'EffiMap Enterprise',
        monthlyPriceId: 'prod_RHRaoBcD4e5Fgh',
        annualPriceId: 'prod_RHRbpQrS6t7Uvw',
        pricing: {
            monthly: 499,
            annual: 4990,
        },
        description: 'Enterprise-grade territory management solution with unlimited capabilities. Perfect for large organizations with complex territory structures.',
        features: [
            'Unlimited users',
            'Custom territory hierarchies',
            'Advanced security features',
            'Custom integrations',
            'Dedicated support',
            'SLA guarantees',
        ],
        limits: {
            users: -1, // unlimited
            storage: 100, // GB
            apiCalls: 200000, // per month
        },
    },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[SubscriptionTier];

export interface TenantSubscription {
    tier: SubscriptionTier;
    billingInterval: 'monthly' | 'annual';
    status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    trialEndDate?: Date;
    trialEnding?: boolean;
}
