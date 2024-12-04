import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Skeleton,
} from '@mui/material';
import { useTenant } from '../../../providers/TenantProvider';
import { useRBAC } from '../../../hooks/useRBAC';

interface Feature {
  key: string;
  name: string;
  description: string;
  requiresPlan?: 'professional' | 'enterprise';
}

const features: Feature[] = [
  {
    key: 'enableAdvancedMapping',
    name: 'Advanced Mapping',
    description: 'Enable advanced territory mapping features',
    requiresPlan: 'professional',
  },
  {
    key: 'enableAnalytics',
    name: 'Analytics',
    description: 'Access to detailed analytics and reporting',
    requiresPlan: 'professional',
  },
  {
    key: 'enableCustomBoundaries',
    name: 'Custom Boundaries',
    description: 'Create and manage custom territory boundaries',
    requiresPlan: 'enterprise',
  },
  {
    key: 'enableTeamManagement',
    name: 'Team Management',
    description: 'Advanced team and role management features',
    requiresPlan: 'professional',
  },
  {
    key: 'enableApiAccess',
    name: 'API Access',
    description: 'Access to the EffiMap Pro API',
    requiresPlan: 'enterprise',
  },
];

const FeatureFlags: React.FC = () => {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const { loading: rbacLoading } = useRBAC();
  const [updateStatus, setUpdateStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleFeatureToggle = async (featureKey: string) => {
    try {
      // TODO: Implement feature toggle logic with Firebase
      setUpdateStatus({
        type: 'success',
        message: 'Feature updated successfully',
      });
    } catch (error) {
      setUpdateStatus({
        type: 'error',
        message: 'Failed to update feature. Please try again.',
      });
    }
  };

  if (tenantLoading || rbacLoading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Feature Management
        </Typography>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={60} sx={{ my: 1 }} />
        ))}
      </Box>
    );
  }

  if (tenantError || !tenant) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Feature Management
        </Typography>
        <Alert severity="error">
          {tenantError?.message || 'Failed to load tenant information'}
        </Alert>
      </Box>
    );
  }

  const currentPlan = tenant.subscription?.plan || 'basic';

  // Helper function to check if current plan meets required plan level
  const isPlanSufficient = (requiredPlan?: 'professional' | 'enterprise') => {
    if (!requiredPlan) return true;
    
    switch (currentPlan) {
      case 'enterprise':
        return true; // Enterprise has access to all features
      case 'professional':
        return requiredPlan === 'professional'; // Professional only has access to professional features
      default:
        return false; // Basic has no access to premium features
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Feature Management
      </Typography>
      
      {updateStatus && (
        <Alert 
          severity={updateStatus.type}
          onClose={() => setUpdateStatus(null)}
          sx={{ mb: 2 }}
        >
          {updateStatus.message}
        </Alert>
      )}

      <List>
        {features.map((feature) => {
          const isFeatureEnabled = tenant.features?.[feature.key] || false;
          const hasPlanAccess = isPlanSufficient(feature.requiresPlan);

          return (
            <ListItem
              key={feature.key}
              divider
              sx={{
                opacity: hasPlanAccess ? 1 : 0.5,
              }}
            >
              <ListItemText
                primary={feature.name}
                secondary={
                  <>
                    {feature.description}
                    {feature.requiresPlan && !hasPlanAccess && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ display: 'block', color: 'warning.main' }}
                      >
                        Requires {feature.requiresPlan} plan
                      </Typography>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={isFeatureEnabled}
                  onChange={() => handleFeatureToggle(feature.key)}
                  disabled={!hasPlanAccess}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default FeatureFlags;
