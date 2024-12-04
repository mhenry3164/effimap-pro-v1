// types/index.ts

// Re-export all types
export * from './territory';
export * from './branch';
export * from './representative';
export * from './activity';
export * from './user';
export * from './lead';
export * from './boundary';
export * from './map';

// Override TerritoryPoint for Google Maps compatibility
export interface TerritoryPoint {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  index: number;
}

export interface TerritoryPath {
  id: string;
  points: TerritoryPoint[];
  isComplete: boolean;
}

export interface Territory {
  id?: string;
  name: string;
  type: 'branch' | 'representative';
  paths: TerritoryPath[];
  style: {
    fillColor: string;
    strokeColor: string;
    fillOpacity: number;
    strokeOpacity: number;
    strokeWeight: number;
  };
  metadata: {
    version: number;
    isLocked: boolean;
    createdBy: string;
    lastModifiedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  branchId?: string;
  representativeId?: string;
  boundaryData: {
    zipCodes: string[];
    counties: string[];
    cities: string[];
  };
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  coordinates: [number, number];
  createdAt: Date;
  updatedAt: Date;
}

export interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  branchId: string;
  coordinates: [number, number];
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  type: 'territory_created' | 'territory_updated' | 'territory_deleted' | 
        'branch_created' | 'branch_updated' | 'branch_deleted' |
        'representative_created' | 'representative_updated' | 'representative_deleted';
  entityId: string;
  entityType: 'territory' | 'branch' | 'representative';
  userId: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  territoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'representative';
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OverlayType = 'territory' | 'branch' | 'representative';

export interface BoundaryData {
  zipCodes: Array<{
    id: string;
    name: string;
    coordinates?: [number, number];
  }>;
  counties: Array<{
    id: string;
    name: string;
    state: string;
    coordinates?: [number, number];
  }>;
  cities: Array<{
    id: string;
    name: string;
    state: string;
    coordinates?: [number, number];
  }>;
}

export interface BoundaryFeature {
  type: keyof BoundaryData;
  id: string;
  name: string;
  state?: string;
  coordinates: [number, number];
  properties?: {
    [key: string]: any;
  };
}

export interface MapSettings {
  showBoundaries: boolean;
  boundaryType: keyof BoundaryData;
  showLabels: boolean;
  clusterMarkers: boolean;
  visibleLayers: OverlayType[];
}

export interface ExportData {
  territory: Territory;
  boundaries: {
    zipCodes: BoundaryData['zipCodes'];
    counties: BoundaryData['counties'];
    cities: BoundaryData['cities'];
  };
  metadata: {
    exportDate: Date;
    exportedBy: User;
    version: string;
  };
}

// Add type guards if needed
export function isBoundaryFeature(feature: unknown): feature is BoundaryFeature {
  if (!feature || typeof feature !== 'object') return false;
  
  const f = feature as Partial<BoundaryFeature>;
  return (
    typeof f.type === 'string' &&
    typeof f.id === 'string' &&
    typeof f.name === 'string' &&
    (f.state === undefined || typeof f.state === 'string') &&
    Array.isArray(f.coordinates) &&
    f.coordinates.length === 2 &&
    typeof f.coordinates[0] === 'number' &&
    typeof f.coordinates[1] === 'number'
  );
}

export function isValidTerritory(territory: unknown): territory is Territory {
  if (!territory || typeof territory !== 'object') return false;
  
  const t = territory as Partial<Territory>;
  return (
    (t.id === undefined || typeof t.id === 'string') &&
    typeof t.name === 'string' &&
    (t.type === 'branch' || t.type === 'representative') &&
    Array.isArray(t.paths) &&
    t.paths.every(path => (
      typeof path.id === 'string' &&
      Array.isArray(path.points) &&
      path.points.every(point => (
        typeof point.id === 'string' &&
        typeof point.position === 'object' &&
        typeof point.position.lat === 'number' &&
        typeof point.position.lng === 'number' &&
        typeof point.index === 'number'
      )) &&
      typeof path.isComplete === 'boolean'
    )) &&
    (t.branchId === undefined || typeof t.branchId === 'string') &&
    (t.representativeId === undefined || typeof t.representativeId === 'string') &&
    (t.boundaryData === undefined || (
      Array.isArray(t.boundaryData.zipCodes) &&
      Array.isArray(t.boundaryData.counties) &&
      Array.isArray(t.boundaryData.cities)
    )) &&
    (t.createdAt === undefined || t.createdAt instanceof Date) &&
    (t.updatedAt === undefined || t.updatedAt instanceof Date)
  );
}