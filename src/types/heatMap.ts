import { Timestamp } from 'firebase/firestore';

export interface HeatMapPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface HeatMapMetadata {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  maxWeight: number;
  minWeight: number;
  totalPoints: number;
}

export interface HeatMapDataset {
  id: string;
  name: string;
  description: string;
  points: HeatMapPoint[];
  metadata: HeatMapMetadata;
  status: 'active' | 'archived';
}

export interface NewHeatMapDataset {
  name: string;
  description: string;
  points: HeatMapPoint[];
}

export interface HeatMapLayerSettings {
  visible: boolean;
  minWeight: number;
  maxWeight: number;
  gradient?: string[];
}

export interface ActiveHeatMapLayer {
  dataset: HeatMapDataset;
  settings: HeatMapLayerSettings;
}
