import React, { useEffect, useState, useCallback } from 'react';
import { Paper, Grid, Typography, LinearProgress, Box, useTheme } from '@mui/material';
import { useTenant } from '../../contexts/TenantContext';
import { dashboardService } from '../../services/dashboardService';

interface UsageData {
  territoriesUsed: number;
  territoriesLimit: number;
  usersActive: number;
  usersLimit: number;
  storageUsed: number;
  storageLimit: number;
}

const REFRESH_INTERVAL = 30000; // 30 seconds
const DEFAULT_LIMITS = {
  territories: 100,
  users: 50,
  storage: 5 * 1024 * 1024 * 1024, // 5GB in bytes
};

export const UsageStats: React.FC = () => {
  const { tenant } = useTenant();
  const theme = useTheme();
  const [usage, setUsage] = useState<UsageData>({
    territoriesUsed: 0,
    territoriesLimit: DEFAULT_LIMITS.territories,
    usersActive: 0,
    usersLimit: DEFAULT_LIMITS.users,
    storageUsed: 0,
    storageLimit: DEFAULT_LIMITS.storage,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatStorage = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const calculatePercentage = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  const fetchUsageStats = useCallback(async () => {
    if (!tenant?.id) {
      console.log('UsageStats - No tenant ID available');
      setLoading(false);
      return;
    }

    try {
      console.log('UsageStats - Fetching metrics for tenant:', tenant.id);
      setError(null);

      const metrics = await dashboardService.getDashboardMetrics(tenant.id);
      
      setUsage(prev => ({
        ...prev,
        territoriesUsed: metrics.totalTerritories,
        usersActive: metrics.totalUsers,
      }));

      console.log('UsageStats - Updated usage stats:', metrics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch usage stats';
      console.error('UsageStats - Error fetching stats:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    console.log('UsageStats - Setting up stats refresh');
    fetchUsageStats();

    const intervalId = setInterval(() => {
      console.log('UsageStats - Refreshing stats');
      fetchUsageStats();
    }, REFRESH_INTERVAL);

    return () => {
      console.log('UsageStats - Cleaning up refresh interval');
      clearInterval(intervalId);
    };
  }, [fetchUsageStats]);

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return theme.palette.error.main;
    if (percentage >= 70) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  if (!tenant) {
    return null;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: 'text.primary',
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: 32,
            height: 2,
            bgcolor: theme.palette.primary.main,
          },
        }}
      >
        Usage Statistics
      </Typography>

      {error ? (
        <Typography color="error" sx={{ my: 1 }}>
          Error: {error}
        </Typography>
      ) : (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Territories
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {usage.territoriesUsed}/{usage.territoriesLimit}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={calculatePercentage(usage.territoriesUsed, usage.territoriesLimit)}
              sx={{ 
                height: 4,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '.MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(calculatePercentage(usage.territoriesUsed, usage.territoriesLimit)),
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Active Users
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {usage.usersActive}/{usage.usersLimit}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={calculatePercentage(usage.usersActive, usage.usersLimit)}
              sx={{ 
                height: 4,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '.MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(calculatePercentage(usage.usersActive, usage.usersLimit)),
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Storage
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {formatStorage(usage.storageUsed)}/{formatStorage(usage.storageLimit)}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={calculatePercentage(usage.storageUsed, usage.storageLimit)}
              sx={{ 
                height: 4,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '.MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(calculatePercentage(usage.storageUsed, usage.storageLimit)),
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
