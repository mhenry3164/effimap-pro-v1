import React, { useState, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { googleMapsConfig } from '../../config/googleMaps';
import LoadingScreen from './LoadingScreen';

interface LocationPickerProps {
  initialLocation?: [number, number];
  onLocationSelect: (location: [number, number]) => void;
}

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco
const defaultZoom = 12;

export default function LocationPicker({ initialLocation, onLocationSelect }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsConfig.googleMapsApiKey,
    libraries: googleMapsConfig.libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(
    initialLocation 
      ? { lat: initialLocation[0], lng: initialLocation[1] }
      : defaultCenter
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    onLocationSelect([lat, lng]);
    setCenter({ lat, lng });
  }, [onLocationSelect]);

  useEffect(() => {
    if (!map) return;

    const clickListener = map.addListener('click', handleMapClick);

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, handleMapClick]);

  if (loadError) {
    return <div className="text-red-500">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-64 relative">
      <GoogleMap
        mapContainerClassName="w-full h-full rounded-lg"
        center={center}
        zoom={defaultZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <Marker
          position={center}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#4F46E5',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
        />
      </GoogleMap>
    </div>
  );
}
