import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, People as PeopleIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMap } from '../../contexts/MapContext';
import Map from '../territory/Map';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { setIsDrawingMode } = useMap();
  const [showMap, setShowMap] = React.useState(false);

  const actions = [
    {
      label: 'New Territory',
      icon: <AddIcon />,
      onClick: () => {
        setShowMap(true);
        setIsDrawingMode(true);
      },
      color: 'primary'
    },
    {
      label: 'Manage Territories',
      icon: <EditIcon />,
      onClick: () => navigate('/territories'),
      color: 'secondary'
    },
    {
      label: 'Manage Users',
      icon: <PeopleIcon />,
      onClick: () => navigate('/users'),
      color: 'info'
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      onClick: () => navigate('/settings'),
      color: 'primary'
    }
  ];

  return (
    <>
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
          Quick Actions
        </Typography>
        
        <Grid container spacing={2} sx={{ flex: 1 }}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Button
                variant="contained"
                color={action.color as 'primary' | 'secondary' | 'info'}
                onClick={action.onClick}
                startIcon={action.icon}
                fullWidth
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 2,
                  }
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {showMap && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1000,
            backgroundColor: 'white'
          }}
        >
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1001 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowMap(false);
                setIsDrawingMode(false);
              }}
            >
              Close
            </Button>
          </div>
          <Map />
        </div>
      )}
    </>
  );
};
