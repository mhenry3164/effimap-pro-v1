import React, { useEffect, useRef } from 'react';
import { useMap } from '../../contexts/MapContext';
import { HeatMapPoint } from '../../types/heatMap';

interface HeatMapLayerProps {
  map: google.maps.Map;
}

export function HeatMapLayer({ map }: HeatMapLayerProps) {
  const { heatMapLayerVisible, heatMapData } = useMap();
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || !heatMapData?.points.length) return;

    try {
      // Initialize heatmap if not already created
      if (!heatmapRef.current) {
        heatmapRef.current = new google.maps.visualization.HeatmapLayer({
          radius: 20,
          opacity: 0.8,
          dissipating: true,
          data: []
        });
      }

      // Convert points to weighted LatLng points
      const points = heatMapData.points.map((point: HeatMapPoint) => {
        // Normalize weight between 0 and 1 if min/max provided
        let weight = point.weight;
        if (heatMapData.maxWeight !== undefined && 
            heatMapData.minWeight !== undefined && 
            heatMapData.maxWeight !== heatMapData.minWeight) {
          weight = (point.weight - heatMapData.minWeight) / (heatMapData.maxWeight - heatMapData.minWeight);
        }

        return {
          location: new google.maps.LatLng(point.lat, point.lng),
          weight
        };
      });

      // Update heatmap data
      if (heatmapRef.current) {
        heatmapRef.current.setData(points);
        heatmapRef.current.setMap(heatMapLayerVisible ? map : null);

        // Auto-fit bounds to show all points
        if (heatMapLayerVisible && points.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          points.forEach(point => bounds.extend(point.location));
          map.fitBounds(bounds);
        }
      }
    } catch (error) {
      console.error('Error initializing heatmap:', error);
    }

    // Cleanup
    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }
    };
  }, [map, heatMapData]);

  // Update visibility when heatMapLayerVisible changes
  useEffect(() => {
    if (heatmapRef.current) {
      heatmapRef.current.setMap(heatMapLayerVisible ? map : null);
    }
  }, [heatMapLayerVisible, map]);

  return null;
}
