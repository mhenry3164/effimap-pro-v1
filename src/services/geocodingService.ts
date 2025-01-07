import { useGeocodingProgress } from '../stores/geocodingProgressStore';
import { googleGeocodingService } from './googleGeocodingService';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  placeId?: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    const response = await googleGeocodingService.geocodeAddress(address);

    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].geometry.location.lat),
        longitude: parseFloat(response.data[0].geometry.location.lng),
        formattedAddress: response.data[0].formatted_address,
        placeId: response.data[0].place_id,
      };
    }
    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
}

export async function geocodeAddresses(addresses: string[]): Promise<GeocodeResult[]> {
  const progress = useGeocodingProgress.getState();
  const results: GeocodeResult[] = [];

  // Initialize progress
  progress.reset();
  progress.startProcessing(addresses.length, 10);

  try {
    results.length = addresses.length; // Pre-allocate array

    await googleGeocodingService.batchGeocodeAddresses(
      addresses,
      (completed, total) => {
        progress.setCompleted(completed);
      }
    ).then(geocodeResults => {
      geocodeResults.forEach((result, index) => {
        results[index] = result;
      });
    }).catch(error => {
      console.error('Batch geocoding error:', error);
      throw error;
    });

    progress.setStatus('completed');
    return results;
  } catch (error) {
    progress.setStatus('error');
    throw error;
  }
}
