import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TenantState, FeatureFlags, TenantSettings } from '../types/tenantTypes';

const defaultFeatures: FeatureFlags = {
  enableAdvancedMapping: false,
  enableAnalytics: false,
  enableCustomBoundaries: false,
  enableTeamManagement: false,
  enableApiAccess: false,
};

const defaultSettings: TenantSettings = {
  mapDefaults: {
    center: [-95.7129, 37.0902],
    zoom: 4,
  },
  branding: {
    primaryColor: '#003f88',
    secondaryColor: '#f68b24',
  },
  api: {
    rateLimit: 100,
  },
};

export async function initializeTenantState(tenantId: string): Promise<TenantState> {
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    const featuresRef = doc(db, 'tenants', tenantId, 'config', 'features');
    const settingsRef = doc(db, 'tenants', tenantId, 'config', 'settings');

    const [tenantDoc, featuresDoc, settingsDoc] = await Promise.all([
      getDoc(tenantRef),
      getDoc(featuresRef),
      getDoc(settingsRef),
    ]);

    if (!tenantDoc.exists()) {
      throw new Error('Tenant not found');
    }

    return {
      organizationId: tenantId,
      roles: [],  // Will be populated from user document
      features: featuresDoc.exists() ? featuresDoc.data() as FeatureFlags : defaultFeatures,
      settings: settingsDoc.exists() ? settingsDoc.data() as TenantSettings : defaultSettings,
      permissions: [], // Will be populated from user document
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('Error initializing tenant state:', error);
    return {
      organizationId: '',
      roles: [],
      features: defaultFeatures,
      settings: defaultSettings,
      permissions: [],
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to initialize tenant state',
    };
  }
}

export function hasRole(roles: string[], roleToCheck: string): boolean {
  const roleHierarchy: Record<string, string[]> = {
    'orgAdmin': ['divisionAdmin', 'branchAdmin', 'territoryManager'],
    'divisionAdmin': ['branchAdmin', 'territoryManager'],
    'branchAdmin': ['territoryManager'],
  };

  return roles.some(role => 
    role === roleToCheck || 
    (roleHierarchy[role] && roleHierarchy[role].includes(roleToCheck))
  );
}

export function hasPermission(permissions: string[], resource: string, action: string): boolean {
  if (permissions.includes('*')) return true;
  
  const permissionString = `${resource}.${action}`;
  return permissions.includes(permissionString) || 
         permissions.includes(`${resource}.*`);
}
