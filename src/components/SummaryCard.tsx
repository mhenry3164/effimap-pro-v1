import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 2,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            p: 1.5,
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main + '15',
            color: theme.palette.primary.main,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ ml: 2, flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};