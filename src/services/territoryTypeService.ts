import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export interface TerritoryTypeDefinition {
  id: string;
  name: string;
  code: string;
  color?: string;
  description?: string;
  isSystem?: boolean;
  parentType?: string; // Parent type code (e.g., 'oem' for brand territories)
  isCategory?: boolean; // True for category types like 'OEM Territories'
  metadata?: {
    [key: string]: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class TerritoryTypeService {
  async getAll(tenantId: string): Promise<TerritoryTypeDefinition[]> {
    try {
      // Get the tenant document first to ensure it exists
      const tenantRef = doc(db, 'tenants', tenantId);
      const tenantDoc = await getDoc(tenantRef);
      
      if (!tenantDoc.exists()) {
        throw new Error('Tenant not found');
      }

      // Get territory types from the tenant-specific collection
      const typesRef = collection(db, 'tenants', tenantId, 'territoryTypes');
      const snapshot = await getDocs(typesRef);
      
      if (snapshot.empty) {
        // If no types exist, initialize default types
        await this.initializeDefaultTypes(tenantId);
        const newSnapshot = await getDocs(typesRef);
        return newSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TerritoryTypeDefinition));
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TerritoryTypeDefinition));
    } catch (error) {
      console.error('Error fetching territory types:', error);
      throw error;
    }
  }

  async create(tenantId: string, data: Omit<TerritoryTypeDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const typesRef = collection(db, 'tenants', tenantId, 'territoryTypes');
      const docRef = await addDoc(typesRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating territory type:', error);
      throw error;
    }
  }

  async update(tenantId: string, id: string, data: Partial<TerritoryTypeDefinition>): Promise<void> {
    try {
      const typeRef = doc(db, 'tenants', tenantId, 'territoryTypes', id);
      await updateDoc(typeRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating territory type:', error);
      throw error;
    }
  }

  async delete(tenantId: string, id: string): Promise<void> {
    try {
      const typeRef = doc(db, 'tenants', tenantId, 'territoryTypes', id);
      const typeDoc = await getDoc(typeRef);
      
      if (typeDoc.exists() && typeDoc.data().isSystem) {
        throw new Error('Cannot delete system territory type');
      }
      
      await deleteDoc(typeRef);
    } catch (error) {
      console.error('Error deleting territory type:', error);
      throw error;
    }
  }

  async initializeDefaultTypes(tenantId: string): Promise<void> {
    const defaultTypes = [
      {
        name: 'Branch',
        code: 'branch',
        color: '#2196F3',
        isSystem: true,
        description: 'Branch territory'
      },
      {
        name: 'Representative',
        code: 'representative',
        color: '#4CAF50',
        isSystem: true,
        description: 'Sales representative territory'
      }
    ];

    try {
      const batch = writeBatch(db);
      const typesRef = collection(db, 'tenants', tenantId, 'territoryTypes');
      
      // Check if types already exist
      const snapshot = await getDocs(typesRef);
      const existingTypes = snapshot.docs.map(doc => doc.data().code);
      
      for (const type of defaultTypes) {
        if (!existingTypes.includes(type.code)) {
          const newTypeRef = doc(typesRef);
          batch.set(newTypeRef, {
            ...type,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error initializing default types:', error);
      throw error;
    }
  }
}

export const territoryTypeService = new TerritoryTypeService();
