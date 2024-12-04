import React, { Suspense } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import ErrorBoundary from '../ErrorBoundary';
import { lazy } from 'react';
import { useStore } from '../../store';
import { useRBAC } from '../../hooks/useRBAC';

// Lazy load role-specific dashboards
const AdminDashboard = lazy(() => import('./Dashboard/AdminDashboard'));
const DivisionDashboard = lazy(() => import('./Dashboard/DivisionDashboard'));
const BranchDashboard = lazy(() => import('./Dashboard/BranchDashboard'));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const OrganizationDashboard: React.FC = () => {
  const { user } = useStore();
  const { hasRole } = useRBAC();

  const getDashboardComponent = () => {
    if (hasRole('orgAdmin')) {
      return <AdminDashboard />;
    } else if (hasRole('divisionManager')) {
      return <DivisionDashboard />;
    } else if (hasRole('branchManager')) {
      return <BranchDashboard />;
    }
    return <BranchDashboard />; // Default to branch dashboard
  };

  return (
    <ErrorBoundary>
      <Box 
        component="div"
        sx={{
          height: '100%',
          overflowY: 'auto',
          py: 4,
          '&::-webkit-scrollbar': {
            width: '0.4em'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555'
          }
        }}
      >
        <Container maxWidth="lg">
          <Suspense fallback={<LoadingFallback />}>
            {getDashboardComponent()}
          </Suspense>
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default OrganizationDashboard;
