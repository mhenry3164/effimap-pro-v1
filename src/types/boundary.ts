export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
  properties: {
    [key: string]: any;
  };
  id?: string | number;
}

export interface BoundaryFeature {
  type: 'Feature';
  properties: {
    name: string;
    type: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
}

export interface BoundaryData {
  type: 'FeatureCollection';
  features: BoundaryFeature[];
}
