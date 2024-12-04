import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Organization, TenantSettings, FeatureFlags } from '../types/tenantTypes';

export async function getTenantDetails(tenantId: string): Promise<Organization | null> {
  try {
    const tenantDoc = await getDoc(doc(db, 'tenants', tenantId));
    if (!tenantDoc.exists()) return null;
    
    return {
      id: tenantDoc.id,
      ...tenantDoc.data()
    } as Organization;
  } catch (error) {
    console.error('Error fetching tenant details:', error);
    return null;
  }
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings | null> {
  try {
    const settingsDoc = await getDoc(doc(db, 'tenants', tenantId, 'config', 'settings'));
    if (!settingsDoc.exists()) return null;
    
    return settingsDoc.data() as TenantSettings;
  } catch (error) {
    console.error('Error fetching tenant settings:', error);
    return null;
  }
}

export async function getTenantFeatures(tenantId: string): Promise<FeatureFlags | null> {
  try {
    const featuresDoc = await getDoc(doc(db, 'tenants', tenantId, 'config', 'features'));
    if (!featuresDoc.exists()) return null;
    
    return featuresDoc.data() as FeatureFlags;
  } catch (error) {
    console.error('Error fetching tenant features:', error);
    return null;
  }
}

export async function getDivisions(tenantId: string) {
  try {
    const divisionsRef = collection(db, 'tenants', tenantId, 'divisions');
    const divisionsSnapshot = await getDocs(divisionsRef);
    
    return divisionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching divisions:', error);
    return [];
  }
}

export async function getBranches(tenantId: string, divisionId: string) {
  try {
    const branchesRef = collection(db, 'tenants', tenantId, 'divisions', divisionId, 'branches');
    const branchesSnapshot = await getDocs(branchesRef);
    
    return branchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

export async function getTerritories(tenantId: string, filters?: {
  divisionId?: string;
  branchId?: string;
  status?: 'active' | 'inactive' | 'unassigned';
}) {
  try {
    const territoriesRef = collection(db, 'tenants', tenantId, 'territories');
    let q = query(territoriesRef);
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    const territoriesSnapshot = await getDocs(q);
    
    return territoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching territories:', error);
    return [];
  }
}
