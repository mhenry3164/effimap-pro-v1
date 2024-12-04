import { BOUNDARY_CONFIGS, BOUNDARY_TYPES, BoundaryType, fetchBoundaryDataForViewport } from './boundaryService';

// Default viewport for USA
const DEFAULT_VIEWPORT = {
  north: 49.3457868,  // Top of continental USA
  south: 24.396308,   // Bottom of continental USA
  east: -66.93457,    // Easternmost point
  west: -124.848974   // Westernmost point
};

// Default zoom levels for initial load
const INITIAL_ZOOM_LEVELS = {
  states: 4,      // Good zoom level for viewing states
  counties: 7,    // Good zoom level for viewing counties
  zip: 10         // Good zoom level for viewing zip codes
};

class BoundaryPreloadService {
  private preloadPromises: Map<string, Promise<void>> = new Map();
  private isPreloading = false;

  async preloadBoundaries() {
    if (this.isPreloading) return;
    this.isPreloading = true;

    try {
      // Start with states as they're the smallest dataset
      await this.preloadBoundaryType(BOUNDARY_TYPES.find(b => b.id === 'states')!, INITIAL_ZOOM_LEVELS.states);
      
      // Then load counties
      await this.preloadBoundaryType(BOUNDARY_TYPES.find(b => b.id === 'counties')!, INITIAL_ZOOM_LEVELS.counties);
      
      // Finally load zipcodes (this might be a larger dataset)
      await this.preloadBoundaryType(BOUNDARY_TYPES.find(b => b.id === 'zip')!, INITIAL_ZOOM_LEVELS.zip);
    } catch (error) {
      console.warn('Error preloading boundaries:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  private async preloadBoundaryType(boundaryType: BoundaryType, zoom: number) {
    const key = `${boundaryType.id}_${zoom}`;
    
    // Don't preload the same boundary type twice
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = (async () => {
      try {
        await fetchBoundaryDataForViewport(boundaryType, DEFAULT_VIEWPORT, zoom);
      } catch (error) {
        console.warn(`Error preloading ${boundaryType.id}:`, error);
      }
    })();

    this.preloadPromises.set(key, promise);
    return promise;
  }
}

export const boundaryPreloadService = new BoundaryPreloadService();
