import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { PermissionGate } from '../../PermissionGate';
import { useTenant } from '../../../providers/TenantProvider';
import { Suspense, lazy } from 'react';
import { Users, Building2, MapPin } from 'lucide-react';

// Lazy load components for better performance
const FeatureFlags = lazy(() => import('./FeatureFlags'));
const OrganizationSettings = lazy(() => import('./OrganizationSettings'));
const SubscriptionManager = lazy(() => import('./SubscriptionManager'));
const DashboardMetrics = lazy(() => import('./DashboardMetrics'));

const OrganizationDashboard: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Organization Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Subscription Status */}
          <Grid item xs={12}>
            <PermissionGate permission={{ resource: 'subscription', action: 'manage' }}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Suspense fallback={<div>Loading subscription details...</div>}>
                  <SubscriptionManager />
                </Suspense>
              </Paper>
            </PermissionGate>
          </Grid>

          {/* Dashboard Metrics */}
          <Grid item xs={12}>
            <Suspense fallback={<div>Loading dashboard metrics...</div>}>
              <DashboardMetrics />
            </Suspense>
          </Grid>

          {/* Feature Flags */}
          <Grid item xs={12} md={6}>
            <PermissionGate permission={{ resource: 'features', action: 'manage' }}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Suspense fallback={<div>Loading feature flags...</div>}>
                  <FeatureFlags />
                </Suspense>
              </Paper>
            </PermissionGate>
          </Grid>

          {/* Organization Settings */}
          <Grid item xs={12} md={6}>
            <PermissionGate permission={{ resource: 'settings', action: 'manage' }}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                <Suspense fallback={<div>Loading settings...</div>}>
                  <OrganizationSettings />
                </Suspense>
              </Paper>
            </PermissionGate>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default OrganizationDashboard;
