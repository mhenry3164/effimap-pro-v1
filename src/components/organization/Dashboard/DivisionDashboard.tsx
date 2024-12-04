import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Users, Building2, MapPin, TrendingUp } from 'lucide-react';
import { useTenant } from '../../../providers/TenantProvider';

const DivisionDashboard: React.FC = () => {
  const { hierarchy } = useTenant();
  const metrics = hierarchy.metrics || { userCount: 0, branchCount: 0, territoryCount: 0 };

  const dashboardCards = [
    {
      title: 'Total Users',
      value: metrics.userCount,
      icon: <Users className="h-8 w-8 text-primary" />,
      description: 'Active users in division'
    },
    {
      title: 'Active Branches',
      value: metrics.branchCount,
      icon: <Building2 className="h-8 w-8 text-primary" />,
      description: 'Branches in division'
    },
    {
      title: 'Mapped Territories',
      value: metrics.territoryCount,
      icon: <MapPin className="h-8 w-8 text-primary" />,
      description: 'Total territories mapped'
    },
    {
      title: 'Territory Coverage',
      value: `${((metrics.territoryCount / (metrics.branchCount * 10)) * 100).toFixed(1)}%`,
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      description: 'Average territories per branch'
    }
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Division Dashboard
      </Typography>
      
      <Grid container spacing={3}>
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
      </Grid>

      {/* Placeholder for future features */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Branch Performance
        </Typography>
        <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
          <Typography color="text.secondary">
            Branch performance metrics and comparisons will be displayed here
          </Typography>
        </Paper>
      </Box>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Territory Distribution
        </Typography>
        <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
          <Typography color="text.secondary">
            Territory distribution and coverage analysis will be displayed here
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default DivisionDashboard;
