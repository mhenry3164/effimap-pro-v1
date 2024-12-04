import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TerritoryList } from '../components/territory/TerritoryList';
import TerritoryEditor from '../components/territory/TerritoryEditor';

const TerritoryRoutes: React.FC = () => {
  const { user } = useAuth();

  // Helper function to determine if user has territory access
  const hasAccess = () => {
    if (!user) return false;
    return user.platformRole === 'platformAdmin' ||
           user.organizationRoles?.some(role => 
             ['orgAdmin', 'divisionAdmin', 'branchAdmin', 'representative'].includes(role)
           );
  };

  // Redirect if no access
  if (!hasAccess()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route index element={<TerritoryList />} />
      <Route path=":id" element={<TerritoryEditor />} />
      <Route path=":id/edit" element={<TerritoryEditor mode="edit" />} />
      <Route path="new" element={<TerritoryEditor mode="create" />} />
    </Routes>
  );
};

export default TerritoryRoutes;
