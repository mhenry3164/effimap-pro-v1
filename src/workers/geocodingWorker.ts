/// <reference lib="webworker" />

import { expose } from 'comlink';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
  error?: string;
}

export interface GeocodingProgress {
  completed: number;
  total: number;
  error?: string;
}

async function geocodeAddress(address: string, apiKey: string): Promise<GeocodeResult> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results[0]) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    } else {
      throw new Error(data.status || 'Geocoding failed');
    }
  } catch (error) {
    return {
      latitude: 0,
      longitude: 0,
      formattedAddress: address,
      placeId: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function batchGeocodeAddresses(
  addresses: string[],
  apiKey: string
): Promise<GeocodeResult[]> {
  const results: GeocodeResult[] = [];
  const batchSize = 5;
  const delay = 200;

  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, Math.min(i + batchSize, addresses.length));
    
    // Process batch sequentially to respect rate limits
    for (let j = 0; j < batch.length; j++) {
      const address = batch[j];
      const globalIndex = i + j;

      try {
        // Add delay between requests
        if (globalIndex > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await geocodeAddress(address, apiKey);
        results[globalIndex] = result;
        
        // Report progress
        self.postMessage({
          type: 'progress',
          data: {
            completed: globalIndex + 1,
            total: addresses.length,
            error: result.error
          }
        });
      } catch (error) {
        const errorResult: GeocodeResult = {
          latitude: 0,
          longitude: 0,
          formattedAddress: address,
          placeId: '',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        results[globalIndex] = errorResult;
        self.postMessage({
          type: 'progress',
          data: {
            completed: globalIndex + 1,
            total: addresses.length,
            error: errorResult.error
          }
        });
      }
    }

    // Add delay between batches
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

const api = {
  geocodeAddress,
  batchGeocodeAddresses,
} as const;

expose(api);

// Export type for the worker
export type GeocodingWorker = typeof api;
