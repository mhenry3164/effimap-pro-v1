import { useStore } from '../store';
import { useTenant } from '../providers/TenantProvider';
import { PlatformRole, OrganizationRole, PermissionAction, PermissionResource, RoleScope } from '../types/roles';

interface Permission {
  action: PermissionAction;
  resource: PermissionResource;
  scope?: RoleScope;
}

// Role-based permission mappings
const ROLE_PERMISSIONS: Record<OrganizationRole | PlatformRole, Permission[]> = {
  platformAdmin: [
    { action: 'manage', resource: 'organizations' },
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'roles' },
    { action: 'manage', resource: 'settings' },
    { action: 'manage', resource: 'territories' },
    { action: 'manage', resource: 'divisions' },
    { action: 'manage', resource: 'branches' },
    { action: 'manage', resource: 'reports' },
  ],
  orgAdmin: [
    { action: 'manage', resource: 'users', scope: 'organization' },
    { action: 'manage', resource: 'territories', scope: 'organization' },
    { action: 'manage', resource: 'divisions', scope: 'organization' },
    { action: 'manage', resource: 'branches', scope: 'organization' },
    { action: 'manage', resource: 'settings', scope: 'organization' },
    { action: 'read', resource: 'reports', scope: 'organization' },
  ],
  divisionAdmin: [
    { action: 'manage', resource: 'territories', scope: 'division' },
    { action: 'manage', resource: 'branches', scope: 'division' },
    { action: 'manage', resource: 'users', scope: 'division' },
    { action: 'read', resource: 'reports', scope: 'division' },
  ],
  branchAdmin: [
    { action: 'manage', resource: 'territories', scope: 'branch' },
    { action: 'manage', resource: 'users', scope: 'branch' },
    { action: 'read', resource: 'reports', scope: 'branch' },
  ],
  territoryManager: [
    { action: 'manage', resource: 'territories', scope: 'territory' },
    { action: 'read', resource: 'reports', scope: 'territory' },
  ],
  salesRepresentative: [
    { action: 'read', resource: 'territories', scope: 'territory' },
    { action: 'read', resource: 'reports', scope: 'territory' },
  ],
  viewer: [
    { action: 'read', resource: 'territories' },
    { action: 'read', resource: 'reports' },
  ],
  supportAdmin: [
    { action: 'read', resource: 'organizations' },
    { action: 'read', resource: 'users' },
    { action: 'read', resource: 'territories' },
    { action: 'read', resource: 'reports' },
    { action: 'manage', resource: 'settings' },
  ],
  supportAgent: [
    { action: 'read', resource: 'organizations' },
    { action: 'read', resource: 'users' },
    { action: 'read', resource: 'territories' },
    { action: 'read', resource: 'reports' },
  ],
};

export function useRBAC() {
  const { user } = useStore();
  const { loading, error } = useTenant();

  const hasRole = (role: OrganizationRole | PlatformRole): boolean => {
    if (!user) {
      console.log('useRBAC: No user found');
      return false;
    }

    // Platform admins have all roles
    if (user.platformRole === 'platformAdmin') {
      console.log('useRBAC: User is platform admin');
      return true;
    }

    // Check platform roles
    if (role === user.platformRole) {
      console.log('useRBAC: User has matching platform role:', role);
      return true;
    }

    // Check organization roles
    const hasOrgRole = user.organizationRoles?.includes(role as OrganizationRole) || false;
    console.log('useRBAC: User organization roles:', user.organizationRoles);
    console.log('useRBAC: Checking for role:', role);
    console.log('useRBAC: Has organization role?', hasOrgRole);

    return hasOrgRole;
  };

  const hasPermission = (requestedPermission: Permission): boolean => {
    if (!user) {
      console.log('useRBAC: No user found for permission check');
      return false;
    }

    // Platform admins have all permissions
    if (user.platformRole === 'platformAdmin') {
      console.log('useRBAC: Platform admin has all permissions');
      return true;
    }

    // Get all permissions from user's roles
    const userPermissions: Permission[] = [];

    // Add platform role permissions
    if (user.platformRole) {
      userPermissions.push(...(ROLE_PERMISSIONS[user.platformRole] || []));
    }

    // Add organization role permissions
    user.organizationRoles?.forEach(role => {
      userPermissions.push(...(ROLE_PERMISSIONS[role] || []));
    });

    console.log('useRBAC: User permissions:', userPermissions);
    console.log('useRBAC: Requested permission:', requestedPermission);

    // Check if any of the user's permissions match the requested permission
    const hasPermission = userPermissions.some(permission => {
      // Match action and resource
      const actionMatch = permission.action === requestedPermission.action || permission.action === 'manage';
      const resourceMatch = permission.resource === requestedPermission.resource;

      // If no scope is specified in the request, only check action and resource
      if (!requestedPermission.scope) {
        return actionMatch && resourceMatch;
      }

      // If scope is specified, check if the permission scope matches or is broader
      const scopeHierarchy: Record<RoleScope, number> = {
        platform: 0,
        organization: 1,
        division: 2,
        branch: 3,
        territory: 4
      };

      const permissionScopeLevel = scopeHierarchy[permission.scope || 'platform'];
      const requestedScopeLevel = scopeHierarchy[requestedPermission.scope];

      return actionMatch && resourceMatch && permissionScopeLevel <= requestedScopeLevel;
    });

    console.log('useRBAC: Has permission?', hasPermission);
    return hasPermission;
  };

  return {
    hasRole,
    hasPermission,
    loading,
    error
  };
}
