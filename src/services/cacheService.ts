import { GeoJSONFeature } from '../types/boundary';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ViewportKey {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of cached viewports
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly VIEWPORT_PRECISION = 3; // Decimal places for viewport coordinates

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private normalizeViewport(viewport: ViewportKey): ViewportKey {
    return {
      north: Number(viewport.north.toFixed(this.VIEWPORT_PRECISION)),
      south: Number(viewport.south.toFixed(this.VIEWPORT_PRECISION)),
      east: Number(viewport.east.toFixed(this.VIEWPORT_PRECISION)),
      west: Number(viewport.west.toFixed(this.VIEWPORT_PRECISION)),
      zoom: viewport.zoom
    };
  }

  private generateKey(boundaryType: string, viewport: ViewportKey): string {
    const normalizedViewport = this.normalizeViewport(viewport);
    return `${boundaryType}-${JSON.stringify(normalizedViewport)}`;
  }

  private cleanOldEntries() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  private enforceMaxSize() {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const entriesToRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      for (const [key] of entriesToRemove) {
        this.cache.delete(key);
      }
    }
  }

  public set(boundaryType: string, viewport: ViewportKey, data: GeoJSONFeature[]): void {
    this.cleanOldEntries();
    
    const key = this.generateKey(boundaryType, viewport);
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    });

    this.enforceMaxSize();
  }

  public get(boundaryType: string, viewport: ViewportKey): GeoJSONFeature[] | null {
    const key = this.generateKey(boundaryType, viewport);
    const entry = this.cache.get(key);

    if (!entry || entry.expiresAt < Date.now()) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }

    return entry.data;
  }

  public clear(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public isViewportCached(boundaryType: string, viewport: ViewportKey): boolean {
    return this.get(boundaryType, viewport) !== null;
  }
}

export default CacheService.getInstance();
