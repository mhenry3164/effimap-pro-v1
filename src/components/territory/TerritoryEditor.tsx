import React, { useEffect, useState } from 'react';
import { Territory, TerritoryPoint, TerritoryUpdate } from '../../types/territory';
import { DEFAULT_TERRITORY_STYLE } from '../../config/constants';
import { Timestamp } from 'firebase/firestore';

interface TerritoryEditorProps {
  territory: Territory;
  onSave: (territory: TerritoryUpdate) => Promise<void>;
  onClose: () => void;
  map: google.maps.Map;
}

const TerritoryEditor: React.FC<TerritoryEditorProps> = ({
  territory,
  onSave,
  onClose,
  map
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [points, setPoints] = useState<TerritoryPoint[]>(territory.boundary?.coordinates || []);
  const [drawingPath, setDrawingPath] = useState<google.maps.Polyline | null>(null);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

  // Create polygon only once when component mounts
  useEffect(() => {
    if (!map) return;

    const newPolygon = new google.maps.Polygon({
      paths: points.map(point => ({ lat: point.lat, lng: point.lng })),
      ...DEFAULT_TERRITORY_STYLE,
      ...territory.boundary?.style,
      editable: true,
      draggable: true
    });

    newPolygon.setMap(map);
    setPolygon(newPolygon);

    // Add listeners
    const mouseUpListener = newPolygon.addListener('mouseup', () => {
      const path = newPolygon.getPath();
      const newPoints: TerritoryPoint[] = [];
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        newPoints.push({
          lat: point.lat(),
          lng: point.lng(),
          index: i
        });
      }
      setPoints(newPoints);
    });

    // Cleanup only when unmounting
    return () => {
      google.maps.event.removeListener(mouseUpListener);
      if (newPolygon) {
        // Make sure to set editable to false before removing
        newPolygon.setEditable(false);
        newPolygon.setMap(null);
      }
    };
  }, [map]); // Only depend on map

  // Update polygon path when points change
  useEffect(() => {
    if (!polygon || !points.length) return;

    const path = polygon.getPath();
    path.clear();
    points.forEach(point => {
      path.push(new google.maps.LatLng(point.lat, point.lng));
    });
  }, [points]);

  const cleanupMapObjects = () => {
    // Clean up drawing path if exists
    if (drawingPath) {
      drawingPath.setMap(null);
      setDrawingPath(null);
    }

    // Clean up polygon if exists
    if (polygon) {
      // First disable editing to remove edit points
      polygon.setEditable(false);
      // Then remove from map
      polygon.setMap(null);
      setPolygon(null);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Prepare update data
      const update: TerritoryUpdate = {
        id: territory.id,
        boundary: {
          type: 'Polygon',
          coordinates: points,
          style: territory.boundary?.style
        },
        metadata: {
          version: (territory.metadata?.version || 0) + 1,
          updatedAt: Timestamp.now(),
          updatedBy: 'current-user-id', // TODO: Get from auth context
        }
      };

      // First disable editing to remove edit points
      if (polygon) {
        polygon.setEditable(false);
      }

      // Let parent handle the save
      await onSave(update);

      // Clean up all map objects after successful save
      cleanupMapObjects();

      // Close the editor
      onClose();
    } catch (error) {
      console.error('Error saving territory:', error);
      // Re-enable editing if save failed
      if (polygon) {
        polygon.setEditable(true);
      }
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartDrawing = () => {
    if (!map) return;

    setIsDrawing(true);
    const polyline = new google.maps.Polyline({
      map,
      path: [],
      strokeColor: DEFAULT_TERRITORY_STYLE.strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    setDrawingPath(polyline);

    // Add click listener to map
    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const path = polyline.getPath();
      path.push(e.latLng);

      const point: TerritoryPoint = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        index: path.getLength() - 1
      };

      setPoints(prev => [...prev, point]);
    });

    return () => {
      google.maps.event.removeListener(clickListener);
      if (drawingPath) {
        drawingPath.setMap(null);
      }
    };
  };

  const handleFinishDrawing = () => {
    setIsDrawing(false);
    if (drawingPath) {
      drawingPath.setMap(null);
      setDrawingPath(null);
    }
  };

  const handleCancel = () => {
    cleanupMapObjects();
    onClose();
  };

  return (
    <div className="absolute bottom-4 right-4 space-y-2">
      {!isDrawing ? (
        <button
          onClick={handleStartDrawing}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          Start Drawing
        </button>
      ) : (
        <button
          onClick={handleFinishDrawing}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          Finish Drawing
        </button>
      )}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
};

export default TerritoryEditor;
