import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  Check as CheckIcon,
  Warning as WarningIcon,
  AccountCircle as UserIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useTenant } from '../../../providers/TenantProvider';
import { useRBAC } from '../../../hooks/useRBAC';
import { useSubscription } from '../../../hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '../../../config/stripe';
import { format, differenceInDays } from 'date-fns';
import ErrorBoundary from '../../../components/ErrorBoundary';

interface Plan {
  id: string;
  name: string;
  features: string[];
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
  };
  pricing: {
    monthly: number;
    annual: number;
  };
  monthlyPriceId: string;
  annualPriceId: string;
  description: string;
  trial: {
    days: number;
  };
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    features: [
      'Basic territory mapping',
      'Up to 5 users',
      'Standard support',
      'Basic analytics',
    ],
    limits: {
      users: 5,
      storage: 5,
      apiCalls: 1000,
    },
    pricing: {
      monthly: 29,
      annual: 290,
    },
    monthlyPriceId: 'price_1K9R4iG3LxP3NzXwzj6bW7Iq',
    annualPriceId: 'price_1K9R4iG3LxP3NzXwzj6bW7Iq',
    description: 'Our basic plan is perfect for small teams and individuals.',
    trial: {
      days: 14,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    features: [
      'Advanced territory mapping',
      'Up to 20 users',
      'Priority support',
      'Advanced analytics',
      'Custom boundaries',
      'API access',
    ],
    limits: {
      users: 20,
      storage: 20,
      apiCalls: 10000,
    },
    pricing: {
      monthly: 99,
      annual: 990,
    },
    monthlyPriceId: 'price_1K9R4iG3LxP3NzXwzj6bW7Iq',
    annualPriceId: 'price_1K9R4iG3LxP3NzXwzj6bW7Iq',
    description: 'Our professional plan is perfect for growing teams and businesses.',
    trial: {
      days: 14,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    features: [
      'Unlimited territory mapping',
      'Unlimited users',
      '24/7 support',
      'Custom analytics',
      'Custom integrations',
      'Dedicated account manager',
    ],
    limits: {
      users: -1,
      storage: 100,
      apiCalls: 100000,
    },
    pricing: {
      monthly: 499,
      annual: 4990,
    },
    monthlyPriceId: 'price_1K9R4iG3LxP3NzXwzj6bW7Iq',
    annualPriceId: 'price_1K9R4iG3LxP3NzXwzj6bW7Iq',
    description: 'Our enterprise plan is perfect for large businesses and organizations.',
    trial: {
      days: 14,
    },
  },
];

