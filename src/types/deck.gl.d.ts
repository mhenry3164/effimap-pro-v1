declare module '@deck.gl/google-maps' {
  export interface GoogleMapsOverlayProps {
    layers: any[];
    onWebGLInitialized?: (gl: WebGLRenderingContext) => void;
    onWebGLContextLost?: () => void;
    onWebGLContextRestored?: () => void;
    parameters?: {
      depthTest?: boolean;
      blend?: boolean;
      blendFunc?: number[];
      blendEquation?: number;
    };
  }

  export class GoogleMapsOverlay {
    constructor(props?: GoogleMapsOverlayProps);
    setMap(map: google.maps.Map | null): void;
    setProps(props: Partial<GoogleMapsOverlayProps>): void;
    finalize(): void;
  }
}

declare module '@deck.gl/layers' {
  export interface GeoJsonLayerProps {
    id: string;
    data: {
      type: 'FeatureCollection';
      features: any[];
    };
    pickable?: boolean;
    stroked?: boolean;
    filled?: boolean;
    extruded?: boolean;
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    lineWidthUnits?: string;
    getLineColor?: number[] | ((d: any) => number[]);
    getFillColor?: number[] | ((d: any) => number[]);
    getLineWidth?: number | ((d: any) => number);
    opacity?: number;
    parameters?: {
      depthTest?: boolean;
      blend?: boolean;
      blendFunc?: number[];
      blendEquation?: number;
    };
    updateTriggers?: {
      [key: string]: any;
    };
  }

  export class GeoJsonLayer {
    constructor(props: GeoJsonLayerProps);
  }
  
  export class ScatterplotLayer {
    constructor(props: any);
  }
  
  export class PolygonLayer {
    constructor(props: any);
  }
  
  export class LineLayer {
    constructor(props: any);
  }
}
