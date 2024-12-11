import React, { useEffect, useRef, useState } from 'react';
import { TerritoryPoint } from '../../types/territory';

interface TerritoryDrawingLayerProps {
  map: google.maps.Map;
  isDrawing: boolean;
  onComplete: (points: TerritoryPoint[]) => void;
  onCancel: () => void;
}

export function TerritoryDrawingLayer({ map, isDrawing, onComplete, onCancel }: TerritoryDrawingLayerProps) {
  const [points, setPoints] = useState<TerritoryPoint[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const previewLineRef = useRef<google.maps.Polyline | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const mouseMoveListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Initialize drawing mode
  useEffect(() => {
    if (!map || !isDrawing) {
      cleanup();
      return;
    }

    // Create the main polyline that connects all points
    const polyline = new google.maps.Polyline({
      map,
      path: [],
      geodesic: true,
      strokeColor: "#2563EB",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });
    polylineRef.current = polyline;

    // Create the preview line that shows potential connections
    const previewLine = new google.maps.Polyline({
      map,
      path: [],
      geodesic: true,
      strokeColor: "#2563EB",
      strokeOpacity: 0.5,
      strokeWeight: 2,
      icons: [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 4
        },
        offset: '0',
        repeat: '20px'
      }]
    });
    previewLineRef.current = previewLine;

    // Add click listener for adding points
    const clickListener = map.addListener('click', handleMapClick);
    clickListenerRef.current = clickListener;

    // Add mouse move listener for preview line
    const mouseMoveListener = map.addListener('mousemove', handleMouseMove);
    mouseMoveListenerRef.current = mouseMoveListener;

    return cleanup;
  }, [map, isDrawing]);

  const handleMouseMove = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !previewLineRef.current || points.length === 0) return;

    const path = previewLineRef.current.getPath();
    path.clear();

    // Show line from last point to cursor
    const lastPoint = points[points.length - 1];
    path.push(new google.maps.LatLng(lastPoint.lat, lastPoint.lng));
    path.push(e.latLng);

    // If we have enough points, check for potential closure
    if (points.length >= 2) {
      const firstPoint = points[0];
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        e.latLng,
        new google.maps.LatLng(firstPoint.lat, firstPoint.lng)
      );
      
      // If within 20 meters of first point, show closure preview
      if (distance < 20) {
        path.push(new google.maps.LatLng(firstPoint.lat, firstPoint.lng));
      }
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !polylineRef.current) return;

    // Check if clicking near first point to close the polygon
    if (points.length >= 2) {
      const firstPoint = points[0];
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        e.latLng,
        new google.maps.LatLng(firstPoint.lat, firstPoint.lng)
      );
      
      if (distance < 20) { // Within 20 meters of first point
        completeDrawing();
        return;
      }
    }

    const newPoint: TerritoryPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      index: points.length
    };

    // Create marker for the point
    const marker = new google.maps.Marker({
      position: e.latLng,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: points.length === 0 ? 8 : 6,
        fillColor: points.length === 0 ? '#1E40AF' : '#2563EB',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      clickable: points.length === 0
    });

    if (points.length === 0) {
      marker.addListener('click', () => {
        if (points.length >= 3) {
          completeDrawing();
        }
      });
    }

    markersRef.current.push(marker);

    // Update the polyline path
    const path = polylineRef.current.getPath();
    path.push(e.latLng);

    // Update points state
    setPoints(prev => [...prev, newPoint]);
  };

  const completeDrawing = () => {
    if (points.length >= 3) {
      // Close the polygon by adding the first point again
      const firstPoint = points[0];
      const closedPoints = [...points, { ...firstPoint, index: points.length }];

      // Update the polyline to show the closure
      if (polylineRef.current) {
        const path = polylineRef.current.getPath();
        path.push(new google.maps.LatLng(firstPoint.lat, firstPoint.lng));
      }

      cleanup();
      onComplete(closedPoints);
    }
  };

  const cleanup = () => {
    // Remove event listeners
    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
    if (mouseMoveListenerRef.current) {
      google.maps.event.removeListener(mouseMoveListenerRef.current);
      mouseMoveListenerRef.current = null;
    }

    // Remove polylines
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (previewLineRef.current) {
      previewLineRef.current.setMap(null);
      previewLineRef.current = null;
    }

    // Remove all markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    setPoints([]);
  };

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            cleanup();
            onCancel();
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancel Drawing
        </button>
        {points.length >= 3 && (
          <button
            onClick={completeDrawing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Complete Drawing
          </button>
        )}
      </div>
    </div>
  );
}

export default TerritoryDrawingLayer;
