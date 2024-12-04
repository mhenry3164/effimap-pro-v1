import { useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
}

interface GoogleMapsConfig {
  googleMapsApiKey: string;
  libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[];
}

export const googleMapsConfig: GoogleMapsConfig = {
  googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  libraries: ['places', 'drawing', 'geometry', 'visualization'],
};

export function useGoogleMapsApi() {
  const { isLoaded, loadError } = useJsApiLoader(googleMapsConfig);
  
  useEffect(() => {
    if (loadError) {
      console.error('Error loading Google Maps:', loadError);
    }
  }, [loadError]);

  return { isLoaded, loadError };
}
