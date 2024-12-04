import { Timestamp } from 'firebase/firestore';

export interface HeatMapPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface HeatMapDataset {
  id: string;
  name: string;
  description?: string;
  points: HeatMapPoint[];
  metadata: {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
    maxWeight: number;
    minWeight: number;
    totalPoints: number;
  };
  status: 'active' | 'archived';
}

export interface NewHeatMapDataset {
  name: string;
  description?: string;
  points: HeatMapPoint[];
}
