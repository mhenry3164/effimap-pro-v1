import React, { useEffect, useRef } from 'react';
import { useMap } from '../../contexts/MapContext';
import { HeatMapPoint } from '../../types/heatMap';
import { HEATMAP_CONTROL_LIMITS } from '../../constants/heatmapEnhanced';

interface HeatMapLayerProps {
  map: google.maps.Map;
}

export function HeatMapLayer({ map }: HeatMapLayerProps) {
  const { heatMapLayerVisible, activeHeatMapLayers } = useMap();
  const heatmapRefs = useRef<Map<string, google.maps.visualization.HeatmapLayer>>(new Map());

  // Handle zoom-based scaling
  const handleZoomChange = (heatmap: google.maps.visualization.HeatmapLayer, settings: any) => {
    if (!map || !settings.zoomScale) return;

    const zoom = map.getZoom() || 0;
    const baseZoom = 10; // Reference zoom level
    const zoomFactor = Math.pow(1.2, zoom - baseZoom);
    
    const scaledRadius = Math.max(
      HEATMAP_CONTROL_LIMITS.radius.min,
      Math.min(
        HEATMAP_CONTROL_LIMITS.radius.max,
        settings.radius * zoomFactor
      )
    );

    // Only update radius during zoom
    heatmap.set('radius', scaledRadius);
  };

  useEffect(() => {
    if (!map) return;

    try {
      // Create or update heatmap layers
      activeHeatMapLayers.forEach(layer => {
        if (!layer.dataset.points) return;

        // Initialize heatmap if not already created
        if (!heatmapRefs.current.has(layer.dataset.id)) {
          // Create base heatmap with minimal options
          const heatmap = new google.maps.visualization.HeatmapLayer({
            map: null,
            data: [],
            dissipating: true // Set default dissipating
          });

          heatmapRefs.current.set(layer.dataset.id, heatmap);

          // Add zoom listener if not already added
          if (layer.settings.controls?.zoomScale) {
            map.addListener('zoom_changed', () => {
              handleZoomChange(heatmap, layer.settings.controls);
            });
          }
        }

        const heatmap = heatmapRefs.current.get(layer.dataset.id);
        if (!heatmap) return;

        // Get controls with defaults
        const controls = layer.settings.controls || {
          radius: HEATMAP_CONTROL_LIMITS.radius.default,
          opacity: HEATMAP_CONTROL_LIMITS.opacity.default,
          dissipating: true,
          mode: 'continuous',
          zoomScale: true
        };

        // Apply mode-specific settings
        switch (controls.mode) {
          case 'hotspot':
            // Hotspot mode: Smaller radius, always dissipating, higher intensity
            heatmap.set('radius', Math.max(controls.radius * 0.5, HEATMAP_CONTROL_LIMITS.radius.min));
            heatmap.set('dissipating', true);
            heatmap.set('maxIntensity', undefined); // Let it auto-scale for hotspots
            break;
          case 'contour':
            // Contour mode: Larger radius, no dissipation, fixed intensity
            heatmap.set('radius', Math.min(controls.radius * 2, HEATMAP_CONTROL_LIMITS.radius.max));
            heatmap.set('dissipating', false);
            heatmap.set('maxIntensity', 3); // Fixed intensity for contours
            break;
          case 'continuous':
          default:
            // Continuous mode: Normal radius, dissipating, moderate intensity
            heatmap.set('radius', controls.radius);
            heatmap.set('dissipating', true);
            heatmap.set('maxIntensity', 5); // Moderate fixed intensity
            break;
        }

        // Set opacity after mode-specific settings
        heatmap.set('opacity', controls.opacity);

        // Apply gradient if available (before setting data)
        if (layer.settings.gradient && Array.isArray(layer.settings.gradient)) {
          const validGradient = layer.settings.gradient
            .filter(color => typeof color === 'string' && color.trim() !== '')
            .map(color => color.trim());

          if (validGradient.length > 0) {
            // Store gradient to prevent it from being lost during zoom
            (heatmap as any)._gradient = validGradient;
            heatmap.set('gradient', validGradient);
          }
        } else if ((heatmap as any)._gradient) {
          // Restore gradient if it was lost
          heatmap.set('gradient', (heatmap as any)._gradient);
        }

        // Normalize and prepare points
        const points = layer.dataset.points.map((point: HeatMapPoint) => {
          const weight = normalizeWeight(point.weight, layer.settings.minWeight, layer.settings.maxWeight);
          return {
            location: new google.maps.LatLng(point.lat, point.lng),
            weight: weight
          };
        });

        // Update data and visibility
        heatmap.setData(points);
        heatmap.setMap(heatMapLayerVisible && layer.settings.visible ? map : null);

        // Apply initial zoom scaling if enabled
        if (controls.zoomScale) {
          handleZoomChange(heatmap, controls);
        }
      });

      // Clean up removed layers
      heatmapRefs.current.forEach((heatmap, id) => {
        if (!activeHeatMapLayers.find(layer => layer.dataset.id === id)) {
          heatmap.setMap(null);
          heatmapRefs.current.delete(id);
        }
      });
    } catch (error) {
      console.error('Error managing heatmap layers:', error);
    }

    // Cleanup on unmount
    return () => {
      heatmapRefs.current.forEach(heatmap => {
        heatmap.setMap(null);
      });
      heatmapRefs.current.clear();
    };
  }, [map, heatMapLayerVisible, activeHeatMapLayers]);

  return null;
}

// Helper function to normalize weights between 0 and 1
function normalizeWeight(weight: number, minWeight: number, maxWeight: number): number {
  let normalized;
  if (weight >= 0) {
    normalized = (weight - minWeight) / (maxWeight - minWeight);
  } else {
    normalized = Math.abs(weight) / Math.abs(minWeight);
  }
  return Math.max(0, Math.min(1, normalized));
}
