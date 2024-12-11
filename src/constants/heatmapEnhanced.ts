import { HeatmapControlLimits, HeatmapGradient } from '../types/heatMapControls';

export const HEATMAP_CONTROL_LIMITS: HeatmapControlLimits = {
  radius: {
    min: 10,
    max: 50,
    default: 30
  },
  opacity: {
    min: 0.3,
    max: 1.0,
    default: 0.7
  }
};

export const ENHANCED_GRADIENTS: HeatmapGradient[] = [
  {
    name: 'Territory Blue-Red',
    category: 'territory',
    description: 'Clear distinction between high and low density areas',
    gradient: [
      { color: 'rgba(0,0,255,0)', position: 0 },
      { color: 'rgba(0,0,255,0.5)', position: 0.2 },
      { color: 'rgba(0,0,255,0.8)', position: 0.4 },
      { color: 'rgba(255,0,0,0.8)', position: 0.6 },
      { color: 'rgba(255,0,0,1)', position: 0.8 }
    ]
  },
  {
    name: 'Density Green-Yellow',
    category: 'density',
    description: 'Smooth transition for population density visualization',
    gradient: [
      { color: 'rgba(0,255,0,0)', position: 0 },
      { color: 'rgba(0,255,0,0.6)', position: 0.3 },
      { color: 'rgba(255,255,0,0.8)', position: 0.6 },
      { color: 'rgba(255,0,0,1)', position: 0.9 }
    ]
  },
  {
    name: 'High Contrast',
    category: 'contrast',
    description: 'Maximum visibility and distinction between layers',
    gradient: [
      { color: 'rgba(0,0,0,0)', position: 0 },
      { color: 'rgba(128,0,128,0.7)', position: 0.4 },
      { color: 'rgba(255,165,0,0.9)', position: 0.8 }
    ]
  }
];

export const DEFAULT_HEATMAP_CONTROLS = {
  radius: HEATMAP_CONTROL_LIMITS.radius.default,
  opacity: HEATMAP_CONTROL_LIMITS.opacity.default,
  dissipating: true,
  mode: 'continuous' as const,
  zoomScale: true
};
