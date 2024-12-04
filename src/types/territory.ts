import { Timestamp } from 'firebase/firestore';
import { BoundaryStyle } from './map';

export type TerritoryType = 'branch' | 'representative' | 'sales' | 'service' | 'mixed';
export type TerritoryStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface TerritoryPoint {
  lat: number;
  lng: number;
  index: number;
}

export interface TerritoryPath {
  id: string;
  points: TerritoryPoint[];
  completed: boolean;
}

export interface TerritoryStyle extends BoundaryStyle {
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  fillColor: string;
  fillOpacity: number;
}

export interface TerritoryMetadata {
  version: number;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
  notes?: string;
  customFields?: Record<string, unknown>;
}

export interface TerritoryMetrics {
  area: number;
  perimeter: number;
  pointCount: number;
}

export interface TerritoryBoundary {
  type: 'Polygon';
  coordinates: TerritoryPoint[];
  style?: TerritoryStyle;
}

export interface TerritoryBase {
  id?: string;
  name: string;
  code: string;
  type: TerritoryType;
  status: TerritoryStatus;
  boundary?: TerritoryBoundary;
  metadata?: TerritoryMetadata;
  metrics?: TerritoryMetrics;
  center?: {
    lat: number;
    lng: number;
  };
  parent?: string;
  children?: string[];
  assignedTo?: string[];
  tags?: string[];
}

export interface Territory extends TerritoryBase {
  id: string;
  metadata: TerritoryMetadata;
  boundary: TerritoryBoundary;
  metrics: TerritoryMetrics;
  center: {
    lat: number;
    lng: number;
  };
}

export interface NewTerritory extends Omit<TerritoryBase, 'id'> {
  metadata?: Partial<TerritoryMetadata>;
  metrics?: Partial<TerritoryMetrics>;
}

export interface TerritoryUpdate extends Partial<TerritoryBase> {
  id: string;
  metadata?: Partial<TerritoryMetadata>;
}

export interface TerritoryDrawingState {
  isDrawing: boolean;
  currentPath: TerritoryPoint[];
  completedPaths: TerritoryPath[];
  points: TerritoryPoint[];
  isComplete: boolean;
}

export interface TerritoryFilter {
  type?: TerritoryType[];
  status?: TerritoryStatus[];
  branchId?: string;
  representativeId?: string;
  searchText?: string;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
}

export interface MapFeature {
  id: string;
  type: 'polygon' | 'marker' | 'polyline';
  coordinates: TerritoryPoint[];
  properties?: Record<string, unknown>;
}

// Helper functions
export function isTerritoryComplete(territory: Territory | NewTerritory): boolean {
  return !!(territory.boundary?.coordinates?.length && territory.name && territory.code);
}

export function getTerritoryDisplayName(territory: Territory | NewTerritory): string {
  return `${territory.name} (${territory.code})`;
}

// Default styles
export const DEFAULT_TERRITORY_STYLE: TerritoryStyle = {
  fillColor: '#3B82F6',
  strokeColor: '#2563EB',
  fillOpacity: 0.35,
  strokeOpacity: 1,
  strokeWeight: 2
};
