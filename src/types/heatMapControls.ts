import { HeatMapDataset } from './heatMap';

export interface HeatmapControlSettings {
  radius: number;
  opacity: number;
  dissipating: boolean;
  mode: HeatmapVisualizationMode;
  zoomScale: boolean;
}

export type HeatmapVisualizationMode = 'hotspot' | 'continuous' | 'contour';

export interface HeatmapControlLimits {
  radius: {
    min: number;
    max: number;
    default: number;
  };
  opacity: {
    min: number;
    max: number;
    default: number;
  };
}

export interface HeatmapGradient {
  name: string;
  gradient: Array<{
    color: string;
    position: number;
  }>;
  description: string;
  category: 'territory' | 'density' | 'contrast';
}

// Type guard for visualization mode
export function isValidVisualizationMode(mode: string): mode is HeatmapVisualizationMode {
  return ['hotspot', 'continuous', 'contour'].includes(mode);
}

export interface HeatMapLayerWithControls extends HeatMapDataset {
  controls: HeatmapControlSettings;
}
