import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { adminService, SystemMetrics, TenantData } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const PlatformDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [tenantStats, setTenantStats] = useState({
    totalTenants: 0,
    activeUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load metrics and tenant data in parallel
      const [metrics, tenantsResult] = await Promise.all([
        adminService.getSystemMetrics().catch(error => {
          console.error('Error fetching metrics:', error);
          return null;
        }),
        adminService.getTenants(100).catch(error => {
          console.error('Error fetching tenants:', error);
          return { tenants: [], lastDoc: null };
        }),
      ]);

      if (metrics) {
        setSystemMetrics(metrics);
      }

      // Calculate tenant statistics
      const tenants = tenantsResult.tenants;
      const stats = tenants.reduce((acc, tenant) => ({
        totalTenants: acc.totalTenants + 1,
        activeUsers: acc.activeUsers + (tenant.userCount || 0),
        totalRevenue: acc.totalRevenue + (tenant.subscription?.mrr || 0),
      }), {
        totalTenants: 0,
        activeUsers: 0,
        totalRevenue: 0,
      });

      setTenantStats(stats);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'An error occurred while loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTenantStats = (tenants: TenantData[]) => {
    return tenants.reduce((acc, tenant) => ({
      totalTenants: acc.totalTenants + 1,
      activeUsers: acc.activeUsers + tenant.userCount,
      totalRevenue: acc.totalRevenue + (tenant.subscription?.mrr || 0),
    }), {
      totalTenants: 0,
      activeUsers: 0,
      totalRevenue: 0,
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Platform Administration</Typography>
        <Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<WarningIcon />}
            disabled={!systemMetrics?.activeAlerts}
            onClick={() => navigate('/admin/system-health')}
          >
            Active Alerts ({systemMetrics?.activeAlerts || 0})
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* System Health Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={2}>
                  <Box textAlign="center">
                    <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">{tenantStats.totalTenants}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Tenants
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box textAlign="center">
                    <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">{tenantStats.activeUsers}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box textAlign="center">
                    <StorageIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">{systemMetrics?.storage || 0}%</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Storage Used
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box textAlign="center">
                    <SpeedIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">{systemMetrics?.cpu || 0}%</Typography>
                    <Typography variant="body2" color="textSecondary">
                      CPU Usage
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box textAlign="center">
                    <TimelineIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">${tenantStats.totalRevenue}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Monthly Revenue
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/admin/tenants')}
                  >
                    Manage Tenants
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/admin/settings')}
                  >
                    System Settings
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/admin/support')}
                  >
                    Support Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/admin/analytics')}
                  >
                    View Analytics
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {/* Add activity feed component */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlatformDashboard;
