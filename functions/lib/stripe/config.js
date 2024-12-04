"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_PLANS = exports.stripe = exports.STRIPE_CONFIG = void 0;
const stripe_1 = require("stripe");
const functions = require("firebase-functions");
if (!((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key)) {
    throw new Error('Missing Stripe secret key in Firebase Functions config');
}
if (!((_b = functions.config().stripe) === null || _b === void 0 ? void 0 : _b.publishable_key)) {
    throw new Error('Missing Stripe publishable key in Firebase Functions config');
}
exports.STRIPE_CONFIG = {
    SECRET_KEY: functions.config().stripe.secret_key,
    PUBLISHABLE_KEY: functions.config().stripe.publishable_key,
};
exports.stripe = new stripe_1.default(exports.STRIPE_CONFIG.SECRET_KEY, {
    apiVersion: '2023-10-16',
});
exports.SUBSCRIPTION_PLANS = {
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
};
//# sourceMappingURL=config.js.map