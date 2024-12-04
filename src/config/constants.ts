export const DEFAULT_TERRITORY_STYLE = {
  strokeColor: '#2563EB',
  strokeOpacity: 1.0,
  strokeWeight: 2,
  fillColor: '#3B82F6',
  fillOpacity: 0.35,
  zIndex: 1
};

export const MAP_CONFIG = {
  defaultCenter: { lat: 37.0902, lng: -95.7129 }, // USA center
  defaultZoom: 4,
  minZoom: 3,
  maxZoom: 20,
  styles: [] // Add custom map styles here if needed
};

export const TERRITORY_LIMITS = {
  minPoints: 3,
  maxPoints: 1000,
  minArea: 100, // square meters
  maxArea: 1000000 // square meters
};
