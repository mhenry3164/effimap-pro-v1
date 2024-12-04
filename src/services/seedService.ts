import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Territory } from '../types/territory';
import { Branch } from '../types/branch';
import { Representative } from '../types/representative';

class SeedService {
  async seedTenantData(tenantId: string) {
    try {
      // Check if tenant already has data
      const hasData = await this.checkTenantData(tenantId);
      if (hasData) {
        console.log('Tenant already has data, skipping seed');
        return;
      }

      // Ensure tenant features are enabled
      await this.ensureFeatures(tenantId);

      // Seed boundaries
      await this.seedBoundaries(tenantId);

      console.log('Successfully seeded tenant data');
    } catch (error) {
      console.error('Error seeding tenant data:', error);
      throw error;
    }
  }

  private async checkTenantData(tenantId: string): Promise<boolean> {
    const boundariesRef = collection(db, `tenants/${tenantId}/boundaries`);
    const boundariesSnapshot = await getDocs(boundariesRef);
    return !boundariesSnapshot.empty;
  }

  private async ensureFeatures(tenantId: string) {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      features: {
        enableAdvancedMapping: true,
        enableAnalytics: true,
        enableCustomBoundaries: true,
        enableTeamManagement: true,
        enableApiAccess: true
      }
    });
  }

  private async seedBoundaries(tenantId: string) {
    const boundariesRef = collection(db, `tenants/${tenantId}/boundaries`);

    // Example region
    await setDoc(doc(boundariesRef), {
      type: 'region',
      name: 'North Region',
      geometry: {
        type: 'Polygon',
        coordinates: [
          '-95.0,40.0',
          '-94.0,40.0',
          '-94.0,41.0',
          '-95.0,41.0',
          '-95.0,40.0'
        ]
      }
    });

    // Example district
    await setDoc(doc(boundariesRef), {
      type: 'district',
      name: 'Central District',
      geometry: {
        type: 'Polygon',
        coordinates: [
          '-94.8,40.2',
          '-94.2,40.2',
          '-94.2,40.8',
          '-94.8,40.8',
          '-94.8,40.2'
        ]
      }
    });

    // Example area
    await setDoc(doc(boundariesRef), {
      type: 'area',
      name: 'Downtown Area',
      geometry: {
        type: 'Polygon',
        coordinates: [
          '-94.6,40.4',
          '-94.4,40.4',
          '-94.4,40.6',
          '-94.6,40.6',
          '-94.6,40.4'
        ]
      }
    });
  }
}

export const seedService = new SeedService();
