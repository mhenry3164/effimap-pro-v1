import { useMemo } from 'react';
import { useTenant } from '../providers/TenantProvider';
import { SUBSCRIPTION_PLANS } from '../config/stripe';

export interface FeatureRestrictions {
  maxUsers: number;
  maxTerritories: number;
  maxLocations: number;
  hasAdvancedMapping: boolean;
  hasApiAccess: boolean;
  hasCustomBranding: boolean;
  hasExportCapabilities: boolean;
  hasRealTimeUpdates: boolean;
  dataVisualization: 'basic' | 'advanced';
  supportLevel: 'standard' | 'priority';
}

export function useSubscriptionFeatures() {
  const { tenant } = useTenant();

  const features = useMemo(() => {
    // Handle legacy tenants
    if (tenant?.billing?.type === 'legacy') {
      const plan = tenant.billing.legacyAccess?.plan || 'basic';
      return {
        ...SUBSCRIPTION_PLANS[plan.toUpperCase()].limits,
        // Legacy enterprise gets unlimited everything
        ...(plan === 'enterprise' && {
          users: -1,
          territories: -1,
          locations: -1
        })
      };
    }

    // Handle regular subscriptions
    const plan = tenant?.subscription?.plan || 'basic';
    return {
      ...SUBSCRIPTION_PLANS[plan.toUpperCase()].limits,
      // Regular enterprise also gets unlimited everything
      ...(plan === 'enterprise' && {
        users: -1,
        territories: -1,
        locations: -1
      })
    };
  }, [tenant?.billing?.type, tenant?.billing?.legacyAccess?.plan, tenant?.subscription?.plan]);

  const checkFeatureAccess = (feature: keyof FeatureRestrictions) => {
    // Enterprise and legacy enterprise always have access to all features
    if (
      (tenant?.billing?.type === 'legacy' && tenant?.billing?.legacyAccess?.plan === 'enterprise') ||
      tenant?.subscription?.plan === 'enterprise'
    ) {
      return true;
    }

    if (typeof features[feature] === 'boolean') {
      return features[feature];
    }
    return true;
  };

  const isWithinLimits = (resource: 'users' | 'territories' | 'locations', count: number) => {
    // Enterprise and legacy enterprise have no limits
    if (
      (tenant?.billing?.type === 'legacy' && tenant?.billing?.legacyAccess?.plan === 'enterprise') ||
      tenant?.subscription?.plan === 'enterprise'
    ) {
      return true;
    }

    const limits = {
      users: features.maxUsers,
      territories: features.maxTerritories,
      locations: features.maxLocations,
    };

    const limit = limits[resource];
    return limit === -1 || count <= limit;
  };

  return {
    features,
    checkFeatureAccess,
    isWithinLimits,
  };
}
