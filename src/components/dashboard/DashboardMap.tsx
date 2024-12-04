import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTenant } from '../../hooks/useTenant';
import { Map } from '../territory/Map';

export const DashboardMap: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography 
        component="h2" 
        variant="h6" 
        color="primary" 
        sx={{ 
          mb: 2,
          fontWeight: 600,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: 32,
            height: 2,
            bgcolor: 'primary.main',
          },
        }}
      >
        Territory Overview
      </Typography>
      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative',
        minHeight: 400,
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <Map readOnly={true} />
      </Box>
    </Box>
  );
};
