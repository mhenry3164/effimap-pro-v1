# Territory Analysis System Documentation

## Overview

The EffiMap Pro Territory Analysis System allows users to select defined geographic territories and extract relevant data such as ZIP codes and counties that fall within those boundaries. This document outlines the architecture and functionality of this system.

## Core Components

### 1. Territory Definition

Territories are defined as polygons with geographic coordinates stored in Firestore. Each territory has:

- A unique ID
- A name and type (e.g., "Birmingham, AL" with type "branch")
- Boundary coordinates as an array of lat/lng points
- Associated metadata (creation date, status, etc.)

Example territory structure:
```typescript
interface Territory {
  id: string;
  name: string;
  type: string;
  boundary: {
    coordinates: TerritoryPoint[];
    style?: {
      fillColor: string;
      strokeColor: string;
      // ...other styling properties
    }
  };
  // ...other properties
}

interface TerritoryPoint {
  lat: number;
  lng: number;
  index: number;
}
```

### 2. Data Sources

#### Census Bureau API Integration

The system integrates with the Census Bureau API to fetch accurate ZIP code data:

- Uses the ACS 5-year estimates API endpoint
- Retrieves ZIP Code Tabulation Areas (ZCTAs) with population data
- Automatically handles API errors with fallback to mock data
- API key is stored in environment variables as `VITE_CENSUS_API_KEY`

#### State and Coordinate Mapping

For each ZIP code, we determine:
- The state by either parsing the response data or by ZIP code prefix
- Geographic coordinates based on state center + offset algorithm
- For Alabama ZIP codes, custom coordinate distributions around major cities

### 3. Analysis Algorithm

The territory analysis employs a multi-layered approach to find relevant data:

#### Step 1: Boundary Extraction
- Extract all points from territory boundary
- Calculate territory center point
- Determine bounding box (min/max lat/lng)

#### Step 2: Initial Filtering
- Apply state-based filtering (AL + bordering states)
- Apply bounding box filtering with small padding (0.05°)
- This quickly reduces thousands of ZIPs to just relevant candidates

#### Step 3: Point-in-Polygon Detection
1. **Exact Matching**: Uses ray-casting algorithm to determine if a point falls precisely within the polygon
2. **Proximity Matching**: If exact matches are insufficient, checks points near the polygon (within 5km)
3. **Fallback Mechanisms**: For small or unusual territories, uses state + distance-based fallbacks

#### Step 4: Result Limiting
- Caps results at reasonable limits (max 100 ZIPs)
- For fallbacks, sorts by distance to territory center
- Ensures performance and usability of exported data

## Utility Functions

### Point-in-Polygon Detection

The `pointInPolygon` function implements the ray-casting algorithm:
- Casts a ray from the point and counts polygon intersections
- Even number of intersections = outside, odd = inside
- Includes validation for malformed polygons

### Proximity Detection

The `pointNearPolygon` function:
- First checks if point is inside polygon
- Then calculates distances to all polygon edges
- If any distance is less than tolerance (default 5km), considers point "near"

### Distance Calculation

The `haversineDistance` function:
- Calculates great-circle distance between two points
- Uses Haversine formula to account for Earth's curvature
- Returns distance in kilometers

## Configuration Options

The system includes several configurable parameters:

- **Proximity Tolerance**: Default 5km, adjustable based on needs
- **Bounding Box Padding**: Default 0.05° (~3-4 miles)
- **Maximum Results**: Default 100 ZIP codes
- **Fallback Distance**: For closest-point fallback, returns up to 25 closest ZIPs

## Troubleshooting

Common issues that may arise:

1. **Too Many Results**: Adjust `MAX_REASONABLE_ZIPS` constant in `censusApiService.ts`
2. **Too Few Results**: Consider increasing proximity tolerance or bounding box padding
3. **API Key Issues**: Ensure valid Census API key in `.env` file
4. **Incorrect Coordinates**: Review mock data and coordinate mapping logic

## Future Improvements

Potential enhancements to consider:

1. Integration with more precise geocoding services
2. Pre-computed ZIP code boundaries for true polygon-to-polygon intersection
3. Caching mechanism for API responses to improve performance
4. UI controls to adjust filtering parameters on-the-fly
5. More detailed geographic analysis (demographics, land area, etc.)

## Known Issues and Limitations

### ZIP Code Distribution Issues

When visualizing exported territory ZIP codes in mapping tools like Mapshaper, you may notice that the ZIP code points appear scattered across a much wider area than your territory:

1. **Scattered ZIP Code Points**: The system currently uses approximated center points for ZIP codes instead of actual ZIP code boundaries. These center points may be imprecisely positioned, causing them to appear scattered across the state.

2. **Inaccurate Coordinate Mapping**: For some states, ZIP code coordinates are approximated using state-based algorithms rather than precise geocoding, which can result in ZIP points appearing in incorrect locations.

3. **Overlapping ZIP Codes**: Some ZIP codes may have centers that are close together or overlapping, making it difficult to distinguish them on a map.

4. **Proximity-Based Inclusion**: The system includes ZIP codes that are near but not exactly within the territory boundary, which can lead to points appearing outside your intended area.

### Polygon Validation and Visualization Issues

When visualizing exported territories in GIS tools like Mapshaper, several issues may occur:

1. **Unclosed Polygons**: The system does not currently validate that polygons are properly closed (first point = last point). This can cause visualization issues in GIS tools and potentially incorrect point-in-polygon calculations.

2. **Self-Intersecting Polygons**: The system does not check for or prevent self-intersecting polygons, which can lead to unpredictable results in territory analysis.

3. **Polygon Winding Order**: The current implementation doesn't enforce a specific winding order (clockwise vs. counter-clockwise), which some GIS tools expect for proper rendering.

4. **Coordinate Precision**: Due to the use of approximated coordinates for ZIP codes rather than official boundaries, the visual alignment between territories and ZIP codes may not be perfect.

### Recommendations for Improvement

1. **Add Polygon Validation**: Implement pre-processing to ensure:
   - Polygons are properly closed
   - No self-intersections exist
   - Consistent winding order is maintained

2. **Use GeoJSON-Compatible Export Format**: Ensure exports follow strict GeoJSON specification for better compatibility with tools like Mapshaper.

3. **Consider Polygon Simplification**: For very complex territories with many points, implement Douglas-Peucker or similar simplification algorithms to reduce point count while maintaining shape.

4. **Implement True Geographic Boundaries**: Use actual ZIP code boundary polygons instead of center points for more accurate territory analysis.

## Related Files

- `src/services/censusApiService.ts` - Census API integration and ZIP code filtering
- `src/services/geoAnalysisService.ts` - Territory analysis coordination
- `src/utils/geoUtils.ts` - Geographic utility functions
- `src/components/organization/Structure/TerritoryManagementNew.tsx` - UI for territory analysis
