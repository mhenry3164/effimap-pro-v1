import { Loader } from '@googlemaps/js-api-loader';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
  error?: string;
}

// Cache geocoding results to avoid duplicate API calls
const geocodeCache = new Map<string, GeocodeResult>();

class GoogleGeocodingService {
  private geocoder: google.maps.Geocoder | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Maps API key is required');
    }
  }

  private async initialize() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const loader = new Loader({
          apiKey: this.apiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        this.geocoder = new google.maps.Geocoder();
        this.initialized = true;
        resolve();
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
        reject(error);
      }
    });

    return this.initPromise;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    // Check cache first
    const cachedResult = geocodeCache.get(address);
    if (cachedResult) {
      return cachedResult;
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    await this.initialize();
    if (!this.geocoder) {
      throw new Error('Geocoder failed to initialize');
    }

    try {
      const response = await this.geocoder.geocode({
        address: address,
        region: 'us',
      });

      if (!response || !response.results || response.results.length === 0) {
        throw new Error(`No results found for address: ${address}`);
      }

      const location = response.results[0];
      const result: GeocodeResult = {
        latitude: location.geometry.location.lat(),
        longitude: location.geometry.location.lng(),
        formattedAddress: location.formatted_address,
        placeId: location.place_id,
      };

      // Cache the result
      geocodeCache.set(address, result);
      return result;
    } catch (error) {
      console.error(`Geocoding error for address ${address}:`, error);
      
      if (error instanceof Error) {
        // Check for specific Google Maps API errors
        if (error.message.includes('REQUEST_DENIED')) {
          throw new Error('Google Maps API key is invalid or has insufficient permissions');
        }
        throw error;
      }
      
      throw new Error(`Geocoding failed for address ${address}`);
    }
  }

  async batchGeocodeAddresses(
    addresses: string[],
    onProgress?: (completed: number, total: number, error?: string) => void
  ): Promise<GeocodeResult[]> {
    const results: GeocodeResult[] = [];
    const batchSize = 5;
    const delay = 1000; // Increased delay to avoid rate limits

    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, Math.min(i + batchSize, addresses.length));
      
      for (const [j, address] of batch.entries()) {
        const globalIndex = i + j;
        
        try {
          // Add delay between requests
          if (globalIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          const result = await this.geocodeAddress(address);
          results[globalIndex] = result;
          onProgress?.(globalIndex + 1, addresses.length);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // If we get an API key error, stop processing
          if (errorMessage.includes('API key')) {
            throw error;
          }

          results[globalIndex] = {
            latitude: 0,
            longitude: 0,
            formattedAddress: address,
            placeId: '',
            error: errorMessage,
          };
          onProgress?.(globalIndex + 1, addresses.length, errorMessage);
        }
      }

      // Add longer delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, delay * 2));
      }
    }

    return results;
  }
}

// Export singleton instance
export const googleGeocodingService = new GoogleGeocodingService(
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
);
