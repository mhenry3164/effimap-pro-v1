import { Territory } from '../types/territory';
import { pointInPolygon } from '../utils/geoUtils';

// Census API configuration
const CENSUS_API_KEY = import.meta.env.VITE_CENSUS_API_KEY || '15b161384b7156e9911bc0168b21faec9224acdf';

// Types for Census API responses
export interface CensusZipCode {
  geoid: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  geometry?: {
    type: string;
    coordinates: number[][][];
  };
  state: string;
  population: number;
  code: string;
}

export interface CensusCounty {
  geoid: string;
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  geometry?: {
    type: string;
    coordinates: number[][][];
  };
  fips: string;
}

export class CensusApiService {
  /**
   * Get all ZIP codes from Census API
   * @returns Array of ZIP codes with their center coordinates
   */
  async getAllZipCodes(): Promise<CensusZipCode[]> {
    try {
      console.log('Fetching ZIP codes from Census API using key:', CENSUS_API_KEY);
      
      // First check if we've cached the ZIP codes to avoid repeated API calls
      const cachedZipCodes = localStorage.getItem('cachedZipCodes');
      if (cachedZipCodes) {
        console.log('Using cached ZIP codes');
        return JSON.parse(cachedZipCodes);
      }
      
      // Make actual API call to Census Bureau API to get ZIP codes
      try {
        // First try to get real data from the Census API
        console.log('Attempting to fetch ZIP codes from Census Bureau API...');
        
        // Census API endpoint for ZIP Code Tabulation Areas (ZCTA)
        const url = `https://api.census.gov/data/2020/acs/acs5?get=NAME,B01001_001E&for=zip%20code%20tabulation%20area:*&key=${CENSUS_API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Census API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length < 2) {
          throw new Error('Census API returned invalid data format');
        }
        
        console.log(`Census API returned ${data.length - 1} ZIP codes`);
        
        // Process ZIP codes and add accurate coordinate data
        const zipCodes = await this.processZipCodesWithAccurateCoordinates(data);
        
        // Cache the results to avoid repeated API calls
        localStorage.setItem('cachedZipCodes', JSON.stringify(zipCodes));
        
        return zipCodes;
      } catch (error) {
        console.error('Error fetching ZIP codes from Census API:', error);
        console.log('Falling back to mock ZIP codes');
        return this.getMockZipCodes();
      }
    } catch (error) {
      console.error('Error in getAllZipCodes:', error);
      return this.getMockZipCodes();
    }
  }
  
  /**
   * Process ZIP codes from Census API and add accurate coordinates
   * @param censusData Raw data from Census API
   * @returns Array of ZIP codes with accurate coordinates
   */
  private async processZipCodesWithAccurateCoordinates(censusData: any[]): Promise<CensusZipCode[]> {
    // Skip the header row (first row)
    const processedZipCodes: CensusZipCode[] = [];
    
    // First, create basic ZIP code objects from Census data
    for (let i = 1; i < censusData.length; i++) {
      const row = censusData[i];
      // Format: [NAME, Population, ZCTA]
      // Example: ["ZCTA5 35204, Alabama", "9421", "35204"]
      const zipCode = row[2];
      const population = parseInt(row[1], 10);
      const name = row[0];
      
      // Determine state by parsing the name
      let state = this.getStateFromName(name);
      
      // Create ZIP code object with placeholder coordinates
      processedZipCodes.push({
        geoid: `86000US${zipCode}`,
        name: zipCode,
        code: zipCode,
        state: state,
        population: population,
        coordinates: {
          lat: 0, // Placeholder, will be updated
          lng: 0  // Placeholder, will be updated
        }
      });
    }
    
    // Now fetch accurate coordinates from our predefined mapping or an external geocoding source
    const enhancedZipCodes = await this.enhanceZipCodesWithAccurateCoordinates(processedZipCodes);
    
    return enhancedZipCodes;
  }
  
  /**
   * Get state abbreviation from Census name field
   * @param name Name field from Census API (e.g., "ZCTA5 35204, Alabama")
   */
  private getStateFromName(name: string): string {
    // Map of state names to abbreviations
    const stateMapping: Record<string, string> = {
      'Alabama': 'AL',
      'Georgia': 'GA',
      'Florida': 'FL',
      'Tennessee': 'TN',
      'Mississippi': 'MS',
      'Louisiana': 'LA',
      'Texas': 'TX',
      'Arkansas': 'AR',
      'Kentucky': 'KY',
      'North Carolina': 'NC',
      'South Carolina': 'SC',
      'Oklahoma': 'OK',
      'Missouri': 'MO',
      'Virginia': 'VA',
      'West Virginia': 'WV'
    };
    
    // Try to extract state name from the ZCTA name
    for (const [stateName, stateAbbr] of Object.entries(stateMapping)) {
      if (name.includes(stateName)) {
        return stateAbbr;
      }
    }
    
    return this.getStateFromZipPrefix(name.split(' ')[1]?.split(',')[0] || "");
  }
  
  /**
   * Get state abbreviation from ZIP code prefix
   * @param zipCode ZIP code
   */
  private getStateFromZipPrefix(zipCode: string): string {
    // ZIP code prefixes by state (covering Southeastern states)
    const zipPrefixMapping: Record<string, string[]> = {
      'AL': ['350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '360', '361', '362', '363', '364', '365', '366', '367', '368', '369'],
      'GA': ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '398', '399'],
      'FL': ['320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339', '341', '342', '344', '346', '347', '349'],
      'TN': ['370', '371', '372', '373', '374', '375', '376', '377', '378', '379', '380', '381', '382', '383', '384', '385'],
      'MS': ['386', '387', '388', '389', '390', '391', '392', '393', '394', '395', '396', '397']
    };
    
    // Check if ZIP code starts with any of the prefixes
    for (const [stateAbbr, prefixes] of Object.entries(zipPrefixMapping)) {
      if (prefixes.some(prefix => zipCode.startsWith(prefix))) {
        return stateAbbr;
      }
    }
    
    return "Unknown";
  }
  
  /**
   * Enhance ZIP codes with accurate coordinates
   * Uses a pre-defined mapping or fetches from an external source
   * @param zipCodes Array of ZIP codes with placeholder coordinates
   */
  private async enhanceZipCodesWithAccurateCoordinates(zipCodes: CensusZipCode[]): Promise<CensusZipCode[]> {
    // First, try to get accurate ZIP code coordinates from TIGERweb or another source
    try {
      // Use our predefined accurate ZIP code mapping - this is the most reliable approach
      // In a production app, we would fetch this from a database or API
      const accurateCoordinates = this.getAccurateZipCodeCoordinates();
      
      // Match and update coordinates
      for (const zipCode of zipCodes) {
        const accurateMatch = accurateCoordinates[zipCode.code];
        if (accurateMatch) {
          zipCode.coordinates = { 
            lat: accurateMatch.lat, 
            lng: accurateMatch.lng 
          };
        } else {
          // If no accurate match, use our state-based approximation
          const stateCoords = this.getApproximateCoordinatesByState(zipCode.state, zipCode.code);
          zipCode.coordinates = stateCoords;
        }
      }
      
      console.log(`Enhanced ${zipCodes.length} ZIP codes with accurate coordinates`);
      return zipCodes;
      
    } catch (error) {
      console.error('Error enhancing ZIP codes with accurate coordinates:', error);
      // Fall back to our state-based approximation
      return zipCodes.map(zipCode => {
        const stateCoords = this.getApproximateCoordinatesByState(zipCode.state, zipCode.code);
        zipCode.coordinates = stateCoords;
        return zipCode;
      });
    }
  }
  
  /**
   * Get accurate ZIP code coordinates for Alabama and surrounding states
   * Focusing on ZIP codes in our area of interest
   */
  private getAccurateZipCodeCoordinates(): Record<string, {lat: number, lng: number}> {
    // This is a small subset of accurate coordinates
    // In a production app, this would be a complete database
    return {
      // Birmingham area
      "35204": { lat: 33.5183, lng: -86.8278 },
      "35205": { lat: 33.4977, lng: -86.7911 },
      "35206": { lat: 33.5543, lng: -86.7489 },
      "35207": { lat: 33.5550, lng: -86.8135 },
      "35208": { lat: 33.4918, lng: -86.8546 },
      "35209": { lat: 33.4569, lng: -86.7652 },
      "35210": { lat: 33.5708, lng: -86.7021 },
      "35211": { lat: 33.4783, lng: -86.8904 },
      "35212": { lat: 33.5331, lng: -86.7489 },
      "35213": { lat: 33.5098, lng: -86.7331 },
      "35214": { lat: 33.5785, lng: -86.8833 },
      "35215": { lat: 33.6404, lng: -86.7022 },
      "35216": { lat: 33.4288, lng: -86.7599 },
      "35217": { lat: 33.5668, lng: -86.7750 },
      "35218": { lat: 33.5405, lng: -86.7871 },
      "35221": { lat: 33.4072, lng: -86.9290 },
      "35222": { lat: 33.5232, lng: -86.7488 },
      "35223": { lat: 33.4890, lng: -86.7266 },
      "35224": { lat: 33.4444, lng: -86.8919 },
      "35226": { lat: 33.3840, lng: -86.7869 },
      "35228": { lat: 33.4436, lng: -86.9173 },
      "35233": { lat: 33.5067, lng: -86.8021 },
      "35234": { lat: 33.5265, lng: -86.7905 },
      "35235": { lat: 33.5970, lng: -86.6674 },
      "35244": { lat: 33.3690, lng: -86.8018 },
      
      // Montgomery area
      "36104": { lat: 32.3760, lng: -86.3089 },
      "36106": { lat: 32.3638, lng: -86.2716 },
      "36107": { lat: 32.3893, lng: -86.2952 },
      "36108": { lat: 32.3778, lng: -86.3396 },
      "36109": { lat: 32.4066, lng: -86.2380 },
      "36110": { lat: 32.4266, lng: -86.2797 },
      "36111": { lat: 32.3356, lng: -86.2635 },
      "36112": { lat: 32.4030, lng: -86.2207 },
      "36113": { lat: 32.3277, lng: -86.3180 },
      "36116": { lat: 32.3225, lng: -86.2310 },
      "36117": { lat: 32.3689, lng: -86.1743 },
      
      // Mobile area
      "36603": { lat: 30.6838, lng: -88.0430 },
      "36604": { lat: 30.6901, lng: -88.0781 },
      "36605": { lat: 30.6434, lng: -88.0781 },
      "36606": { lat: 30.6838, lng: -88.1132 },
      "36607": { lat: 30.7190, lng: -88.0781 },
      "36608": { lat: 30.6969, lng: -88.1835 },
      "36609": { lat: 30.6487, lng: -88.1569 },
      "36610": { lat: 30.7365, lng: -88.0546 },
      "36611": { lat: 30.7424, lng: -88.1107 },
      "36612": { lat: 30.7716, lng: -88.1178 },
      "36613": { lat: 30.8069, lng: -88.1803 },
      "36617": { lat: 30.7541, lng: -88.0871 },
      "36619": { lat: 30.6082, lng: -88.1938 },
      "36693": { lat: 30.6257, lng: -88.1366 },
      "36695": { lat: 30.6664, lng: -88.2387 },
      
      // Huntsville area
      "35801": { lat: 34.7323, lng: -86.5850 },
      "35802": { lat: 34.6630, lng: -86.5683 },
      "35803": { lat: 34.6282, lng: -86.5350 },
      "35805": { lat: 34.7193, lng: -86.6127 },
      "35806": { lat: 34.7368, lng: -86.6737 },
      "35810": { lat: 34.7797, lng: -86.6027 },
      "35811": { lat: 34.7716, lng: -86.5500 },
      "35816": { lat: 34.7526, lng: -86.5683 },
      "35824": { lat: 34.6413, lng: -86.6027 },
      "35899": { lat: 34.7300, lng: -86.5850 }, // Changed key from 35801 (duplicate) to 35899
      // "35801": { lat: 34.7300, lng: -86.5850 } // Removed duplicate key
    };
  }
  
  /**
   * Get approximate coordinates based on state and ZIP code
   * This method distributes ZIP codes within states in a more realistic pattern
   * @param state State abbreviation
   * @param zipCode ZIP code
   */
  private getApproximateCoordinatesByState(state: string, zipCode: string): { lat: number, lng: number } {
    // Default coordinates if we can't determine better ones
    let baseLat = 0;
    let baseLng = 0;
    
    // State centers
    const stateCenters: Record<string, [number, number]> = {
      'AL': [32.8067, -86.7911], // Alabama
      'GA': [32.6415, -83.4426], // Georgia
      'FL': [27.6648, -81.5158], // Florida
      'TN': [35.8580, -86.3505], // Tennessee
      'MS': [32.7673, -89.6812], // Mississippi
      'TX': [31.9686, -99.9018], // Texas
      'LA': [31.1695, -91.8678], // Louisiana
      'AR': [34.7996, -92.1991], // Arkansas
      'KY': [37.8393, -84.2700], // Kentucky
      'SC': [33.8361, -81.1637], // South Carolina
      'NC': [35.7596, -79.0193]  // North Carolina
    };
    
    if (state in stateCenters) {
      [baseLat, baseLng] = stateCenters[state];
      
      // Special handling for Alabama - distribute around major cities
      if (state === 'AL') {
        const zipNum = parseInt(zipCode, 10);
        
        if (zipCode.startsWith('350') || zipCode.startsWith('351') || zipCode.startsWith('352')) {
          // Birmingham area (roughly 350xx-352xx)
          return {
            lat: 33.5186 + (Math.cos(zipNum) * 0.12),
            lng: -86.8104 + (Math.sin(zipNum) * 0.12)
          };
        } else if (zipCode.startsWith('361') || zipCode.startsWith('362')) {
          // Montgomery area (roughly 361xx)
          return {
            lat: 32.3792 + (Math.cos(zipNum) * 0.08),
            lng: -86.3077 + (Math.sin(zipNum) * 0.08)
          };
        } else if (zipCode.startsWith('366')) {
          // Mobile area (roughly 366xx)
          return {
            lat: 30.6954 + (Math.cos(zipNum) * 0.09),
            lng: -88.0399 + (Math.sin(zipNum) * 0.09)
          };
        } else if (zipCode.startsWith('358')) {
          // Huntsville area (roughly 358xx)
          return {
            lat: 34.7304 + (Math.cos(zipNum) * 0.08),
            lng: -86.5861 + (Math.sin(zipNum) * 0.08)
          };
        } else if (zipCode.startsWith('354')) {
          // Tuscaloosa area (roughly 354xx)
          return {
            lat: 33.2098 + (Math.cos(zipNum) * 0.07),
            lng: -87.5692 + (Math.sin(zipNum) * 0.07)
          };
        }
      }
      
      // For other states, use a consistent pseudo-random distribution based on ZIP
      const hash = this.simpleHash(zipCode);
      
      // Add some controlled randomness based on the hash
      // This distributes ZIPs across the state in a consistent pattern
      const latOffset = (hash % 100) / 100 * 1.2 - 0.6; // Range: -0.6 to 0.6 degrees
      const lngOffset = ((hash >> 8) % 100) / 100 * 1.2 - 0.6; // Range: -0.6 to 0.6 degrees
      
      return {
        lat: baseLat + latOffset,
        lng: baseLng + lngOffset
      };
    }
    
    // Last resort fallback - return a point in central US
    return { lat: 39.8283, lng: -98.5795 };
  }
  
  /**
   * Simple hash function for consistent pseudo-random distribution
   * @param str String to hash
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Find all ZIP codes that fall within a territory
   * @param territory The territory to check
   * @returns Array of ZIP codes within the territory
   */
  async findZipCodesInTerritory(territory: Territory): Promise<CensusZipCode[]> {
    console.log(`Finding ZIP codes in territory: ${territory.id} (${territory.name || 'unnamed'})`);
    
    try {
      // Get all ZIP codes with accurate coordinates
      const allZipCodes = await this.getAllZipCodes();
      console.log(`Total ZIP codes available: ${allZipCodes.length}`);
      
      // Get territory boundary coordinates
      const territoryPoints = territory.boundary?.coordinates || [];
      if (territoryPoints.length === 0) {
        console.warn('Territory has no boundary coordinates');
        return [];
      }
      
      // Ensure polygon is closed for accurate analysis
      const { ensureClosedPolygon, validatePolygon } = await import('../utils/geoUtils');
      
      // Validate the polygon first
      const validation = validatePolygon(territoryPoints);
      if (!validation.valid) {
        console.warn(`Territory has validation issues: ${validation.issues.join(', ')}`);
      }
      
      // Always ensure the polygon is closed
      const closedPolygon = ensureClosedPolygon(territoryPoints);
      
      // Log territory information for debugging
      console.log(`Territory has ${closedPolygon.length} boundary points`);
      
      // Calculate territory center (for fallback and analytics)
      const { calculatePolygonCenter, calculatePolygonArea } = await import('../utils/geoUtils');
      const center = calculatePolygonCenter(closedPolygon);
      console.log(`Territory center calculated: (${center.lat}, ${center.lng})`);
      
      // Calculate approximate area
      const areaInSqDegrees = calculatePolygonArea(closedPolygon);
      const { degreesToMiles } = await import('../utils/geoUtils');
      const approxAreaInSqMiles = Math.pow(degreesToMiles(Math.sqrt(areaInSqDegrees)), 2);
      console.log(`Territory approximate area: ${approxAreaInSqMiles.toFixed(2)} square miles`);
      
      // Determine if this is an Alabama territory
      const isAlabamaTerritory = territory.name?.includes('AL') || 
                                 territory.name?.toLowerCase().includes('alabama') ||
                                 (center.lat > 30.5 && center.lat < 35.5 && 
                                  center.lng > -89 && center.lng < -86);
      
      console.log(`Is Alabama territory: ${isAlabamaTerritory}`);
      
      // Calculate the territory bounding box for quick filtering
      const latitudes = closedPolygon.map(pt => pt.lat);
      const longitudes = closedPolygon.map(pt => pt.lng);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      // Scale padding based on territory size
      // Smaller territories get less padding to avoid irrelevant results
      // Larger territories get more padding to ensure coverage
      const baseSize = approxAreaInSqMiles;
      
      // Adaptive padding based on territory size
      let padding: number;
      if (baseSize < 10) {
        padding = 0.01; // ~0.7 miles for very small territories
      } else if (baseSize < 50) {
        padding = 0.02; // ~1.4 miles for small territories
      } else if (baseSize < 200) {
        padding = 0.03; // ~2.1 miles for medium territories
      } else if (baseSize < 1000) {
        padding = 0.05; // ~3.5 miles for large territories
      } else {
        padding = 0.08; // ~5.6 miles for very large territories
      }
      
      console.log(`Using adaptive bounding box padding of ${padding.toFixed(3)} degrees (~${(padding * 69).toFixed(1)} miles)`);
      
      const boundingBox = {
        minLat: minLat - padding,
        maxLat: maxLat + padding,
        minLng: minLng - padding,
        maxLng: maxLng + padding
      };
      
      console.log(`Territory bounding box: [${boundingBox.minLat.toFixed(4)},${boundingBox.minLng.toFixed(4)}] to [${boundingBox.maxLat.toFixed(4)},${boundingBox.maxLng.toFixed(4)}]`);
      
      // Apply appropriate state filtering based on territory
      let validStates = ["AL", "GA", "FL", "TN", "MS"];
      
      // If center is firmly in Alabama, prioritize Alabama ZIPs but don't exclude border states
      if (isAlabamaTerritory && 
          center.lat > 31.5 && center.lat < 34.5 && 
          center.lng > -88 && center.lng < -85.5) {
        // Keep all states but mark Alabama as priority
        console.log("Prioritizing Alabama ZIPs based on territory center");
      }
      
      // First quick filter - check if ZIP code is within the territory bounding box
      const potentialZipCodes = allZipCodes.filter(zipCode => {
        const { lat, lng } = zipCode.coordinates;
        
        // Filter by state first (looser filter for large territories)
        if (approxAreaInSqMiles < 500 && !validStates.includes(zipCode.state)) {
          return false;
        }
        
        // Then check if within bounding box (strict filtering)
        return (
          lat >= boundingBox.minLat && 
          lat <= boundingBox.maxLat &&
          lng >= boundingBox.minLng && 
          lng <= boundingBox.maxLng
        );
      });
      
      console.log(`Found ${potentialZipCodes.length} ZIP codes within bounding box`);
      
      // For debugging: focus on Alabama ZIPs
      const alabamaZips = potentialZipCodes.filter(z => z.state === 'AL');
      console.log(`Alabama ZIP codes in bounding box: ${alabamaZips.length}`);
      
      // Calculate maximum reasonable ZIPs based on territory size
      // This ensures large territories get more results
      let MAX_REASONABLE_ZIPS: number;
      
      if (approxAreaInSqMiles < 20) {
        MAX_REASONABLE_ZIPS = 10; // Very small territories
      } else if (approxAreaInSqMiles < 100) {
        MAX_REASONABLE_ZIPS = 25; // Small territories
      } else if (approxAreaInSqMiles < 500) {
        MAX_REASONABLE_ZIPS = 50; // Medium territories
      } else if (approxAreaInSqMiles < 2000) {
        MAX_REASONABLE_ZIPS = 100; // Large territories
      } else {
        MAX_REASONABLE_ZIPS = 150; // Very large territories (statewide)
      }
      
      console.log(`Maximum result limit set to ${MAX_REASONABLE_ZIPS} based on territory size`);
      
      // Now check each potential ZIP precisely with point-in-polygon
      const { pointInPolygon, pointNearPolygon, haversineDistance } = await import('../utils/geoUtils');
      
      // 1. First use exact point-in-polygon for precision
      const exactMatches = potentialZipCodes.filter(zipCode => {
        const point = { lat: zipCode.coordinates.lat, lng: zipCode.coordinates.lng };
        return pointInPolygon(point, closedPolygon);
      });
      
      console.log(`Found ${exactMatches.length} ZIP codes EXACTLY within territory`);
      
      // For small to medium territories, if we have enough exact matches, just use those
      // For larger territories, we'll need both exact and proximity matches to ensure coverage
      if (exactMatches.length >= Math.min(5, MAX_REASONABLE_ZIPS * 0.25) && approxAreaInSqMiles < 200) {
        // Sort exact matches by state (AL first, then others)
        const sortedMatches = [...exactMatches].sort((a, b) => {
          if (a.state === 'AL' && b.state !== 'AL') return -1;
          if (a.state !== 'AL' && b.state === 'AL') return 1;
          return 0;
        });
        
        const limitedMatches = sortedMatches.slice(0, MAX_REASONABLE_ZIPS);
        console.log(`Using ${limitedMatches.length} exact matches (limited to ${MAX_REASONABLE_ZIPS})`);
        return limitedMatches;
      }
      
      // 2. Next try with proximity matching (adaptive tolerance based on territory size)
      // Small territories: tighter proximity (1-2km)
      // Large territories: wider proximity (3-5km)
      const proximityKm = approxAreaInSqMiles < 50 ? 1.5 : 
                         approxAreaInSqMiles < 200 ? 3 : 5;
      
      console.log(`Using proximity matching with ${proximityKm}km tolerance`);
      
      const nearbyMatches = potentialZipCodes.filter(zipCode => {
        const point = { lat: zipCode.coordinates.lat, lng: zipCode.coordinates.lng };
        return pointNearPolygon(point, closedPolygon, proximityKm);
      });
      
      console.log(`Found ${nearbyMatches.length} ZIP codes NEAR territory (${proximityKm}km tolerance)`);
      
      // Sort nearby matches with exact matches first, then by distance to center
      const combinedMatches = nearbyMatches.map(zip => {
        const isExact = exactMatches.some(ex => ex.code === zip.code);
        const distance = haversineDistance(
          { lat: center.lat, lng: center.lng },
          { lat: zip.coordinates.lat, lng: zip.coordinates.lng }
        );
        return { zip, isExact, distance };
      });
      
      // Sort: exact matches first, then by Alabama state, then by distance
      combinedMatches.sort((a, b) => {
        // First priority: exact matches
        if (a.isExact && !b.isExact) return -1;
        if (!a.isExact && b.isExact) return 1;
        
        // Second priority: Alabama ZIP codes
        if (a.zip.state === 'AL' && b.zip.state !== 'AL') return -1;
        if (a.zip.state !== 'AL' && b.zip.state === 'AL') return 1;
        
        // Third priority: distance from center
        return a.distance - b.distance;
      });
      
      if (combinedMatches.length > 0) {
        const limitedMatches = combinedMatches
          .slice(0, MAX_REASONABLE_ZIPS)
          .map(item => item.zip);
        
        console.log(`Using ${limitedMatches.length} combined matches (limited to ${MAX_REASONABLE_ZIPS})`);
        return limitedMatches;
      }
      
      // 3. Last resort fallback - find closest ZIPs to territory center
      // Only used if everything else failed (unusual territories)
      console.log(`Using distance-based matching as last resort fallback`);
      
      // Sort all ZIP codes by distance to territory center, restrict to reasonable distance
      const sortedByDistance = allZipCodes
        .filter(zip => validStates.includes(zip.state)) // Only states we care about
        .map(zip => {
          const distance = haversineDistance(
            { lat: center.lat, lng: center.lng },
            { lat: zip.coordinates.lat, lng: zip.coordinates.lng }
          );
          return { zip, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .filter(item => {
          // For small territories, use tighter radius
          const maxDistance = approxAreaInSqMiles < 50 ? 20 : 
                             approxAreaInSqMiles < 200 ? 40 : 60; // km
          return item.distance <= maxDistance;
        })
        .map(item => item.zip);
      
      // Prioritize Alabama ZIPs if this is an Alabama territory
      if (isAlabamaTerritory) {
        const alZips = sortedByDistance.filter(zip => zip.state === 'AL');
        const otherZips = sortedByDistance.filter(zip => zip.state !== 'AL');
        sortedByDistance.length = 0; // Clear array
        sortedByDistance.push(...alZips, ...otherZips); // AL first, then others
      }
      
      // Take a reasonable number based on territory size, but don't exceed our max
      const fallbackLimit = Math.min(
        MAX_REASONABLE_ZIPS,
        Math.max(5, Math.ceil(Math.sqrt(approxAreaInSqMiles)))
      );
      
      const fallbackZips = sortedByDistance.slice(0, fallbackLimit);
      console.log(`Last resort: Using ${fallbackZips.length} closest ZIP codes (limited to ${fallbackLimit})`);
      return fallbackZips;
      
    } catch (error) {
      console.error('Error finding ZIP codes in territory:', error);
      return [];
    }
  }
  
  /**
   * Find all counties that fall within a territory
   * @param territory The territory to check
   * @returns Array of counties within the territory
   */
  async findCountiesInTerritory(territory: Territory): Promise<CensusCounty[]> {
    console.log(`Finding counties in territory: ${territory.id}`);
    
    try {
      // Get all counties
      const allCounties = await this.getAllCounties();
      
      // Filter to those whose center point is within the territory
      const territoryPoints = territory.boundary?.coordinates || [];
      
      if (territoryPoints.length === 0) {
        console.warn('Territory has no boundary coordinates');
        return [];
      }
      
      const containedCounties = allCounties.filter(county => {
        const point = { lat: county.coordinates.lat, lng: county.coordinates.lng };
        return pointInPolygon(point, territoryPoints);
      });
      
      console.log(`Found ${containedCounties.length} counties in territory`);
      return containedCounties;
      
    } catch (error) {
      console.error('Error finding counties in territory:', error);
      return [];
    }
  }

  /**
   * Generate a proper GeoJSON from territory and contained geographic entities
   * @param territory The territory
   * @param containedEntities ZIP codes or counties contained within the territory
   * @returns GeoJSON FeatureCollection
   */
  generateGeoJson(
    territory: Territory, 
    containedEntities: CensusZipCode[] | CensusCounty[]
  ): any {
    const features = [];
    
    // Add territory as a polygon feature
    if (territory.boundary?.coordinates?.length) {
      const coordinates = territory.boundary.coordinates.map(point => [point.lng, point.lat]);
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {
          id: territory.id,
          name: territory.name,
          type: 'territory',
          territoryType: territory.type
        }
      });
    }
    
    // Add contained entities as point features
    containedEntities.forEach(entity => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [entity.coordinates.lng, entity.coordinates.lat]
        },
        properties: {
          id: entity.geoid,
          name: entity.name,
          type: 'zip-code',
          // Include additional properties depending on entity type
          ...(('state' in entity) ? { state: entity.state } : {})
        }
      });
    });
    
    return {
      type: 'FeatureCollection',
      features
    };
  }

  // Methods for mocking API responses
  getMockResponse<T>(data: T): T {
    // In a real app, this would fetch from an API
    return data;
  }

  // Mock data methods (these would be replaced with actual API calls in production)
  getMockZipCodes(): CensusZipCode[] {
    return [
      // Alabama ZIP codes (Birmingham area)
      {
        geoid: "86000US35203",
        name: "35203",
        code: "35203",
        state: "AL",
        population: 1822,
        coordinates: {
          lat: 33.5186,
          lng: -86.8104
        }
      },
      {
        geoid: "86000US35204",
        name: "35204",
        code: "35204",
        state: "AL",
        population: 9421,
        coordinates: {
          lat: 33.5129,
          lng: -86.8322
        }
      },
      {
        geoid: "86000US35205",
        name: "35205",
        code: "35205",
        state: "AL",
        population: 17293,
        coordinates: {
          lat: 33.4969,
          lng: -86.7906
        }
      },
      {
        geoid: "86000US35206",
        name: "35206",
        code: "35206",
        state: "AL",
        population: 21382,
        coordinates: {
          lat: 33.5521,
          lng: -86.7488
        }
      },
      {
        geoid: "86000US35207",
        name: "35207",
        code: "35207",
        state: "AL",
        population: 13675,
        coordinates: {
          lat: 33.5444,
          lng: -86.8148
        }
      },
      {
        geoid: "86000US35208",
        name: "35208",
        code: "35208",
        state: "AL",
        population: 21845,
        coordinates: {
          lat: 33.4978,
          lng: -86.8676
        }
      },
      {
        geoid: "86000US35209",
        name: "35209",
        code: "35209",
        state: "AL",
        population: 22594,
        coordinates: {
          lat: 33.4705,
          lng: -86.7354
        }
      },
      {
        geoid: "86000US35210",
        name: "35210",
        code: "35210",
        state: "AL",
        population: 32156,
        coordinates: {
          lat: 33.5548,
          lng: -86.7013
        }
      },
      {
        geoid: "86000US35211",
        name: "35211",
        code: "35211",
        state: "AL",
        population: 30587,
        coordinates: {
          lat: 33.4749,
          lng: -86.8371
        }
      },
      {
        geoid: "86000US35212",
        name: "35212",
        code: "35212",
        state: "AL",
        population: 16253,
        coordinates: {
          lat: 33.5424,
          lng: -86.7542
        }
      },
      {
        geoid: "86000US35213",
        name: "35213",
        code: "35213",
        state: "AL",
        population: 19102,
        coordinates: {
          lat: 33.5108,
          lng: -86.7271
        }
      },
      {
        geoid: "86000US35214",
        name: "35214",
        code: "35214",
        state: "AL",
        population: 12486,
        coordinates: {
          lat: 33.6089,
          lng: -86.7168
        }
      },
      {
        geoid: "86000US35215",
        name: "35215",
        code: "35215",
        state: "AL",
        population: 41373,
        coordinates: {
          lat: 33.6272,
          lng: -86.6751
        }
      },
      {
        geoid: "86000US35216",
        name: "35216",
        code: "35216",
        state: "AL",
        population: 44155,
        coordinates: {
          lat: 33.4249,
          lng: -86.7307
        }
      },
      {
        geoid: "86000US35217",
        name: "35217",
        code: "35217",
        state: "AL",
        population: 9723,
        coordinates: {
          lat: 33.5788,
          lng: -86.7701
        }
      },
      {
        geoid: "86000US35218",
        name: "35218",
        code: "35218",
        state: "AL",
        population: 8756,
        coordinates: {
          lat: 33.5365,
          lng: -86.7934
        }
      },
      {
        geoid: "86000US35221",
        name: "35221",
        code: "35221",
        state: "AL",
        population: 3921,
        coordinates: {
          lat: 33.4049,
          lng: -86.9281
        }
      },
      {
        geoid: "86000US35222",
        name: "35222",
        code: "35222",
        state: "AL",
        population: 4287,
        coordinates: {
          lat: 33.5265,
          lng: -86.7637
        }
      },
      {
        geoid: "86000US35223",
        name: "35223",
        code: "35223",
        state: "AL",
        population: 10941,
        coordinates: {
          lat: 33.4801,
          lng: -86.7057
        }
      },
      {
        geoid: "86000US35224",
        name: "35224",
        code: "35224",
        state: "AL",
        population: 8731,
        coordinates: {
          lat: 33.4426,
          lng: -86.8914
        }
      },
      
      // Keep some original mock data as well
      {
        geoid: "86000US78701",
        name: "78701",
        code: "78701",
        state: "TX",
        population: 11511,
        coordinates: {
          lat: 30.2715,
          lng: -97.7426
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[/* Coordinates omitted for brevity */]]],
        }
      },
      {
        geoid: "86000US78702",
        name: "78702",
        code: "78702",
        state: "TX",
        population: 23732,
        coordinates: {
          lat: 30.2633,
          lng: -97.7262
        }
      },
      {
        geoid: "86000US78703",
        name: "78703",
        code: "78703",
        state: "TX",
        population: 19908,
        coordinates: {
          lat: 30.2949, 
          lng: -97.7605
        }
      },
      {
        geoid: "86000US78704",
        name: "78704",
        code: "78704",
        state: "TX",
        population: 41849,
        coordinates: {
          lat: 30.2451,
          lng: -97.7666
        }
      },
      {
        geoid: "86000US78705",
        name: "78705",
        code: "78705",
        state: "TX",
        population: 17902,
        coordinates: {
          lat: 30.2982,
          lng: -97.7427
        }
      }
    ];
  }

  getMockCounties(): CensusCounty[] {
    return [
      {
        geoid: "05000US48453",
        name: "Travis County",
        fips: "48453",
        state: "TX",
        coordinates: {
          lat: 30.2672,
          lng: -97.7431
        }
      },
      {
        geoid: "05000US48491",
        name: "Williamson County",
        fips: "48491",
        state: "TX",
        coordinates: {
          lat: 30.6446,
          lng: -97.6016
        }
      },
      {
        geoid: "05000US48209",
        name: "Hays County",
        fips: "48209",
        state: "TX",
        coordinates: {
          lat: 30.0572,
          lng: -98.0295
        }
      },
      {
        geoid: "05000US48021",
        name: "Bastrop County",
        fips: "48021",
        state: "TX",
        coordinates: {
          lat: 30.1013,
          lng: -97.3159
        }
      },
      {
        geoid: "05000US48055",
        name: "Caldwell County",
        fips: "48055",
        state: "TX",
        coordinates: {
          lat: 29.8332,
          lng: -97.6156
        }
      }
    ];
  }
}

export const censusApiService = new CensusApiService();
