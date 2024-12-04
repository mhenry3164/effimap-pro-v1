import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';

export interface SystemMetrics {
  cpu: number;
  memory: number;
  storage: number;
  activeConnections: number;
  lastUpdated: Date;
}

export interface TenantData {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'trial';
  userCount: number;
  storageUsed: number;
  subscription: {
    plan: string;
    status: string;
    mrr: number;
  };
  lastActivity: Date;
  branchCount?: number;
  territoryCount?: number;
}

export interface SystemLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  service: string;
  details: any;
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  tenantId: string;
  role: string;
  status: 'active' | 'suspended' | 'invited';
  lastLogin: Date;
}

class AdminService {
  // System Health
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const getMetrics = httpsCallable(functions, 'getSystemMetrics');
      const result = await getMetrics();
      return result.data as SystemMetrics;
    } catch (error: any) {
      console.error('Error fetching system metrics:', error);
      // Return mock data during development to handle CORS issues
      if (process.env.NODE_ENV === 'development') {
        return {
          cpu: 45,
          memory: 60,
          storage: 30,
          activeConnections: 150,
          lastUpdated: new Date()
        };
      }
      throw new Error(error.message || 'Failed to fetch system metrics');
    }
  }

  async getComponentStatus(): Promise<Record<string, 'operational' | 'degraded' | 'down'>> {
    try {
      const getStatus = httpsCallable(functions, 'getComponentStatus');
      const result = await getStatus();
      return result.data as Record<string, 'operational' | 'degraded' | 'down'>;
    } catch (error: any) {
      console.error('Error fetching component status:', error);
      // Return mock data during development to handle CORS issues
      if (process.env.NODE_ENV === 'development') {
        return {
          'api': 'operational',
          'database': 'operational',
          'storage': 'operational',
          'auth': 'operational'
        };
      }
      throw new Error(error.message || 'Failed to fetch component status');
    }
  }

  // Tenant Management
  async getTenants(
    pageSize: number = 10,
    lastTenant?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ tenants: TenantData[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    let tenantsQuery = query(
      collection(db, 'tenants'),
      orderBy('name'),
      limit(pageSize)
    );

    if (lastTenant) {
      tenantsQuery = query(tenantsQuery, startAfter(lastTenant));
    }

    const snapshot = await getDocs(tenantsQuery);
    const tenants = await Promise.all(snapshot.docs.map(async doc => {
      const tenantId = doc.id;
      const tenantData = doc.data();

      // Get counts from subcollections
      const [userCount, branchCount, territoryCount] = await Promise.all([
        this.getTenantUserCount(tenantId),
        this.getTenantBranchCount(tenantId),
        this.getTenantTerritoryCount(tenantId)
      ]);

      return {
        id: tenantId,
        ...tenantData,
        userCount,
        branchCount,
        territoryCount
      };
    })) as TenantData[];

    return {
      tenants,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }

  private async getTenantUserCount(tenantId: string): Promise<number> {
    const usersQuery = query(
      collection(db, 'users'),
      where('tenantId', '==', tenantId)
    );
    const snapshot = await getDocs(usersQuery);
    return snapshot.size;
  }

  private async getTenantBranchCount(tenantId: string): Promise<number> {
    const branchesQuery = query(
      collection(db, `tenants/${tenantId}/branches`)
    );
    const snapshot = await getDocs(branchesQuery);
    return snapshot.size;
  }

  private async getTenantTerritoryCount(tenantId: string): Promise<number> {
    const territoriesQuery = query(
      collection(db, `tenants/${tenantId}/territories`)
    );
    const snapshot = await getDocs(territoriesQuery);
    return snapshot.size;
  }

  async updateTenantCounts(tenantId: string): Promise<void> {
    const [userCount, branchCount, territoryCount] = await Promise.all([
      this.getTenantUserCount(tenantId),
      this.getTenantBranchCount(tenantId),
      this.getTenantTerritoryCount(tenantId)
    ]);

    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      userCount,
      branchCount,
      territoryCount,
      lastUpdated: new Date()
    });
  }

  async searchTenants(searchTerm: string): Promise<TenantData[]> {
    const tenantsQuery = query(
      collection(db, 'tenants'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );

    const snapshot = await getDocs(tenantsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TenantData[];
  }

  // User Management
  async searchUsers(searchTerm: string): Promise<UserData[]> {
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '>=', searchTerm),
      where('email', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    })) as UserData[];
  }

  // System Logs
  async getSystemLogs(
    pageSize: number = 50,
    lastLog?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ logs: SystemLog[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    let logsQuery = query(
      collection(db, 'systemLogs'),
      orderBy('timestamp', 'desc'),
      limit(pageSize)
    );

    if (lastLog) {
      logsQuery = query(logsQuery, startAfter(lastLog));
    }

    const snapshot = await getDocs(logsQuery);
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SystemLog[];

    return {
      logs,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  }

  async searchLogs(
    searchTerm: string,
    level?: 'info' | 'warning' | 'error',
    service?: string
  ): Promise<SystemLog[]> {
    let logsQuery = query(collection(db, 'systemLogs'));

    if (level) {
      logsQuery = query(logsQuery, where('level', '==', level));
    }

    if (service) {
      logsQuery = query(logsQuery, where('service', '==', service));
    }

    logsQuery = query(
      logsQuery,
      where('message', '>=', searchTerm),
      where('message', '<=', searchTerm + '\uf8ff'),
      limit(50)
    );

    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SystemLog[];
  }

  // Platform Settings
  async getPlatformSettings() {
    const settingsDoc = await getDoc(doc(db, 'platform', 'settings'));
    return settingsDoc.data();
  }

  async updatePlatformSettings(settings: any) {
    await updateDoc(doc(db, 'platform', 'settings'), settings);
  }

  // Support Tools
  async impersonateUser(userId: string) {
    const impersonate = httpsCallable(functions, 'impersonateUser');
    return await impersonate({ userId });
  }

  async getTenantDetails(tenantId: string) {
    const tenantDoc = await getDoc(doc(db, 'tenants', tenantId));
    return tenantDoc.data();
  }
}

export const adminService = new AdminService();
