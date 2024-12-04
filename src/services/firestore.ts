import {
  initializeApp
} from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  serverTimestamp,
  GeoPoint,
  Timestamp,
  writeBatch,
  getDoc,
  setDoc,
  increment,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FieldValue
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { 
  Branch 
} from '../types/branch';
import type { 
  Representative 
} from '../types/representative';
import type { 
  Territory, 
  TerritoryPoint, 
  TerritoryPath
} from '../types/territory';
import type { 
  Activity 
} from '../types/activity';
import type { 
  Lead 
} from '../types/lead';
import { v4 as uuidv4 } from 'uuid';

// Custom error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class FirestoreError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'FirestoreError';
    this.code = code;
  }
}

// Error handling utility
const handleError = (error: unknown): never => {
  if (error instanceof ValidationError || error instanceof FirestoreError) {
    throw error;
  }
  if (error instanceof Error) {
    throw new FirestoreError(error.message || 'Unknown error', 'unknown');
  }
  throw new FirestoreError('An unknown error occurred', 'unknown');
};

// Type-safe document interface
interface FirestoreDocument<T> extends DocumentData {
  id: string;
  data: () => T;
}

// Type-safe converters
const territoryConverter: FirestoreDataConverter<Territory> = {
  toFirestore: (territory: Territory) => ({
    ...territory,
    createdAt: territory.createdAt instanceof Date ? Timestamp.fromDate(territory.createdAt) : territory.createdAt,
    updatedAt: territory.updatedAt instanceof Date ? Timestamp.fromDate(territory.updatedAt) : territory.updatedAt
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Territory => {
    const data = snapshot.data(options);
    return formatTerritoryData({ ...data, id: snapshot.id });
  }
};

const branchConverter: FirestoreDataConverter<Branch> = {
  toFirestore: (branch: Branch) => {
    return {
      code: branch.code,
      name: branch.name,
      address: branch.address,
      contact: branch.contact,
      location: {
        latitude: branch.coordinates ? branch.coordinates[0] : null,
        longitude: branch.coordinates ? branch.coordinates[1] : null
      },
      manager: branch.managerEmail,
      status: branch.status,
      territory: branch.territory,
      metadata: {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'system',
        updatedBy: auth.currentUser?.uid || 'system'
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Branch => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      code: data.code,
      name: data.name,
      address: data.address,
      coordinates: data.location?.latitude && data.location?.longitude 
        ? [data.location.latitude, data.location.longitude] 
        : null,
      managerEmail: data.manager,
      status: data.status || 'active',
      territory: data.territory || null
    };
  }
};

// Helper function to convert Firestore timestamp to Date with type guard
const convertTimestampToDate = <T extends { createdAt?: Date; updatedAt?: Date }>(
  doc: FirestoreDocument<T>
): T => {
  const data = doc.data();
  if (!data) {
    throw new FirestoreError('Document data is null', 'invalid-data');
  }
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
  };
};

// Coordinate validation with improved type safety
const isValidLatitude = (lat: unknown): lat is number => {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
};

const isValidLongitude = (lng: unknown): lng is number => {
  return typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
};

const isValidPoint = (point: unknown): point is { lat: number; lng: number } => {
  if (!point || typeof point !== 'object') {
    return false;
  }

  const p = point as any;
  return (
    'lat' in p &&
    'lng' in p &&
    typeof p.lat === 'number' &&
    typeof p.lng === 'number' &&
    !isNaN(p.lat) &&
    !isNaN(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
};

// Helper function to convert coordinates for Firestore with validation
const formatCoordinatesForFirestore = (coordinates: [number, number]): { lat: number; lng: number } => {
  const [lat, lng] = coordinates;
  
  if (!isValidLatitude(lat)) {
    throw new ValidationError(`Invalid latitude: ${lat}`);
  }
  if (!isValidLongitude(lng)) {
    throw new ValidationError(`Invalid longitude: ${lng}`);
  }
  
  return { lat, lng };
};

// Helper function to convert coordinates from Firestore with validation
const formatCoordinatesFromFirestore = (point: unknown): { lat: number; lng: number } => {
  if (!point) {
    throw new ValidationError('Coordinates cannot be null or undefined');
  }

  // Handle GeoPoint type from Firestore
  if (point instanceof GeoPoint) {
    return {
      lat: point.latitude,
      lng: point.longitude
    };
  }

  // Handle regular object with lat/lng
  if (isValidPoint(point)) {
    return {
      lat: point.lat,
      lng: point.lng
    };
  }

  // Handle array format [lat, lng]
  if (Array.isArray(point) && point.length === 2 && 
      typeof point[0] === 'number' && typeof point[1] === 'number') {
    return {
      lat: point[0],
      lng: point[1]
    };
  }

  throw new ValidationError('Invalid coordinates format from Firestore');
};

// Helper to safely handle array of coordinates
const formatCoordinatesArrayFromFirestore = (coordinates: unknown): Array<{ lat: number; lng: number }> => {
  if (!Array.isArray(coordinates)) {
    throw new ValidationError('Invalid coordinates array format');
  }
  
  return coordinates.map((point: { lat: number; lng: number } | GeoPoint | [number, number], index: number) => {
    try {
      return formatCoordinatesFromFirestore(point);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ValidationError(`Invalid coordinate at index ${index}: ${error.message}`);
      }
      throw new ValidationError(`Invalid coordinate at index ${index}`);
    }
  });
};

// Helper function to convert entity coordinates from Firestore with validation
const formatEntityCoordinatesFromFirestore = (point: unknown): [number, number] => {
  // Handle GeoPoint
  if (point instanceof GeoPoint) {
    const lat = point.latitude;
    const lng = point.longitude;
    if (isValidLatitude(lat) && isValidLongitude(lng)) {
      return [lat, lng];
    }
    throw new ValidationError('Invalid GeoPoint coordinates');
  }

  // Handle array format
  if (Array.isArray(point) && point.length === 2) {
    const [lat, lng] = point;
    if (typeof lat === 'number' && typeof lng === 'number' &&
        isValidLatitude(lat) && isValidLongitude(lng)) {
      return [lat, lng];
    }
  }

  // Handle object format
  if (point && typeof point === 'object' && 'latitude' in point && 'longitude' in point) {
    const { latitude, longitude } = point as { latitude: unknown; longitude: unknown };
    if (typeof latitude === 'number' && typeof longitude === 'number' &&
        isValidLatitude(latitude) && isValidLongitude(longitude)) {
      return [latitude, longitude];
    }
  }

  throw new ValidationError('Invalid coordinate data format');
};

// Helper function to convert entity coordinates for Firestore with validation
const formatEntityCoordinatesForFirestore = (coordinates: [number, number]): GeoPoint => {
  const [lat, lng] = coordinates;
  if (!isValidLatitude(lat)) {
    throw new ValidationError(`Invalid latitude: ${lat}`);
  }
  if (!isValidLongitude(lng)) {
    throw new ValidationError(`Invalid longitude: ${lng}`);
  }
  return new GeoPoint(lat, lng);
};

// Helper function to handle territory format versioning with validation
const formatTerritoryData = (data: unknown): Territory => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid territory data');
  }

  const territory = data as any;

  // Ensure paths is an array and has valid points
  if (!Array.isArray(territory.paths)) {
    territory.paths = [];
  }

  territory.paths = territory.paths.map((path: any) => {
    if (!path || typeof path !== 'object') {
      return { points: [], completed: false };
    }

    // Ensure points is an array and all points are valid
    if (!Array.isArray(path.points)) {
      path.points = [];
    }

    path.points = path.points
      .map((point: any, index: number) => {
        if (!point || typeof point !== 'object') {
          return null;
        }

        try {
          const position = formatCoordinatesFromFirestore(point.position);
          if (!position) {
            console.warn(`Invalid point position in territory ${territory.id}, index ${index}`);
            return null;
          }

          return {
            position,
            index: typeof point.index === 'number' ? point.index : index
          };
        } catch (error) {
          console.warn(`Error formatting point in territory ${territory.id}, index ${index}:`, error);
          return null;
        }
      })
      .filter((point: any) => point !== null);

    return {
      points: path.points,
      completed: !!path.completed
    };
  });

  return {
    id: territory.id || '',
    name: territory.name || '',
    description: territory.description || '',
    paths: territory.paths,
    assignedTo: territory.assignedTo || null,
    createdAt: territory.createdAt instanceof Timestamp ? territory.createdAt.toDate() : new Date(),
    updatedAt: territory.updatedAt instanceof Timestamp ? territory.updatedAt.toDate() : new Date(),
    metadata: territory.metadata || {}
  };
};

const convertBranchFromFirestore = (doc: QueryDocumentSnapshot): Branch => {
  const data = doc.data();
  const coordinates = formatCoordinatesFromFirestore(data.coordinates);
  
  return {
    id: doc.id,
    name: data.name,
    address: data.address,
    contact: data.contact,
    coordinates: [coordinates.lat, coordinates.lng],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  };
};

const convertBranchToFirestore = (branch: Omit<Branch, 'id'>) => {
  return {
    name: branch.name,
    address: branch.address,
    contact: {
      name: branch.contact.name,
      email: branch.contact.email,
      phone: branch.contact.phone,
    },
    coordinates: formatCoordinatesForFirestore(branch.coordinates),
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  };
};

const convertRepresentativeFromFirestore = (doc: QueryDocumentSnapshot): Representative => {
  const data = doc.data();
  if (!data) {
    throw new ValidationError('Invalid representative data: Document data is null');
  }

  // Required fields
  if (!data.name || typeof data.name !== 'string') {
    throw new ValidationError('Invalid representative data: Missing or invalid name');
  }
  if (!data.branchId || typeof data.branchId !== 'string') {
    throw new ValidationError('Invalid representative data: Missing or invalid branchId');
  }

  // Optional fields with defaults
  const email = data.email && typeof data.email === 'string' ? data.email : '';
  const phone = data.phone && typeof data.phone === 'string' ? data.phone : '';
  const address = data.address && typeof data.address === 'string' ? data.address : '';

  // Safely convert timestamps
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
  const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date();

  // Convert coordinates with fallback
  let coordinates: [number, number] = [0, 0];
  try {
    if (data.coordinates) {
      coordinates = formatEntityCoordinatesFromFirestore(data.coordinates);
    }
  } catch (error) {
    console.warn('Invalid coordinates for representative:', doc.id, error);
  }

  return {
    id: doc.id,
    name: data.name,
    email,
    phone,
    address,
    branchId: data.branchId,
    coordinates,
    createdAt,
    updatedAt,
  };
};

const convertRepresentativeToFirestore = (representative: Omit<Representative, 'id'>) => {
  return {
    name: representative.name,
    email: representative.email,
    phone: representative.phone,
    address: representative.address,
    branchId: representative.branchId,
    coordinates: formatEntityCoordinatesForFirestore(representative.coordinates),
    createdAt: representative.createdAt,
    updatedAt: representative.updatedAt,
  };
};

// Activity logging service
export const activityService = {
  add: async (activity: Omit<Activity, 'id'>): Promise<string> => {
    try {
      if (!activity.type || !activity.entityType || !activity.entityId) {
        throw new ValidationError('Missing required activity fields');
      }

      const docRef = await addDoc(collection(db, 'activities'), {
        ...activity,
        timestamp: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      return handleError(error);
    }
  },

  getRecent: async (limitCount: number = 10): Promise<Activity[]> => {
    try {
      if (!Number.isInteger(limitCount) || limitCount < 1) {
        throw new ValidationError('Invalid limit count');
      }

      const q = query(
        collection(db, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Activity[];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return handleError(error);
    }
  },
};

// Helper functions for territory operations
const createTerritoryPoint = (lat: number, lng: number, index: number): TerritoryPoint => ({
  id: uuidv4(),
  position: { lat, lng },
  index
});

const createTerritoryPath = (points: TerritoryPoint[] = []): TerritoryPath => ({
  id: uuidv4(),
  points,
  isComplete: false
});

// Territory service
export const territoryService = {
  getAll: async (): Promise<Territory[]> => {
    try {
      const territoriesCollection = collection(db, 'territories').withConverter(territoryConverter);
      const snapshot = await getDocs(territoriesCollection);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching territories:', error);
      return handleError(error);
    }
  },

  add: async (data: Omit<Territory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const territoryData = {
        ...data,
        id: uuidv4(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          version: 1,
          isLocked: false,
          createdBy: auth.currentUser?.uid || 'anonymous',
          lastModifiedBy: auth.currentUser?.uid || 'anonymous'
        }
      };

      const territoryRef = doc(db, 'territories', territoryData.id).withConverter(territoryConverter);
      await setDoc(territoryRef, territoryData);

      // Log the creation activity
      await activityService.add({
        type: 'create',
        entityId: territoryData.id,
        entityType: 'territory',
        entityName: data.name,
        userId: auth.currentUser?.uid || 'anonymous',
        userName: auth.currentUser?.displayName || 'Anonymous User',
        timestamp: new Date(),
        details: {
          type: data.type
        }
      });

      return territoryData.id;
    } catch (error) {
      console.error('Error adding territory:', error);
      return handleError(error);
    }
  },

  update: async (id: string, data: Partial<Territory>): Promise<void> => {
    try {
      const territoryRef = doc(db, 'territories', id).withConverter(territoryConverter);
      const territoryDoc = await getDoc(territoryRef);
      
      if (!territoryDoc.exists()) {
        throw new FirestoreError('Territory not found', 'not-found');
      }

      await updateDoc(territoryRef, {
        ...data,
        updatedAt: serverTimestamp(),
        'metadata.version': increment(1),
        'metadata.lastModifiedBy': auth.currentUser?.uid || 'anonymous'
      });
    } catch (error) {
      console.error('Error updating territory:', error);
      return handleError(error);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const territoryRef = doc(db, 'territories', id).withConverter(territoryConverter);
      const territoryDoc = await getDoc(territoryRef);
      
      if (!territoryDoc.exists()) {
        throw new FirestoreError('Territory not found', 'not-found');
      }

      await deleteDoc(territoryRef);
    } catch (error) {
      console.error('Error deleting territory:', error);
      return handleError(error);
    }
  },

  completePath: async (territoryId: string, pathId: string): Promise<void> => {
    try {
      const territoryRef = doc(db, 'territories', territoryId);
      const territoryDoc = await getDoc(territoryRef);
      
      if (!territoryDoc.exists()) {
        throw new FirestoreError('Territory not found', 'not-found');
      }

      const territory = territoryDoc.data() as Territory;
      const pathIndex = territory.paths.findIndex(p => p.id === pathId);
      
      if (pathIndex === -1) {
        throw new FirestoreError('Path not found', 'not-found');
      }

      const points = territory.paths[pathIndex].points.map((point, index) => ({
        id: point.id || uuidv4(),
        position: {
          lat: point.position.lat,
          lng: point.position.lng
        },
        index
      }));

      const updatedPath: TerritoryPath = {
        ...territory.paths[pathIndex],
        points,
        isComplete: true
      };

      await updateDoc(territoryRef, {
        [`paths.${pathIndex}`]: updatedPath,
        updatedAt: serverTimestamp(),
        'metadata.version': increment(1)
      });
    } catch (error) {
      console.error('Error completing path:', error);
      return handleError(error);
    }
  }
};

// Branch service
export const branchService = {
  getAll: async (tenantId: string): Promise<Branch[]> => {
    try {
      const branchesCollection = collection(db, `tenants/${tenantId}/branches`).withConverter(branchConverter);
      const snapshot = await getDocs(branchesCollection);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
    } catch (error) {
      console.error('Error fetching branches:', error);
      return handleError(error);
    }
  },

  add: async (tenantId: string, data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const branchData = {
        ...data,
        id: uuidv4(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const branchRef = doc(db, `tenants/${tenantId}/branches`, branchData.id).withConverter(branchConverter);
      await setDoc(branchRef, branchData);

      // Log the creation activity
      await activityService.add({
        type: 'create',
        entityId: branchData.id,
        entityType: 'branch',
        entityName: data.name,
        metadata: {
          tenantId
        }
      });

      return branchData.id;
    } catch (error) {
      console.error('Error adding branch:', error);
      return handleError(error);
    }
  },

  update: async (tenantId: string, id: string, data: Partial<Branch>): Promise<void> => {
    try {
      const branchRef = doc(db, `tenants/${tenantId}/branches`, id).withConverter(branchConverter);
      await updateDoc(branchRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      // Log the update activity
      await activityService.add({
        type: 'update',
        entityId: id,
        entityType: 'branch',
        entityName: data.name,
        metadata: {
          tenantId,
          changes: Object.keys(data)
        }
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      return handleError(error);
    }
  },

  delete: async (tenantId: string, id: string): Promise<void> => {
    try {
      const branchRef = doc(db, `tenants/${tenantId}/branches`, id).withConverter(branchConverter);
      
      // Get branch data before deletion for activity log
      const branchDoc = await getDoc(branchRef);
      const branchData = branchDoc.data();

      await deleteDoc(branchRef);

      // Log the deletion activity
      await activityService.add({
        type: 'delete',
        entityId: id,
        entityType: 'branch',
        entityName: branchData?.name,
        metadata: {
          tenantId
        }
      });
    } catch (error) {
      console.error('Error deleting branch:', error);
      return handleError(error);
    }
  }
};

// Representative service
export const representativeService = {
  getAll: async (): Promise<Representative[]> => {
    try {
      const representativesCollection = collection(db, 'representatives');
      const snapshot = await getDocs(representativesCollection);
      return snapshot.docs.map(doc => convertRepresentativeFromFirestore(doc as QueryDocumentSnapshot));
    } catch (error) {
      console.error('Error fetching representatives:', error);
      return handleError(error);
    }
  },

  add: async (representative: Omit<Representative, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(
        collection(db, 'representatives'),
        convertRepresentativeToFirestore(representative)
      );
      return docRef.id;
    } catch (error) {
      console.error('Error adding representative:', error);
      return handleError(error);
    }
  },

  update: async (id: string, data: Partial<Representative>): Promise<void> => {
    try {
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        coordinates: data.coordinates ? formatEntityCoordinatesForFirestore(data.coordinates) : undefined
      };
      await updateDoc(doc(db, 'representatives', id), updateData);
    } catch (error) {
      console.error('Error updating representative:', error);
      return handleError(error);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'representatives', id));
    } catch (error) {
      console.error('Error deleting representative:', error);
      return handleError(error);
    }
  }
};

// Lead service
export const leadService = {
  add: async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'leads'), {
        ...leadData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: leadData.status || 'new'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding lead:', error);
      return handleError(error);
    }
  },

  getAll: async (): Promise<Lead[]> => {
    try {
      const leadsCollection = collection(db, 'leads');
      const snapshot = await getDocs(leadsCollection);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          address: data.address,
          notes: data.notes || '',
          status: data.status || 'new',
          assignedTo: data.assignedTo,
          territoryId: data.territoryId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Lead;
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      return handleError(error);
    }
  },
};

const calculatePolygonArea = (points: TerritoryPoint[]): number => {
  // Implementation of polygon area calculation
  return 0;
};

const calculatePolygonPerimeter = (points: TerritoryPoint[]): number => {
  // Implementation of polygon perimeter calculation
  return 0;
};