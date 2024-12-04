import React, { useEffect, useState, useCallback } from 'react';
import { Paper, Grid, Typography, CircularProgress, Box, useTheme } from '@mui/material';
import { SummaryCard } from '../SummaryCard';
import { PeopleOutline, MapOutlined, BusinessOutlined, GroupWorkOutlined } from '@mui/icons-material';
import { useTenant } from '../../contexts/TenantContext';
import { dashboardService } from '../../services/dashboardService';

interface DashboardMetrics {
  totalTerritories: number;
  activeRepresentatives: number;
  totalUsers: number;
  totalBranches: number;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

export const DashboardMetrics: React.FC = () => {
  const { tenant } = useTenant();
  const theme = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTerritories: 0,
    activeRepresentatives: 0,
    totalUsers: 0,
    totalBranches: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!tenant?.id) {
      console.log('DashboardMetrics - No tenant ID available');
      setLoading(false);
      return;
    }

    try {
      console.log('DashboardMetrics - Fetching metrics for tenant:', tenant.id);
      setLoading(true);
      setError(null);

      const data = await dashboardService.getDashboardMetrics(tenant.id);
      console.log('DashboardMetrics - Received metrics:', data);
      
      setMetrics(prevMetrics => {
        console.log('DashboardMetrics - Updating metrics:', { prevMetrics, newMetrics: data });
        return data;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metrics';
      console.error('DashboardMetrics - Error fetching metrics:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    console.log('DashboardMetrics - Setting up metrics refresh');
    fetchMetrics();

    const intervalId = setInterval(() => {
      console.log('DashboardMetrics - Refreshing metrics');
      fetchMetrics();
    }, REFRESH_INTERVAL);

    return () => {
      console.log('DashboardMetrics - Cleaning up refresh interval');
      clearInterval(intervalId);
    };
  }, [fetchMetrics]);

  console.log('DashboardMetrics - Render state:', { loading, error, metrics, tenant });

  if (!tenant) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography variant="h6" color="text.secondary" align="center">
          No tenant selected
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: 'error.light',
          color: 'error.contrastText',
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography variant="h6" align="center">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (loading && !metrics.totalTerritories && !metrics.activeRepresentatives && !metrics.totalUsers && !metrics.totalBranches) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[1],
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 4, px: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -1,
              left: 0,
              width: 40,
              height: 2,
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          Key Metrics
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Territories"
            value={metrics.totalTerritories}
            icon={<MapOutlined />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Active Representatives"
            value={metrics.activeRepresentatives}
            icon={<GroupWorkOutlined />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={<PeopleOutline />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Branches"
            value={metrics.totalBranches}
            icon={<BusinessOutlined />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
