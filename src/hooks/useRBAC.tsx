import { useCallback, useState } from 'react';
import { Permission, Role } from '../types/rbac';
import { useStore } from '../store';
import { useTenant } from '../providers/TenantProvider';

export const useRBAC = () => {
  const { user } = useStore();
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(false);

  const checkPermission = useCallback(async (
    permission: Permission,
    context?: { [key: string]: any }
  ): Promise<boolean> => {
    if (!user) return false;

    // Platform admin has full access
    if (user.role === 'platform_admin') {
      return true;
    }

    // Check tenant context for organization-level roles
    if (!currentTenant && user.role !== 'platform_admin') {
      return false;
    }

    // Role-based permission checks
    switch (user.role) {
      case 'organization_admin':
        // Organization admins have full access to their organization
        if (permission.resource === 'organization' || 
            permission.resource === 'division' || 
            permission.resource === 'branch' || 
            permission.resource === 'territory') {
          return true;
        }
        // They can manage users within their organization
        if (permission.resource === 'user' && 
            ['create', 'read', 'update'].includes(permission.action)) {
          return true;
        }
        break;

      case 'branch_admin':
        // Branch admins have full access to their branch
        if (permission.resource === 'branch' && context?.branchId === user.branchId) {
          return true;
        }
        // They can manage territories within their branch
        if (permission.resource === 'territory' && context?.branchId === user.branchId) {
          return true;
        }
        // They can view and update users within their branch
        if (permission.resource === 'user' && 
            ['read', 'update'].includes(permission.action) && 
            context?.branchId === user.branchId) {
          return true;
        }
        break;

      case 'territory_manager':
        // Territory managers can view their assigned territories
        if (permission.resource === 'territory' && 
            permission.action === 'read' && 
            context?.territoryId === user.territoryId) {
          return true;
        }
        // They can view branch information
        if (permission.resource === 'branch' && 
            permission.action === 'read' && 
            context?.branchId === user.branchId) {
          return true;
        }
        break;
    }

    return false;
  }, [user, currentTenant]);

  const hasPermission = useCallback(async (
    permission: Permission,
    context?: { [key: string]: any }
  ): Promise<boolean> => {
    setLoading(true);
    try {
      return await checkPermission(permission, context);
    } finally {
      setLoading(false);
    }
  }, [checkPermission]);

  return {
    checkPermission: hasPermission,
    loading,
  };
};
