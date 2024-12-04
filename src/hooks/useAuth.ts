import { useStore } from '../store';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import type { User } from '../types/user';
import type { OrganizationRole, PlatformRole } from '../types/roles';

export const useAuth = () => {
  const store = useStore();
  const user = store.user as User | null;

  const isAdmin = user?.platformRole === 'platformAdmin' || 
                 user?.organizationRoles?.includes('orgAdmin') ||
                 user?.organizationRoles?.includes('divisionAdmin');
                 
  const isManager = user?.organizationRoles?.includes('territoryManager') ||
                   user?.organizationRoles?.includes('branchAdmin');
                   
  const isRepresentative = user?.organizationRoles?.includes('salesRepresentative');

  const isSupportStaff = user?.platformRole === 'supportAdmin' || 
                        user?.platformRole === 'supportAgent';

  const getRoleLevel = (role: OrganizationRole | PlatformRole): number => {
    const roleLevels: Record<OrganizationRole | PlatformRole, number> = {
      platformAdmin: 0,
      supportAdmin: 1,
      supportAgent: 2,
      orgAdmin: 3,
      divisionAdmin: 4,
      branchAdmin: 5,
      territoryManager: 6,
      salesRepresentative: 7,
      viewer: 8
    };
    return roleLevels[role] || 9;
  };

  const getHighestRole = (): OrganizationRole | PlatformRole | null => {
    if (!user) return null;

    const roles = [
      user.platformRole,
      ...(user.organizationRoles || [])
    ];

    return roles.reduce((highest, current) => {
      if (!highest) return current;
      return getRoleLevel(current) < getRoleLevel(highest) ? current : highest;
    }, null as OrganizationRole | PlatformRole | null);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear any local state if needed
      store.clearUser();
      store.clearTenant();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return {
    user,
    userRole: getHighestRole(),
    isAdmin,
    isManager,
    isRepresentative,
    isSupportStaff,
    loading: store.loading.auth || false,
    logout,
  };
};
