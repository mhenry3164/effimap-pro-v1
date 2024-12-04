import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useTenant } from '../../../providers/TenantProvider';
import { Users, Building2, MapPin } from 'lucide-react';

const DashboardMetrics: React.FC = () => {
  const { tenant } = useTenant();

  const metrics = [
    {
      title: 'Total Users',
      value: tenant?.userCount || 0,
      icon: <Users className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Active Branches',
      value: tenant?.branchCount || 0,
      icon: <Building2 className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Mapped Territories',
      value: tenant?.territoryCount || 0,
      icon: <MapPin className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Organization Overview
      </Typography>
      
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} md={4} key={metric.title}>
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
              <Box sx={{ mb: 2 }}>{metric.icon}</Box>
              <Typography variant="h4" component="div" gutterBottom>
                {metric.value}
              </Typography>
              <Typography color="text.secondary">{metric.title}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardMetrics;
