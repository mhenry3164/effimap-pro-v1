import { env } from './env';
import { Libraries } from '@react-google-maps/api';

if (!env.GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API Key is missing or invalid');
}

/**
 * Centralized Google Maps configuration
 */
export const googleMapsConfig = {
  googleMapsApiKey: env.GOOGLE_MAPS_API_KEY,
  libraries: ['drawing', 'geometry', 'places', 'visualization'] as Libraries,
  version: 'beta',
  language: 'en',
  region: 'US',
  id: 'google-map-script',
} as const;

/**
 * Map options configuration
 */
export const getMapOptions = () => ({
  mapId: 'f7ad2d7315f39b1',
  styleId: 'c240359524581b51',
  disableDefaultUI: false,
  clickableIcons: true,
  mapTypeControl: true,
  mapTypeControlOptions: {
    position: window.google?.maps.ControlPosition.TOP_LEFT,
    style: window.google?.maps.MapTypeControlStyle.HORIZONTAL_BAR
  },
  zoomControl: false,
  streetViewControl: true,
  streetViewControlOptions: {
    position: window.google?.maps.ControlPosition.RIGHT_BOTTOM
  },
  tilt: 0,
  heading: 0,
  mapTypeId: 'roadmap',
});

/**
 * Feature layer styling functions
 */
export const getFeatureStyle = (type: 'state' | 'county' | 'zipcode', isVisible: boolean): google.maps.FeatureStyleOptions | undefined => {
  if (!isVisible) return undefined;

  const styles = {
    state: {
      strokeColor: '#08519c',
      strokeWeight: 1.4,
      fillColor: '#377eb8',
      fillOpacity: 0.1,
      strokeOpacity: 1.0
    },
    county: {
      strokeColor: '#238b45',
      strokeWeight: 1.2,
      fillColor: '#4daf4a',
      fillOpacity: 0.1,
      strokeOpacity: 1.0
    },
    zipcode: {
      strokeColor: '#d94801',
      strokeWeight: 0.8,
      fillColor: '#ff7f00',
      fillOpacity: 0.1,
      strokeOpacity: 1.0
    }
  };

  return styles[type];
};

/**
 * Default deck.gl configuration
 */
export const deckGlConfig = {
  parameters: {
    depthTest: false, // Required for proper overlay rendering
    blend: true,
    blendFunc: [
      WebGLRenderingContext.SRC_ALPHA,
      WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
    ],
    blendEquation: WebGLRenderingContext.FUNC_ADD,
  },
  controller: true,
} as const;
