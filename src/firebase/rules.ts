import { OrganizationRole, Permission } from '../types/tenant';

/**
 * Role hierarchy definition for Firebase security rules
 */
export const roleHierarchy: Record<OrganizationRole, OrganizationRole[]> = {
  'orgAdmin': ['divisionAdmin', 'branchAdmin', 'territoryManager'],
  'divisionAdmin': ['branchAdmin', 'territoryManager'],
  'branchAdmin': ['territoryManager'],
  'territoryManager': []
};

/**
 * Permission definitions for Firebase security rules
 */
export const permissions: Permission[] = [
  '*',
  'division.read',
  'division.write',
  'branch.read',
  'branch.write',
  'territory.read',
  'territory.write',
  'territory.delete',
  'territory.analytics',
  'audit.read',
  'api.access'
];

/**
 * Helper function to check if a role includes another role in its hierarchy
 */
export const roleIncludes = (role: OrganizationRole, targetRole: OrganizationRole): boolean => {
  return role === targetRole || (roleHierarchy[role]?.includes(targetRole) ?? false);
};

/**
 * Helper function to check if a permission matches another permission
 */
export const permissionMatches = (permission: Permission, targetPermission: Permission): boolean => {
  if (permission === '*') return true;
  if (permission === targetPermission) return true;

  const [resource, action] = targetPermission.split('.');
  return permission === `${resource}.*`;
};
