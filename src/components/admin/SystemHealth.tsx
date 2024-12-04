import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { adminService, SystemMetrics } from '../../services/adminService';

interface SystemStatus {
  status: 'operational' | 'degraded' | 'down';
  components: {
    database: 'operational' | 'degraded' | 'down';
    storage: 'operational' | 'degraded' | 'down';
    authentication: 'operational' | 'degraded' | 'down';
    api: 'operational' | 'degraded' | 'down';
  };
  metrics: {
    cpu: number;
    memory: number;
    storage: number;
    activeConnections: number;
  };
  recentErrors: Array<{
    id: string;
    timestamp: Date;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

const SystemHealth: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [componentStatus, setComponentStatus] = useState<Record<string, 'operational' | 'degraded' | 'down'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSystemHealth();
    const interval = setInterval(loadSystemHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load metrics and status in parallel
      const [metrics, status] = await Promise.all([
        adminService.getSystemMetrics(),
        adminService.getComponentStatus(),
      ]);

      setSystemMetrics(metrics);
      setComponentStatus(status);
    } catch (err) {
      console.error('Error loading system health:', err);
      setError('Failed to load system health data');
    } finally {
      setIsLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon color="success" />;
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'down':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        System Health
      </Typography>

      {/* Overall System Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            {getStatusIcon(componentStatus.database)}
            <Typography variant="h6">
              System Status: {componentStatus.database.toUpperCase()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Component Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Component Status
              </Typography>
              <List>
                {Object.entries(componentStatus).map(([component, status]) => (
                  <ListItem key={component}>
                    <ListItemIcon>
                      {getStatusIcon(status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={component.charAt(0).toUpperCase() + component.slice(1)}
                      secondary={status.toUpperCase()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Metrics
              </Typography>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  CPU Usage
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={systemMetrics?.cpu || 0}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" color="textSecondary">
                  Memory Usage
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={systemMetrics?.memory || 0}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" color="textSecondary">
                  Storage Usage
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={systemMetrics?.storage || 0}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2">
                  Active Connections: {systemMetrics?.activeConnections || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Errors */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Errors
              </Typography>
              {systemMetrics?.recentErrors.length === 0 ? (
                <Alert severity="success">No recent errors</Alert>
              ) : (
                <List>
                  {systemMetrics?.recentErrors.map((error) => (
                    <ListItem key={error.id}>
                      <ListItemIcon>
                        {error.severity === 'error' ? (
                          <ErrorIcon color="error" />
                        ) : (
                          <WarningIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={error.message}
                        secondary={new Date(error.timestamp).toLocaleString()}
                      />
                      <Chip
                        label={error.severity}
                        color={error.severity === 'error' ? 'error' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemHealth;
