import React, { useEffect, useState } from 'react';
import { Permission } from '../types/rbac';
import { useRBAC } from '../hooks/useRBAC';
import { CircularProgress } from '@mui/material';
import { useStore } from '../store';
import { Navigate } from 'react-router-dom';

interface PermissionGateProps {
  permission: Permission | { action: Permission['action']; resource: Permission['resource'] };
  context?: { [key: string]: any };
  fallback?: React.ReactNode;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  redirectTo?: string;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  context,
  fallback = null,
  children,
  loadingComponent = <div className="flex justify-center items-center h-full"><CircularProgress /></div>,
  redirectTo
}) => {
  const { checkPermission, loading: rbacLoading } = useRBAC();
  const { user } = useStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setLoading(true);
      console.log('PermissionGate: Checking permission', { permission, user, context });
      
      if (!user) {
        console.log('PermissionGate: No user found');
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        const result = await checkPermission(permission, context);
        console.log('PermissionGate: Permission check result', result);
        setHasPermission(result);
      } catch (error) {
        console.error('PermissionGate: Error checking permission', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [permission, context, checkPermission, user]);

  if (!user) {
    console.log('PermissionGate: Redirecting - no user');
    return redirectTo ? <Navigate to={redirectTo} replace /> : null;
  }

  if (loading || rbacLoading) {
    console.log('PermissionGate: Loading state', { loading, rbacLoading });
    return <>{loadingComponent}</>;
  }

  if (!hasPermission) {
    console.log('PermissionGate: Access denied');
    return redirectTo ? <Navigate to={redirectTo} replace /> : <>{fallback}</>;
  }

  console.log('PermissionGate: Rendering children - access granted');
  return <>{children}</>;
};

// Convenience components for common permission checks
export const CanManage: React.FC<Omit<PermissionGateProps, 'permission'> & { resource: Permission['resource'] }> = ({
  resource,
  ...props
}) => (
  <PermissionGate
    permission={{ action: 'manage', resource }}
    {...props}
  />
);

export const CanRead: React.FC<Omit<PermissionGateProps, 'permission'> & { resource: Permission['resource'] }> = ({
  resource,
  ...props
}) => (
  <PermissionGate
    permission={{ action: 'read', resource }}
    {...props}
  />
);

export const CanCreate: React.FC<Omit<PermissionGateProps, 'permission'> & { resource: Permission['resource'] }> = ({
  resource,
  ...props
}) => (
  <PermissionGate
    permission={{ action: 'create', resource }}
    {...props}
  />
);

export const CanUpdate: React.FC<Omit<PermissionGateProps, 'permission'> & { resource: Permission['resource'] }> = ({
  resource,
  ...props
}) => (
  <PermissionGate
    permission={{ action: 'update', resource }}
    {...props}
  />
);

export const CanDelete: React.FC<Omit<PermissionGateProps, 'permission'> & { resource: Permission['resource'] }> = ({
  resource,
  ...props
}) => (
  <PermissionGate
    permission={{ action: 'delete', resource }}
    {...props}
  />
);

export { PermissionGate };
export default PermissionGate;
