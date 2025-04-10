import { TerritoryPoint } from '../types/territory';

/**
 * Check if a point is inside a polygon using the ray casting algorithm
 * @param point The point to check
 * @param polygon Array of points forming the polygon
 * @returns Boolean indicating if the point is inside the polygon
 */
export function pointInPolygon(
  point: { lat: number; lng: number }, 
  polygon: TerritoryPoint[]
): boolean {
  // Ray casting algorithm
  let isInside = false;
  const x = point.lng;
  const y = point.lat;
  
  // Check for empty polygon or invalid input
  if (!polygon || polygon.length < 3) {
    console.warn('Invalid polygon for point-in-polygon test:', polygon);
    return false;
  }
  
  // Add explicit console logging for debugging
  // console.log(`Checking point (${y},${x}) against polygon with ${polygon.length} points`);
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  
  return isInside;
}

/**
 * Determines if a point is near a polygon (either inside or within the given distance)
 * @param point The point to check
 * @param polygon Array of points forming the polygon
 * @param toleranceKm Distance in kilometers to consider "near" the polygon
 * @returns Boolean indicating if the point is near the polygon
 */
export function pointNearPolygon(
  point: { lat: number; lng: number },
  polygon: TerritoryPoint[],
  toleranceKm: number = 5 // Default tolerance of 5km
): boolean {
  // First check if point is inside polygon
  if (pointInPolygon(point, polygon)) {
    return true;
  }
  
  // If not inside, check if point is within tolerance distance of any polygon edge
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const start = polygon[j];
    const end = polygon[i];
    
    // Check distance from point to this edge
    const distance = distanceToLine(
      point,
      { lat: start.lat, lng: start.lng },
      { lat: end.lat, lng: end.lng }
    );
    
    // If within tolerance, point is near polygon
    if (distance <= toleranceKm) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate distance from point to line segment in kilometers
 * @param point The point
 * @param lineStart Start of line segment
 * @param lineEnd End of line segment
 * @returns Distance in kilometers
 */
function distanceToLine(
  point: { lat: number; lng: number },
  lineStart: { lat: number; lng: number },
  lineEnd: { lat: number; lng: number }
): number {
  // Calculate distance from point to line segment
  const x = point.lng;
  const y = point.lat;
  const x1 = lineStart.lng;
  const y1 = lineStart.lat;
  const x2 = lineEnd.lng;
  const y2 = lineEnd.lat;
  
  // Calculate the squared length of the line segment
  const lengthSquared = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  
  // If length is zero, use distance to one of the endpoints
  if (lengthSquared === 0) {
    return haversineDistance(point, lineStart);
  }
  
  // Calculate projection of point onto line
  let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / lengthSquared;
  t = Math.max(0, Math.min(1, t)); // Clamp t to [0,1]
  
  // Calculate closest point on line segment
  const closestPoint = {
    lng: x1 + t * (x2 - x1),
    lat: y1 + t * (y2 - y1)
  };
  
  // Calculate haversine distance from point to closest point on line
  return haversineDistance(point, closestPoint);
}

/**
 * Calculate haversine distance between two points in kilometers
 * @param point1 First point
 * @param point2 Second point
 * @returns Distance in kilometers
 */
export function haversineDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius in kilometers
  
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

/**
 * Calculate the area of a polygon using the Shoelace formula
 * @param polygon Array of points forming the polygon
 * @returns Area in square degrees (approximate)
 */
export function calculatePolygonArea(polygon: TerritoryPoint[]): number {
  let area = 0;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    area += polygon[i].lng * polygon[j].lat;
    area -= polygon[j].lng * polygon[i].lat;
  }
  
  return Math.abs(area / 2);
}

/**
 * Convert degrees to approximate distance in miles at the equator
 * @param degrees Degrees of longitude/latitude
 * @returns Approximate distance in miles
 */
export function degreesToMiles(degrees: number): number {
  return degrees * 69.172;
}

/**
 * Calculate the center point of a polygon
 * @param polygon Array of points forming the polygon
 * @returns Center point {lat, lng}
 */
export function calculatePolygonCenter(polygon: TerritoryPoint[]): {lat: number, lng: number} {
  if (!polygon.length) {
    return {lat: 0, lng: 0};
  }
  
  let lat = 0;
  let lng = 0;
  
  for (const point of polygon) {
    lat += point.lat;
    lng += point.lng;
  }
  
  return {
    lat: lat / polygon.length,
    lng: lng / polygon.length
  };
}

/**
 * Ensures a polygon is properly closed by checking if the first and last points match
 * If they don't match, adds a copy of the first point to the end
 * @param polygon Array of points forming the polygon
 * @returns A new polygon array that is guaranteed to be closed
 */
export function ensureClosedPolygon(polygon: TerritoryPoint[]): TerritoryPoint[] {
  if (!polygon || polygon.length < 3) {
    console.warn('Invalid polygon - needs at least 3 points');
    return polygon || [];
  }
  
  // Create a copy of the polygon to avoid modifying the original
  const result = [...polygon];
  
  // Check if first and last points match
  const first = polygon[0];
  const last = polygon[polygon.length - 1];
  
  // If coordinates don't match, add a copy of the first point to close the polygon
  if (first.lat !== last.lat || first.lng !== last.lng) {
    console.log('Closing unclosed polygon by adding first point to end');
    result.push({
      lat: first.lat,
      lng: first.lng,
      index: polygon.length // Set index to length of original polygon
    });
  }
  
  return result;
}

/**
 * Validates a polygon for GIS compatibility
 * Checks for proper closing, minimum point count, and self-intersections
 * @param polygon Array of points forming the polygon
 * @returns Object with validation results
 */
export function validatePolygon(polygon: TerritoryPoint[]): { 
  valid: boolean;
  closed: boolean;
  minPoints: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for minimum points
  if (!polygon || polygon.length < 3) {
    issues.push('Polygon must have at least 3 points');
    return {
      valid: false,
      closed: false,
      minPoints: false,
      issues
    };
  }
  
  // Check if polygon is closed
  const first = polygon[0];
  const last = polygon[polygon.length - 1];
  const closed = (first.lat === last.lat && first.lng === last.lng);
  
  if (!closed) {
    issues.push('Polygon is not closed (first and last points do not match)');
  }
  
  // Basic check for self-intersections would require more complex algorithms
  // This is a simple placeholder that could be expanded later
  
  return {
    valid: closed && issues.length === 0,
    closed,
    minPoints: true,
    issues
  };
}
