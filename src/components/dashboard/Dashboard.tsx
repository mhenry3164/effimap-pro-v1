import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import PlatformDashboard from '../platform/PlatformDashboard';
import AdminDashboard from '../organization/Dashboard/AdminDashboard';
import DivisionDashboard from '../organization/Dashboard/DivisionDashboard';
import BranchDashboard from '../organization/Dashboard/BranchDashboard';
import UserDashboard from './UserDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Determine which dashboard to show based on user role
  if (user?.platformRole === 'platformAdmin') {
    return <PlatformDashboard />;
  }

  if (user?.organizationRoles?.includes('orgAdmin')) {
    return <AdminDashboard />;
  }

  if (user?.organizationRoles?.includes('divisionAdmin')) {
    return <DivisionDashboard />;
  }

  if (user?.organizationRoles?.includes('branchAdmin')) {
    return <BranchDashboard />;
  }

  return <UserDashboard />;
};

export default Dashboard;
