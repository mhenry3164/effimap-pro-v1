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
    newPolygon.addListener('mouseup', () => {
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
      newPolygon.setMap(null);
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

  const handleSave = async () => {
    try {
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

      // First, disable editing and remove the polygon
      if (polygon) {
        polygon.setEditable(false);
        polygon.setMap(null);
        setPolygon(null);
      }

      await onSave(update);
      onClose();
    } catch (error) {
      console.error('Error saving territory:', error);
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

  return (
    <div className="absolute bottom-4 right-4 space-y-2">
      {!isDrawing ? (
        <button
          onClick={handleStartDrawing}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Start Drawing
        </button>
      ) : (
        <button
          onClick={handleFinishDrawing}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Finish Drawing
        </button>
      )}
      <button
        onClick={handleSave}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
      >
        Save Changes
      </button>
    </div>
  );
};

export default TerritoryEditor;
