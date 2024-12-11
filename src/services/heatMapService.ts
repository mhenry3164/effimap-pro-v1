import { db } from '../firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { HeatMapDataset, NewHeatMapDataset, HeatMapPoint } from '../types/heatMap';
import { ZipCodeTotal } from '../types/zipCode';
import { zipCodeService } from './zipCodeService';

class HeatMapService {
  async createFromZipTotals(tenantId: string, dataset: NewHeatMapDataset, zipTotals: ZipCodeTotal[]): Promise<HeatMapDataset> {
    if (!tenantId) throw new Error('Tenant ID is required');

    // Convert zip totals to points with lat/lng
    const points: HeatMapPoint[] = [];
    for (const zipTotal of zipTotals) {
      const location = await zipCodeService.getLocation(zipTotal.zip);
      if (location) {
        points.push({
          lat: location.lat,
          lng: location.lng,
          weight: zipTotal.total
        });
      }
    }

    if (points.length === 0) {
      throw new Error('No valid points found');
    }

    // Calculate metadata
    const weights = points.map(p => p.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);

    // Create dataset document
    const datasetId = doc(collection(db, 'tenants/heavy-machines/heatMaps')).id;
    const now = Timestamp.now();

    const heatMapDataset: HeatMapDataset = {
      id: datasetId,
      name: dataset.name,
      description: dataset.description,
      points,
      metadata: {
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        maxWeight,
        minWeight,
        totalPoints: points.length
      },
      status: 'active'
    };

    // Save to Firestore
    await setDoc(
      doc(db, 'tenants/heavy-machines/heatMaps', datasetId),
      heatMapDataset
    );

    return heatMapDataset;
  }

  async getDatasets(tenantId: string): Promise<HeatMapDataset[]> {
    try {
      console.log('Fetching datasets from Firestore');
      // Use the correct path for heavy-machines tenant
      const snapshot = await getDocs(collection(db, 'tenants/heavy-machines/heatMaps'));
      console.log('Firestore snapshot:', snapshot.docs.length, 'documents found');
      
      const datasets = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing document:', doc.id, data);
        
        // Ensure Timestamp objects are properly handled
        return {
          ...data,
          id: doc.id,
          metadata: {
            ...data.metadata,
            createdAt: data.metadata.createdAt,
            updatedAt: data.metadata.updatedAt
          }
        } as HeatMapDataset;
      });

      console.log('Processed datasets:', datasets);

      // Sort by updatedAt timestamp, most recent first
      return datasets.sort((a, b) => 
        b.metadata.updatedAt.toMillis() - a.metadata.updatedAt.toMillis()
      );
    } catch (error) {
      console.error('Error fetching heat map datasets:', error);
      throw error;
    }
  }

  async getDataset(tenantId: string, datasetId: string): Promise<HeatMapDataset | null> {
    if (!datasetId) return null;

    try {
      const docRef = doc(db, 'tenants/heavy-machines/heatMaps', datasetId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        metadata: {
          ...data.metadata,
          createdAt: data.metadata.createdAt,
          updatedAt: data.metadata.updatedAt
        }
      } as HeatMapDataset;
    } catch (error) {
      console.error('Error fetching heat map dataset:', error);
      throw error;
    }
  }

  async deleteDataset(tenantId: string, datasetId: string): Promise<void> {
    if (!datasetId) throw new Error('Dataset ID is required');
    await deleteDoc(doc(db, 'tenants/heavy-machines/heatMaps', datasetId));
  }

  async updateDataset(tenantId: string, datasetId: string, updates: { name?: string }): Promise<void> {
    if (!tenantId || !datasetId) throw new Error('Tenant ID and Dataset ID are required');

    try {
      const docRef = doc(db, 'tenants/heavy-machines/heatMaps', datasetId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Dataset not found');
      }

      const currentData = docSnap.data();
      const updatedData = {
        ...currentData,
        name: updates.name || currentData.name,
        metadata: {
          ...currentData.metadata,
          updatedAt: Timestamp.now()
        }
      };

      await setDoc(docRef, updatedData);
    } catch (error) {
      console.error('Error updating heat map dataset:', error);
      throw error;
    }
  }

  async archiveDataset(tenantId: string, datasetId: string): Promise<void> {
    if (!datasetId) throw new Error('Dataset ID is required');

    const docRef = doc(db, 'tenants/heavy-machines/heatMaps', datasetId);
    await setDoc(docRef, { 
      status: 'archived', 
      metadata: { updatedAt: Timestamp.now() } 
    }, { merge: true });
  }
}

export const heatMapService = new HeatMapService();
