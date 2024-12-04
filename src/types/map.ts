import { Feature } from 'geojson';
import { TerritoryPoint } from './territory';

/**
 * Map entity with coordinates
 */
export interface MapEntity {
  id: string;
  name: string;
  coordinates: [number, number] | null;
  address?: string;
}

/**
 * Branch entity
 */
export interface Branch extends MapEntity {
  code: string;
  managerEmail: string;
  status: 'active' | 'inactive' | 'pending';
  territory: string | null;
}

/**
 * Representative entity
 */
export interface Representative extends MapEntity {
  email: string;
  phone: string;
  territory: string | null;
  status: 'active' | 'inactive';
}

/**
 * Extended GeoJSON Feature type with required properties
 */
export interface GeoJSONFeature {
  type: string;
  properties: {
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][] | number[];
  };
}

/**
 * Map viewport bounds
 */
export interface MapViewport {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  bounds?: google.maps.LatLngBounds;
}

/**
 * Map tile coordinates
 */
export interface TileCoordinate {
  x: number;
  y: number;
  z: number;
}

/**
 * Available overlay types for the map
 */
export type OverlayType = 'territory' | 'branch' | 'representative' | 'region' | 'district' | 'area';

/**
 * Visible layers configuration
 */
export interface VisibleLayers {
  branches: boolean;
  representatives: boolean;
  territories: boolean;
  regions: boolean;
  districts: boolean;
  areas: boolean;
  state: boolean;
  county: boolean;
  zip: boolean;
}

/**
 * Map boundary style configuration
 */
export interface BoundaryStyle {
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  fillColor: string;
  fillOpacity: number;
}

/**
 * Map boundary type
 */
export type BoundaryType = 'state' | 'county' | 'zip' | 'territory';

/**
 * Map boundary configuration
 */
export interface BoundaryConfig {
  id: string;
  name: string;
  color: string;
  type: BoundaryType;
  style?: Partial<BoundaryStyle>;
}

/**
 * Map entity type
 */
export type MapEntityType = 'territory' | 'branch' | 'representative';

/**
 * Google Maps Feature Layer types
 */
export type GoogleMapsFeatureType = 
  | 'administrative.locality'
  | 'administrative.neighborhood'
  | 'administrative.land_parcel'
  | 'administrative.province';

/**
 * Google Maps Feature Layer style options
 */
export interface FeatureStyleOptions {
  visible?: boolean;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
}

/**
 * Map layer configuration
 */
export interface MapLayerConfig {
  featureType: GoogleMapsFeatureType;
  style: FeatureStyleOptions;
  visible: boolean;
}

/**
 * Map state configuration
 */
export interface MapState {
  center: google.maps.LatLngLiteral;
  zoom: number;
  selectedTerritory: string | null;
  visibleLayers: VisibleLayers;
  boundaryConfigs: BoundaryConfig[];
  isDrawingMode: boolean;
}
