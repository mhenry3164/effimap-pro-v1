import type { Territory } from '../types/territory';

/**
 * Type guard to check if a point is a valid LatLng coordinate
 */
export function isValidLatLng(point: any): point is { lat: number; lng: number } {
  return (
    point &&
    typeof point === 'object' &&
    typeof point.lat === 'number' &&
    typeof point.lng === 'number' &&
    !isNaN(point.lat) &&
    !isNaN(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

/**
 * Validates and extracts valid points from a territory
 */
export function validateTerritoryPoints(territory: Territory): Array<{ lat: number; lng: number }> {
  const validPoints: Array<{ lat: number; lng: number }> = [];
  
  if (!territory || !territory.paths) {
    return validPoints;
  }

  territory.paths.forEach(path => {
    if (!path || !path.points) return;
    
    path.points.forEach(point => {
      if (point && point.position) {
        const position = {
          lat: Number(point.position.lat),
          lng: Number(point.position.lng)
        };
        
        if (isValidLatLng(position)) {
          validPoints.push(position);
        } else {
          console.warn('Invalid coordinates detected:', point.position);
        }
      }
    });
  });
  
  return validPoints;
}
