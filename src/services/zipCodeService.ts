import { ZipCode, ZipCodeTotal, ZipCodeLocation } from '../types/zipCode';
import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';

class ZipCodeService {
  private zipCodesMap: Map<string, ZipCode> = new Map();
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const response = await fetch('https://gist.githubusercontent.com/erichurst/7882666/raw/5bdc46db47d9515269ab12ed6fb2850377fd869e/US%2520Zip%2520Codes%2520from%25202013%2520Government%2520Data');
      const text = await response.text();
      
      // Skip header line and process each line
      const lines = text.split('\n').slice(1);
      lines.forEach(line => {
        const [zip, lat, lng] = line.split(',');
        if (zip && lat && lng) {
          this.zipCodesMap.set(zip.trim(), {
            zip: zip.trim(),
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          });
        }
      });

      this.initialized = true;
      console.log('Zip code service initialized with', this.zipCodesMap.size, 'zip codes');
    } catch (error) {
      console.error('Error initializing zip code service:', error);
      throw error;
    }
  }

  async getLocation(zip: string): Promise<ZipCode | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.zipCodesMap.get(zip) || null;
  }

  async processZipTotals(tenantId: string, zipTotals: ZipCodeTotal[]): Promise<ZipCodeLocation[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const locations: ZipCodeLocation[] = [];
    
    for (const zipTotal of zipTotals) {
      const location = this.zipCodesMap.get(zipTotal.zip);
      if (location) {
        const zipLocation: ZipCodeLocation = {
          ...zipTotal,
          lat: location.lat,
          lng: location.lng
        };
        locations.push(zipLocation);

        // Store in Firestore under tenant's collection
        try {
          const zipRef = doc(db, 'tenants', tenantId, 'zipCodes', zipTotal.zip);
          await setDoc(zipRef, zipLocation, { merge: true });
        } catch (error) {
          console.error('Error storing zip code data:', error);
        }
      }
    }

    return locations;
  }

  async getStoredZipCodes(tenantId: string): Promise<ZipCodeLocation[]> {
    try {
      const zipCodesRef = collection(db, 'tenants', tenantId, 'zipCodes');
      const snapshot = await getDocs(zipCodesRef);
      return snapshot.docs.map(doc => doc.data() as ZipCodeLocation);
    } catch (error) {
      console.error('Error fetching stored zip codes:', error);
      return [];
    }
  }

  async validateZipCodes(zipCodes: string[]): Promise<{ valid: string[]; invalid: string[] }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const valid: string[] = [];
    const invalid: string[] = [];

    zipCodes.forEach(zip => {
      if (this.zipCodesMap.has(zip)) {
        valid.push(zip);
      } else {
        invalid.push(zip);
      }
    });

    return { valid, invalid };
  }
}

// Export singleton instance
export const zipCodeService = new ZipCodeService();
