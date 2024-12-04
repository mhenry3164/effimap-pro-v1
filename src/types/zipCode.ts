export interface ZipCode {
  zip: string;
  lat: number;
  lng: number;
}

export interface ZipCodeTotal {
  zip: string;
  total: number;
}

export interface ZipCodeLocation extends ZipCodeTotal {
  lat: number;
  lng: number;
}

export interface HeatMapData {
  locations: ZipCodeLocation[];
  maxTotal?: number;
  minTotal?: number;
}
