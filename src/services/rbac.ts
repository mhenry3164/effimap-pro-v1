import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Role, Permission, UserRoleAssignment } from '../types/rbac';

export class RBACService {
  private static instance: RBACService;
  private roleCache: Map<string, Role> = new Map();
  private permissionCache: Map<string, Permission[]> = new Map();
  
  private constructor() {}
  
  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  async getRoleDefinition(roleId: string): Promise<Role | null> {
    // Check cache first
    if (this.roleCache.has(roleId)) {
      return this.roleCache.get(roleId)!;
    }

    try {
      const roleDoc = await getDoc(doc(db, 'roles', roleId));
      if (!roleDoc.exists()) return null;

      const role = roleDoc.data() as Role;
      this.roleCache.set(roleId, role);
      return role;
    } catch (error) {
      console.error('Error fetching role definition:', error);
      return null;
    }
  }

  async getUserRoleAssignments(userId: string, orgId: string): Promise<UserRoleAssignment[]> {
    try {
      const assignmentsRef = collection(db, `organizations/${orgId}/users/${userId}/roleAssignments`);
      const assignmentsSnap = await getDocs(assignmentsRef);
      return assignmentsSnap.docs.map(doc => doc.data() as UserRoleAssignment);
    } catch (error) {
      console.error('Error fetching user role assignments:', error);
      return [];
    }
  }

  async getAllPermissions(userId: string, orgId: string): Promise<Permission[]> {
    const cacheKey = `${userId}:${orgId}`;
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const uniquePermissions = new Set<Permission>();
    const roleAssignments = await this.getUserRoleAssignments(userId, orgId);
    
    for (const assignment of roleAssignments) {
      const role = await this.getRoleDefinition(assignment.roleId);
      if (!role) continue;

      // Add direct permissions with scope
      role.permissions.forEach(p => {
        uniquePermissions.add({
          ...p,
          conditions: {
            ...p.conditions,
            ...assignment.scope
          }
        });
      });

      // Add inherited permissions
      if (role.inherits) {
        for (const inheritedRoleId of role.inherits) {
          const inheritedRole = await this.getRoleDefinition(inheritedRoleId);
          if (inheritedRole) {
            inheritedRole.permissions.forEach(p => {
              uniquePermissions.add({
                ...p,
                conditions: {
                  ...p.conditions,
                  ...assignment.scope
                }
              });
            });
          }
        }
      }
    }

    const permissions = Array.from(uniquePermissions);
    this.permissionCache.set(cacheKey, permissions);
    return permissions;
  }

  async hasPermission(
    userId: string, 
    orgId: string, 
    required: Permission,
    context?: { [key: string]: any }
  ): Promise<boolean> {
    try {
      // Check platform admin first
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return false;

      const userData = userDoc.data();
      if (userData.platformRole === 'platformAdmin') return true;

      // Get all permissions for user's roles
      const allPermissions = await this.getAllPermissions(userId, orgId);

      // Check if user has the required permission
      return this.matchPermission(required, allPermissions, context);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  private matchPermission(
    required: Permission, 
    available: Permission[], 
    context?: { [key: string]: any }
  ): boolean {
    return available.some(p => {
      // Check resource match
      if (p.resource !== '*' && p.resource !== required.resource) return false;

      // Check action match
      if (p.action !== '*' && p.action !== 'manage' && p.action !== required.action) return false;

      // If no conditions are required or available, base match is sufficient
      if (!required.conditions && !p.conditions) return true;

      // If conditions are required, check them against available conditions and context
      return this.matchConditions(required.conditions, p.conditions, context);
    });
  }

  private matchConditions(
    required?: { [key: string]: any },
    available?: { [key: string]: any },
    context?: { [key: string]: any }
  ): boolean {
    if (!required) return true;
    if (!available) return false;

    return Object.entries(required).every(([key, value]) => {
      // Special handling for ownOnly condition
      if (key === 'ownOnly' && value === true) {
        return context?.userId === available.userId;
      }

      // Special handling for division/branch scope
      if (key === 'divisionId' || key === 'branchId') {
        return !available[key] || available[key] === value;
      }

      return available[key] === value;
    });
  }

  clearCache(): void {
    this.roleCache.clear();
    this.permissionCache.clear();
  }
}
