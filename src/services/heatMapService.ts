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
    const datasetId = doc(collection(db, 'tenants', tenantId, 'heatMaps')).id;
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
      doc(db, 'tenants', tenantId, 'heatMaps', datasetId),
      heatMapDataset
    );

    return heatMapDataset;
  }

  async getDatasets(tenantId: string): Promise<HeatMapDataset[]> {
    if (!tenantId) throw new Error('Tenant ID is required');

    const snapshot = await getDocs(collection(db, 'tenants', tenantId, 'heatMaps'));
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }) as HeatMapDataset);
  }

  async getDataset(tenantId: string, datasetId: string): Promise<HeatMapDataset | null> {
    if (!tenantId || !datasetId) return null;

    const docRef = doc(db, 'tenants', tenantId, 'heatMaps', datasetId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? {
      ...docSnap.data(),
      id: docSnap.id
    } as HeatMapDataset : null;
  }

  async deleteDataset(tenantId: string, datasetId: string): Promise<void> {
    if (!tenantId || !datasetId) throw new Error('Tenant ID and dataset ID are required');

    await deleteDoc(doc(db, 'tenants', tenantId, 'heatMaps', datasetId));
  }

  async archiveDataset(tenantId: string, datasetId: string): Promise<void> {
    if (!tenantId || !datasetId) throw new Error('Tenant ID and dataset ID are required');

    const docRef = doc(db, 'tenants', tenantId, 'heatMaps', datasetId);
    await setDoc(docRef, { 
      status: 'archived', 
      metadata: { updatedAt: Timestamp.now() } 
    }, { merge: true });
  }
}

export const heatMapService = new HeatMapService();
