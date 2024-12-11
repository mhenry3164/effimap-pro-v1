import React, { useEffect, useState } from 'react';
import { Territory, TerritoryPoint, TerritoryUpdate } from '../../types/territory';
import { DEFAULT_TERRITORY_STYLE } from '../../config/constants';
import { Timestamp } from 'firebase/firestore';
import { useMap } from '../../contexts/MapContext';
import toast from 'react-hot-toast'; // Import toast

interface TerritoryEditorProps {
  territory: Territory;
  onSave: (territory: TerritoryUpdate) => Promise<boolean>; // Update return type
  onClose: () => void;
  map: google.maps.Map;
}

const TerritoryEditor: React.FC<TerritoryEditorProps> = ({
  territory,
  onSave,
  onClose,
  map
}) => {
  const { isDrawingMode, setIsDrawingMode } = useMap();
  const [isSaving, setIsSaving] = useState(false);
  const [points, setPoints] = useState<TerritoryPoint[]>(territory.boundary?.coordinates || []);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [drawingPath, setDrawingPath] = useState<google.maps.Polyline | null>(null);
  const [clickListener, setClickListener] = useState<google.maps.MapsEventListener | null>(null);

  // Create polygon for editing when component mounts
  useEffect(() => {
    if (!map) return;

    // Create the editable polygon
    const newPolygon = new google.maps.Polygon({
      map,
      paths: points.map(point => ({ lat: point.lat, lng: point.lng })),
      ...DEFAULT_TERRITORY_STYLE,
      ...territory.boundary?.style,
      editable: true,
      draggable: true,
      geodesic: true
    });

    setPolygon(newPolygon);

    // Add listener for path changes
    const pathListener = newPolygon.addListener('mouseup', () => {
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

    return () => {
      google.maps.event.removeListener(pathListener);
      if (newPolygon) {
        newPolygon.setMap(null);
      }
    };
  }, [map]);

  // Handle drawing mode for adding new points
  useEffect(() => {
    if (!isDrawingMode || !map || !polygon) return;

    // Create polyline for drawing new points
    const polyline = new google.maps.Polyline({
      map,
      path: [],
      geodesic: true,
      strokeColor: DEFAULT_TERRITORY_STYLE.strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    setDrawingPath(polyline);

    // Add click listener for adding new points
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const path = polygon.getPath();
      path.push(e.latLng);

      const newPoint: TerritoryPoint = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        index: path.getLength() - 1
      };

      setPoints(prev => [...prev, newPoint]);
    });

    setClickListener(listener);

    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [isDrawingMode, map, polygon]);

  const handleSave = async () => {
    if (isSaving || !points.length) return;
    
    setIsSaving(true);
    try {
      // Ensure polygon is closed
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const closedPoints = firstPoint.lat === lastPoint.lat && firstPoint.lng === lastPoint.lng
        ? points
        : [...points, { ...firstPoint, index: points.length }];

      // Prepare update data
      const update: TerritoryUpdate = {
        id: territory.id,
        boundary: {
          type: 'Polygon',
          coordinates: closedPoints,
          style: territory.boundary?.style
        },
        metadata: {
          version: (territory.metadata?.version || 0) + 1,
          updatedAt: Timestamp.now(),
          updatedBy: 'current-user-id', // TODO: Get from auth context
        }
      };

      // Disable editing before saving
      if (polygon) {
        polygon.setEditable(false);
      }

      // Wait for save and refresh to complete
      const success = await onSave(update);
      
      if (success) {
        cleanup();
        onClose();
      } else {
        // Re-enable editing if save failed
        if (polygon) {
          polygon.setEditable(true);
        }
        toast.error('Failed to save territory changes. Please try again.');
      }
    } catch (error) {
      console.error('Error saving territory:', error);
      // Re-enable editing if save failed
      if (polygon) {
        polygon.setEditable(true);
      }
      toast.error('Failed to save territory changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cleanup = () => {
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);
    }
    if (drawingPath) {
      drawingPath.setMap(null);
      setDrawingPath(null);
    }
    if (clickListener) {
      google.maps.event.removeListener(clickListener);
      setClickListener(null);
    }
    setIsDrawingMode(false);
  };

  return (
    <div className="absolute bottom-4 right-4 space-y-2 bg-background/95 p-4 rounded-lg shadow-lg">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsDrawingMode(!isDrawingMode)}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isDrawingMode ? 'Finish Drawing' : 'Add Points'}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !points.length}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => {
            cleanup();
            onClose();
          }}
          disabled={isSaving}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TerritoryEditor;
