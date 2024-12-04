import { Timestamp } from 'firebase/firestore';
import { Territory as CoreTerritory } from './territory';
import { User as CoreUser } from './user';

// Type definitions
export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface TenantMetadata {
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
  version: number;
  notes?: string;
  customFields?: Record<string, unknown>;
}

export interface TenantSettings {
  territoryTypes: string[];
  defaultTerritoryStyle?: {
    fillColor: string;
    strokeColor: string;
    fillOpacity: number;
    strokeOpacity: number;
    strokeWeight: number;
  };
  mapSettings?: {
    defaultCenter: GeoPoint;
    defaultZoom: number;
    maxZoom?: number;
    minZoom?: number;
  };
  features?: {
    enableTerritoryClustering?: boolean;
    enableCustomFields?: boolean;
    enableBulkOperations?: boolean;
    maxTerritories?: number;
  };
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  location?: GeoPoint;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  status: 'active' | 'inactive';
  metadata: TenantMetadata;
}

export interface Representative {
  id: string;
  name: string;
  code: string;
  branchId: string | null;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  territories?: string[];
  metadata: TenantMetadata;
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  settings: TenantSettings;
  metadata: TenantMetadata;
  branches: Record<string, Branch>;
  representatives: Record<string, Representative>;
  territories: Record<string, CoreTerritory>;
  users: Record<string, CoreUser>;
}

export interface NewTenant extends Omit<Tenant, 'id' | 'metadata'> {
  metadata: {
    createdBy: string;
    updatedBy: string;
    version: number;
    notes?: string;
    customFields?: Record<string, unknown>;
  };
}

export interface TenantUpdate extends Partial<Omit<Tenant, 'id' | 'metadata'>> {
  metadata?: Partial<Omit<TenantMetadata, 'createdAt' | 'createdBy'>>;
}

export interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: Error | null;
  branches: Branch[];
  representatives: Representative[];
  refreshTenant: () => Promise<void>;
  updateTenant: (update: TenantUpdate) => Promise<void>;
  fetchBranches: () => Promise<void>;
  fetchRepresentatives: () => Promise<void>;
  setTenant: (tenant: Tenant | null) => void;
}