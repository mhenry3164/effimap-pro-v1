import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useStore } from './store';
import { useAuth } from './hooks/useAuth';

// Component Imports
import HomePage from './components/public/HomePage';
import FeaturesPage from './components/public/FeaturesPage';
import AboutPage from './components/public/AboutPage';
import PricingPage from './components/public/PricingPage';
import ContactPage from './components/public/ContactPage';
import AuthForm from './components/auth/AuthForm';
import Profile from './components/user/Profile';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import DivisionDashboard from './components/dashboard/DivisionDashboard';
import BranchDashboard from './components/dashboard/BranchDashboard';
import UserDashboard from './components/dashboard/UserDashboard';
import UserManagement from './components/organization/Users/UserManagement';
import UserList from './components/organization/Users/UserList';
import BranchManagement from './components/organization/Branches/BranchManagement';
import DivisionManager from './components/organization/Structure/DivisionManager';
import TerritoryManagementNew from './components/organization/Structure/TerritoryManagementNew';
import AdvancedMapping from './components/organization/Structure/advancedMapping';
import OrganizationSettings from './components/organization/OrganizationSettings';
import PlatformDashboard from './components/platform/PlatformDashboard';
import TenantMonitoring from './components/platform/TenantMonitoring';
import PlatformSettings from './components/platform/PlatformSettings';
import SystemHealth from './components/platform/SystemHealth';
import { Map } from './components/territory/Map';
import Notifications from './components/notifications/Notifications';
import TerritoryRoutes from './routes/TerritoryRoutes';

// Layout Components
import PublicLayout from './components/public/PublicLayout';
import MainLayout from './components/layout/MainLayout';

// Context Providers
import TenantProvider from './providers/TenantProvider';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useStore(state => ({
    user: state.user,
    loading: state.loading
  }));
  
  if (loading.auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const { user, loading, initAuth } = useStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Determine default route based on user role and auth status
  const getDefaultRoute = () => {
    if (!user) return '/home';
    if (user.platformRole === 'platformAdmin') return '/platform/dashboard';
    return '/dashboard';
  };

  return (
    <Router>
      <TenantProvider>
        <div className="app">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<AuthForm type="login" />} />
              <Route path="/signup" element={<AuthForm type="signup" />} />
              {/* Redirect root to home for unauthenticated users */}
              <Route path="/" element={
                user ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/home" replace />
              } />
            </Route>

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Default Route */}
              <Route index element={<Navigate to={getDefaultRoute()} replace />} />

              {/* Platform Admin Routes */}
              {user?.platformRole === 'platformAdmin' && (
                <Route path="platform/*">
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<PlatformDashboard />} />
                  <Route path="organizations" element={<TenantMonitoring />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="settings" element={<PlatformSettings />} />
                  <Route path="health" element={<SystemHealth />} />
                </Route>
              )}

              {/* Common Protected Routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="map" element={<Map />} />
              <Route 
                path="territory-management" 
                element={<TerritoryManagementNew />} 
              />

              {/* Role-Based Routes */}
              {user?.organizationRoles?.includes('orgAdmin') && (
                <>
                  <Route path="divisions" element={<DivisionManager />} />
                  <Route path="branches" element={<BranchManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="territories/*" element={<TerritoryRoutes />} />
                  <Route path="settings" element={<OrganizationSettings />} />
                  <Route path="analytics" element={<div>Analytics Dashboard</div>} />
                  <Route path="organization/advanced-mapping" element={<AdvancedMapping />} />
                </>
              )}

              {user?.organizationRoles?.includes('divisionAdmin') && (
                <>
                  <Route path="branches" element={<BranchManagement />} />
                  <Route path="map" element={<Map />} />
                  <Route path="territory-management" element={<TerritoryManagementNew />} />
                  <Route path="territories/*" element={<TerritoryRoutes />} />
                  <Route path="settings" element={<OrganizationSettings />} />
                </>
              )}

              {user?.organizationRoles?.includes('branchAdmin') && (
                <>
                  <Route path="map" element={<Map />} />
                  <Route path="territory-management" element={<TerritoryManagementNew />} />
                  <Route path="territories/*" element={<TerritoryRoutes />} />
                  <Route path="representatives" element={<UserList />} />
                  <Route path="settings" element={<OrganizationSettings />} />
                </>
              )}

              {user?.organizationRoles?.includes('representative') && (
                <>
                  <Route path="map" element={<Map />} />
                  <Route path="territories/*" element={<TerritoryRoutes />} />
                  <Route path="settings" element={<OrganizationSettings />} />
                </>
              )}

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
            </Route>
          </Routes>
        </div>
      </TenantProvider>
    </Router>
  );
};

export default App;