const SubscriptionManager: React.FC = () => {
  const { tenant, loading: tenantLoading } = useTenant();
  const { loading: rbacLoading, hasPermission: checkPermission } = useRBAC('subscription.manage');
  const { loading: subscriptionLoading, error: subscriptionError, createCheckoutSession, createPortalSession } = useSubscription();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [canManageSubscription, setCanManageSubscription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscriptionPermission = async () => {
      try {
        setCanManageSubscription(checkPermission);
      } catch (err) {
        console.error('Error checking subscription permission:', err);
        setError(typeof err === 'string' ? err : err instanceof Error ? err.message : 'Failed to check permissions');
      }
    };
    checkSubscriptionPermission();
  }, [checkPermission]);

  // Show loading state
  if (tenantLoading || loading || rbacLoading || subscriptionLoading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Subscription Management
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  // Show error state
  if (error || subscriptionError || !tenant) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Subscription Management
        </Typography>
        <Alert severity="error">
          {error || (subscriptionError instanceof Error ? subscriptionError.message : 'Failed to load subscription data')}
        </Alert>
      </Box>
    );
  }

  // Handle legacy tenants
  if (tenant.billing?.type === 'legacy') {
    const features = [
      { key: 1, name: 'Legacy Feature 1', description: 'This is a legacy feature' },
      { key: 2, name: 'Legacy Feature 2', description: 'This is another legacy feature' },
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Legacy Access
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Your organization has legacy access to {tenant.billing.legacyAccess?.plan || 'enterprise'} features.
          {tenant.billing.legacyAccess?.reason && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Reason: {tenant.billing.legacyAccess.reason}
            </Typography>
          )}
          {tenant.billing.legacyAccess?.expiryDate && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Valid until: {new Date(tenant.billing.legacyAccess.expiryDate).toLocaleDateString()}
            </Typography>
          )}
        </Alert>
        <List>
          {features.map((feature) => (
            <ListItem key={feature.key}>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={feature.name}
                secondary={feature.description}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }

  const isTrialing = tenant.subscription?.status === 'trialing';
  const trialEnding = tenant.subscription?.trialEnding;
  const trialDaysLeft = tenant.subscription?.trialEndDate 
    ? differenceInDays(new Date(tenant.subscription.trialEndDate), new Date())
    : 0;

  const isLoading = loading || rbacLoading || subscriptionLoading;
  const displayError = error || (subscriptionError instanceof Error ? subscriptionError.message : subscriptionError);

  const handleSubscribe = async (priceId: string) => {
    if (!canManageSubscription) return;
    
    setLoading(true);
    setError(null);
    try {
      await createCheckoutSession(priceId);
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!canManageSubscription) return;
    
    setLoading(true);
    setError(null);
    try {
      await createPortalSession();
    } catch (err) {
      console.error('Error creating portal session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create portal session');
    } finally {
      setLoading(false);
    }
  };

  const renderTrialBanner = () => {
    if (!isTrialing) return null;

    return (
      <Alert 
        severity={trialEnding ? "warning" : "info"}
        sx={{ mb: 3 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.BASIC.monthlyPriceId)}
          >
            Upgrade Now
          </Button>
        }
      >
        {trialEnding 
          ? `Your trial ends in ${trialDaysLeft} days. Upgrade now to keep access to all features.`
          : `You're currently on a ${SUBSCRIPTION_PLANS.BASIC.trial.days}-day trial. Explore all our basic features!`
        }
      </Alert>
    );
  };

  const renderCurrentPlan = () => {
    if (!tenant.subscription || isTrialing) return null;

    const currentPlan = Object.values(SUBSCRIPTION_PLANS).find(
      plan => 'pricing' in plan && (
        plan.monthlyPriceId === tenant.subscription?.priceId ||
        plan.annualPriceId === tenant.subscription?.priceId
      )
    );

    if (!currentPlan) return null;

    return (
      <Paper elevation={0} sx={{ mb: 4, p: 3, border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Plan: {currentPlan.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tenant.subscription.billingInterval === 'monthly' ? 'Monthly' : 'Annual'} billing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next payment: {format(new Date(tenant.subscription.currentPeriodEnd), 'PP')}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleManageSubscription}
            disabled={loading || !canManageSubscription}
          >
            Manage Plan
          </Button>
        </Box>
      </Paper>
    );
  };

  const handleBillingIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInterval(event.target.value as 'monthly' | 'annual');
  };

  const getPriceDisplay = (plan: Plan) => {
    const price = plan.pricing[billingInterval];
    const interval = billingInterval === 'monthly' ? '/mo' : '/yr';
    return `$${price}${interval}`;
  };

  const renderPlanCard = (plan: Plan) => (
    <Grid item xs={12} md={4} key={plan.id}>
      <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid #e0e0e0' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <Typography variant="h6" gutterBottom>
            {plan.name}
          </Typography>
          
          <Typography variant="h4" color="primary" gutterBottom>
            {getPriceDisplay(plan)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {plan.description}
          </Typography>

          <List>
            {plan.features.map((feature, index) => (
              <ListItem key={index} dense>
                <ListItemIcon>
                  <CheckIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>

          <Box mt="auto" pt={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => handleSubscribe(billingInterval === 'monthly' ? plan.monthlyPriceId : plan.annualPriceId)}
              disabled={loading || !canManageSubscription}
            >
              {tenant.subscription?.tier === plan.name ? 'Current Plan' : 'Subscribe'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <ErrorBoundary>
      <Box>
        <Typography variant="h5" gutterBottom>
          Subscription Plans
        </Typography>
        
        {displayError && typeof displayError === 'string' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {displayError}
          </Alert>
        )}
        
        {renderTrialBanner()}
        {renderCurrentPlan()}

        {isLoading && <LinearProgress sx={{ mb: 3 }} />}

        <Box mb={4}>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={billingInterval}
              onChange={handleBillingIntervalChange}
            >
              <FormControlLabel
                value="monthly"
                control={<Radio />}
                label="Monthly billing"
              />
              <FormControlLabel
                value="annual"
                control={<Radio />}
                label="Annual billing (save up to 20%)"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {Object.values(SUBSCRIPTION_PLANS).map((plan) => renderPlanCard(plan))}
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

export default SubscriptionManager;
