import { useState, useCallback, useRef } from 'react';
import { Territory } from '../types';

interface UseMapDrawingProps {
  onPolygonComplete: (polygon: google.maps.Polygon) => void;
  onRectangleComplete: (rectangle: google.maps.Rectangle) => void;
  selectedBranchId: string | null;
}

export default function useMapDrawing({ 
  onPolygonComplete, 
  onRectangleComplete, 
  selectedBranchId 
}: UseMapDrawingProps) {
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const selectedPolygonRef = useRef<google.maps.Polygon | null>(null);

  const initDrawingManager = useCallback((map: google.maps.Map) => {
    const manager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.35,
        editable: true
      },
      rectangleOptions: {
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.35,
        editable: true
      }
    });

    manager.setMap(map);
    setDrawingManager(manager);

    // Add completion listeners
    google.maps.event.addListener(manager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
      onPolygonComplete(polygon);
      manager.setDrawingMode(null);
    });

    google.maps.event.addListener(manager, 'rectanglecomplete', (rectangle: google.maps.Rectangle) => {
      onRectangleComplete(rectangle);
      manager.setDrawingMode(null);
    });
  }, [onPolygonComplete, onRectangleComplete]);

  const startDrawing = useCallback((shape: 'polygon' | 'rectangle') => {
    if (drawingManager) {
      drawingManager.setDrawingMode(
        shape === 'polygon' 
          ? google.maps.drawing.OverlayType.POLYGON 
          : google.maps.drawing.OverlayType.RECTANGLE
      );
    }
  }, [drawingManager]);

  const toggleEditing = useCallback(() => {
    setIsEditing(prev => !prev);
    if (selectedPolygonRef.current) {
      selectedPolygonRef.current.setEditable(!isEditing);
    }
  }, [isEditing]);

  const deleteSelected = useCallback(() => {
    if (selectedPolygonRef.current) {
      selectedPolygonRef.current.setMap(null);
      selectedPolygonRef.current = null;
    }
  }, []);

  return {
    initDrawingManager,
    startDrawing,
    toggleEditing,
    deleteSelected,
    isEditing,
    selectedPolygon: selectedPolygonRef.current,
  };
}

function getPolygonCoordinates(polygon: google.maps.Polygon): [number, number][] {
  const coordinates: [number, number][] = [];
  const path = polygon.getPath();
  
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    coordinates.push([point.lat(), point.lng()]);
  }
  
  return coordinates;
}

function getRectangleCoordinates(rectangle: google.maps.Rectangle): [number, number][] {
  const bounds = rectangle.getBounds()!;
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const nw = new google.maps.LatLng(ne.lat(), sw.lng());
  const se = new google.maps.LatLng(sw.lat(), ne.lng());

  return [
    [ne.lat(), ne.lng()],
    [se.lat(), se.lng()],
    [sw.lat(), sw.lng()],
    [nw.lat(), nw.lng()],
    [ne.lat(), ne.lng()], // Close the polygon
  ];
}