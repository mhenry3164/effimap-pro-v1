import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG, SUBSCRIPTION_PLANS, type SubscriptionTier, type TenantSubscription } from '../config/stripe';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

export const useSubscription = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!user?.organizationId) {
                setSubscription(null);
                setLoading(false);
                return;
            }

            // In development, provide a mock subscription
            if (process.env.NODE_ENV === 'development') {
                setSubscription({
                    status: 'active',
                    tier: 'BASIC',
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    priceId: SUBSCRIPTION_PLANS.BASIC.monthlyPriceId,
                    billingInterval: 'monthly'
                });
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/subscription/status?organizationId=${user.organizationId}`);
                if (!response.ok) {
                    // Check if the response is HTML (error page)
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('text/html')) {
                        throw new Error('API endpoint not available. Are you running in development mode?');
                    }
                    throw new Error('Failed to fetch subscription status');
                }
                const data = await response.json();
                setSubscription(data);
            } catch (err) {
                console.error('Subscription fetch error:', err);
                // In development, don't show the error to the user
                if (process.env.NODE_ENV !== 'development') {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [user]);

    const createCheckoutSession = async (tier: SubscriptionTier, billingInterval: 'monthly' | 'annual') => {
        if (!user?.organizationId) {
            throw new Error('User must be logged in and associated with an organization to create a subscription');
        }

        const priceId = billingInterval === 'monthly' 
            ? SUBSCRIPTION_PLANS[tier].monthlyPriceId 
            : SUBSCRIPTION_PLANS[tier].annualPriceId;

        const response = await fetch('/api/subscription/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId,
                organizationId: user.organizationId,
                successUrl: window.location.origin + '/dashboard?session_id={CHECKOUT_SESSION_ID}',
                cancelUrl: window.location.origin + '/pricing',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const { sessionId } = await response.json();
        const stripe = await stripePromise;
        if (!stripe) {
            throw new Error('Stripe failed to load');
        }

        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
            throw error;
        }
    };

    const createCustomerPortalSession = async () => {
        if (!user?.organizationId) {
            throw new Error('User must be logged in and associated with an organization to access customer portal');
        }

        const response = await fetch('/api/subscription/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organizationId: user.organizationId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create customer portal session');
        }

        const { url } = await response.json();
        window.location.href = url;
    };

    return {
        subscription,
        loading,
        error,
        createCheckoutSession,
        createCustomerPortalSession,
    };
};
