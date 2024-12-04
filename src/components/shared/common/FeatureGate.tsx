import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSubscriptionFeatures, FeatureRestrictions } from '../../hooks/useSubscriptionFeatures';
import { Link as RouterLink } from 'react-router-dom';

interface FeatureGateProps {
  feature: keyof FeatureRestrictions;
  resourceCount?: number;
  resourceType?: 'users' | 'territories' | 'locations';
  children: React.ReactNode;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  resourceCount,
  resourceType,
  children,
}) => {
  const { checkFeatureAccess, isWithinLimits } = useSubscriptionFeatures();

  const hasAccess = checkFeatureAccess(feature);
  const withinLimits = resourceCount !== undefined && resourceType
    ? isWithinLimits(resourceType, resourceCount)
    : true;

  if (!hasAccess || !withinLimits) {
    return (
      <Box 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          border: '1px dashed #ccc',
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h6" gutterBottom>
          {!hasAccess 
            ? 'Feature Not Available'
            : 'Limit Reached'
          }
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {!hasAccess
            ? 'This feature requires a higher subscription tier.'
            : `You've reached the maximum number of ${resourceType} for your current plan.`
          }
        </Typography>
        <Button
          component={RouterLink}
          to="/organization/subscription"
          variant="contained"
          color="primary"
        >
          Upgrade Plan
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
