import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import { Users, MapPin, Target, TrendingUp } from 'lucide-react';
import { useTenant } from '../../../providers/TenantProvider';

const BranchDashboard: React.FC = () => {
  const { hierarchy } = useTenant();
  const metrics = hierarchy.metrics || { userCount: 0, branchCount: 0, territoryCount: 0 };
  const branchData = hierarchy.branchData || {};

  const dashboardCards = [
    {
      title: 'Active Representatives',
      value: metrics.userCount,
      icon: <Users className="h-8 w-8 text-primary" />,
      description: 'Representatives in branch'
    },
    {
      title: 'Mapped Territories',
      value: metrics.territoryCount,
      icon: <MapPin className="h-8 w-8 text-primary" />,
      description: 'Active territories'
    },
    {
      title: 'Territory Coverage',
      value: `${((metrics.territoryCount / (metrics.userCount || 1)) * 100).toFixed(1)}%`,
      icon: <Target className="h-8 w-8 text-primary" />,
      description: 'Territories per representative'
    },
    {
      title: 'Performance Index',
      value: metrics.territoryCount > 0 ? '85%' : '0%',
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      description: 'Overall branch performance'
    }
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Branch Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Metrics Cards */}
        {dashboardCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e0e0e0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Box sx={{ mb: 2 }}>{card.icon}</Box>
              <Typography variant="h4" component="div" gutterBottom>
                {card.value}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {card.title}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {card.description}
              </Typography>
            </Paper>
          </Grid>
        ))}

        {/* Territory Management */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Territory Management
              </Typography>
              <Typography color="text.secondary">
                Territory assignments and performance metrics will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Representative Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Representative Overview
              </Typography>
              <Typography color="text.secondary">
                Representative status and activity summary will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Territory Map */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Territory Map
              </Typography>
              <Box height={300} display="flex" alignItems="center" justifyContent="center">
                <Typography color="text.secondary">
                  Interactive territory map will be displayed here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BranchDashboard;
