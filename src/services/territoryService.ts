import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Territory, TerritoryMetrics } from '../types/territory';

export class TerritoryService {
  private calculateMetrics(coordinates: { lat: number; lng: number; }[]): TerritoryMetrics {
    // TODO: Implement proper area and perimeter calculations
    return {
      area: 0,
      perimeter: 0
    };
  }

  async getAll(tenantId: string): Promise<Territory[]> {
    try {
      const territoriesRef = collection(db, 'tenants', tenantId, 'territories');
      const snapshot = await getDocs(territoriesRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'branch',  // Ensure type is set
          branchId: data.type === 'branch' ? data.branchId : null,
          representativeId: data.type === 'representative' ? data.representativeId : null,
          ...data,  // Spread after setting specific fields to prevent overwrite
        } as Territory;
      });
    } catch (error) {
      console.error('Error fetching territories:', error);
      throw error;
    }
  }

  async getById(tenantId: string, id: string): Promise<Territory | null> {
    try {
      const territoryRef = doc(db, 'tenants', tenantId, 'territories', id);
      const territoryDoc = await getDoc(territoryRef);
      
      if (!territoryDoc.exists()) {
        return null;
      }

      const data = territoryDoc.data();
      return {
        id: territoryDoc.id,
        type: data.type || 'branch',  // Ensure type is set
        branchId: data.type === 'branch' ? data.branchId : null,
        representativeId: data.type === 'representative' ? data.representativeId : null,
        ...data,  // Spread after setting specific fields to prevent overwrite
      } as Territory;
    } catch (error) {
      console.error('Error fetching territory:', error);
      throw error;
    }
  }

  async add(tenantId: string, territory: Omit<Territory, 'id'>): Promise<string> {
    try {
      if (!territory.boundary?.coordinates) {
        throw new Error('Territory boundary coordinates are required');
      }

      const metrics = this.calculateMetrics(territory.boundary.coordinates);
      const now = Timestamp.now();

      // Create territory document with all required fields
      const territoryData: any = {
        name: territory.name,
        type: territory.type,
        boundary: {
          coordinates: territory.boundary.coordinates,
          style: territory.boundary.style || {
            fillColor: '#3B82F6',
            strokeColor: '#2563EB',
            fillOpacity: 0.05,
            strokeOpacity: 1,
            strokeWeight: 2
          }
        },
        boundaries: territory.boundaries || {
          zipCodes: [],
          counties: [],
          cities: []
        },
        metrics,
        status: territory.status || 'active',
        metadata: {
          createdAt: now,
          createdBy: territory.metadata?.createdBy || '',
          updatedAt: now,
          updatedBy: territory.metadata?.updatedBy || '',
          version: 1
        }
      };

      // Add type-specific fields
      if (territory.type === 'branch') {
        territoryData.branchId = territory.branchId;
        // Explicitly set representativeId to null for branch territories
        territoryData.representativeId = null;
      } else if (territory.type === 'representative') {
        territoryData.representativeId = territory.representativeId;
        // Explicitly set branchId to null for representative territories
        territoryData.branchId = null;
      }

      const territoriesRef = collection(db, 'tenants', tenantId, 'territories');
      const docRef = await addDoc(territoriesRef, territoryData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding territory:', error);
      throw error;
    }
  }

  async update(tenantId: string, id: string, territory: Partial<Territory>): Promise<void> {
    try {
      const territoryRef = doc(db, 'tenants', tenantId, 'territories', id);
      const updateData: any = { ...territory };

      if (territory.boundary?.coordinates) {
        updateData.metrics = this.calculateMetrics(territory.boundary.coordinates);
      }

      updateData.metadata = {
        ...territory.metadata,
        updatedAt: Timestamp.now()
      };

      await updateDoc(territoryRef, updateData);
    } catch (error) {
      console.error('Error updating territory:', error);
      throw error;
    }
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    try {
      const territoryRef = doc(db, 'tenants', tenantId, 'territories', id);
      
      // Get territory data before deletion for activity log
      const territoryDoc = await getDoc(territoryRef);
      const territoryData = territoryDoc.data() as Territory;

      // Delete the territory
      await deleteDoc(territoryRef);

      // Log activity
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        type: 'delete',
        entityType: 'territory',
        entityId: id,
        entityName: territoryData.name,
        tenantId,
        userId,
        timestamp: Timestamp.now(),
        details: {
          type: territoryData.type,
          ...(territoryData.type === 'branch' 
            ? { branchId: territoryData.branchId } 
            : { representativeId: territoryData.representativeId })
        }
      });
    } catch (error) {
      console.error('Error deleting territory:', error);
      throw error;
    }
  }
}

export const territoryService = new TerritoryService();
