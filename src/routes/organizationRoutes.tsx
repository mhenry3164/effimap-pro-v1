import { Route, Routes } from 'react-router-dom';
import { PermissionGate } from '../components/PermissionGate';
import AdvancedMapping from '../components/organization/Structure/advancedMapping';

const OrganizationRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
      />
      <Route
        path="/users"
      />
      <Route
        path="/roles"
      />
      <Route
        path="/branches"
      />
      <Route
        path="/advanced-mapping"
        element={
          <PermissionGate permission={{ action: 'manage', resource: 'territory' }}>
            <AdvancedMapping />
          </PermissionGate>
        }
      />
    </Routes>
  );
};

export default OrganizationRoutes;
