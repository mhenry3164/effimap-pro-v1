import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Division, DivisionInput } from '../types/division';

export class DivisionService {
  constructor() {}

  async getAll(tenantId: string): Promise<Division[]> {
    try {
      const divisionsRef = collection(db, 'tenants', tenantId, 'divisions');
      const snapshot = await getDocs(divisionsRef);
      const divisions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Division[];
      
      // Sort divisions by name
      return divisions.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching divisions:', error);
      throw error;
    }
  }

  async create(tenantId: string, divisionInput: DivisionInput): Promise<Division> {
    try {
      const divisionsRef = collection(db, 'tenants', tenantId, 'divisions');
      const newDivision = {
        ...divisionInput,
        status: divisionInput.status || 'active',
        tenantId,
        metadata: {
          createdAt: serverTimestamp(),
          createdBy: 'system', // TODO: Replace with actual user ID
          updatedAt: serverTimestamp(),
          updatedBy: 'system' // TODO: Replace with actual user ID
        }
      };
      
      const docRef = await addDoc(divisionsRef, newDivision);
      return {
        id: docRef.id,
        ...newDivision,
      } as Division;
    } catch (error) {
      console.error('Error creating division:', error);
      throw error;
    }
  }

  async update(tenantId: string, id: string, updates: DivisionInput): Promise<void> {
    try {
      const divisionRef = doc(db, 'tenants', tenantId, 'divisions', id);
      await updateDoc(divisionRef, {
        ...updates,
        'metadata.updatedAt': serverTimestamp(),
        'metadata.updatedBy': 'system' // TODO: Replace with actual user ID
      });
    } catch (error) {
      console.error('Error updating division:', error);
      throw error;
    }
  }

  async delete(tenantId: string, id: string): Promise<void> {
    try {
      const divisionRef = doc(db, 'tenants', tenantId, 'divisions', id);
      await deleteDoc(divisionRef);
    } catch (error) {
      console.error('Error deleting division:', error);
      throw error;
    }
  }

  async getById(tenantId: string, id: string): Promise<Division | null> {
    try {
      const divisionRef = doc(db, 'tenants', tenantId, 'divisions', id);
      const snapshot = await getDoc(divisionRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Division;
    } catch (error) {
      console.error('Error fetching division:', error);
      throw error;
    }
  }

  async getBranches(tenantId: string, divisionId: string): Promise<string[]> {
    try {
      const branchesRef = collection(db, 'tenants', tenantId, 'branches');
      const branchQuery = query(branchesRef, where('divisionId', '==', divisionId));
      const snapshot = await getDocs(branchQuery);
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching division branches:', error);
      throw error;
    }
  }

  async getMetrics(tenantId: string, divisionId: string) {
    try {
      const branchIds = await this.getBranches(tenantId, divisionId);
      
      // Get all users in the division's branches
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, 
        where('tenantId', '==', tenantId),
        where('branchId', 'in', branchIds)
      );
      const userSnapshot = await getDocs(userQuery);
      
      // Get all territories in the division's branches
      const territories: any[] = [];
      for (const branchId of branchIds) {
        const territoriesRef = collection(db, 'tenants', tenantId, 'branches', branchId, 'territories');
        const territorySnapshot = await getDocs(territoriesRef);
        territories.push(...territorySnapshot.docs);
      }

      return {
        userCount: userSnapshot.size,
        branchCount: branchIds.length,
        territoryCount: territories.length
      };
    } catch (error) {
      console.error('Error fetching division metrics:', error);
      throw error;
    }
  }
}

export const divisionService = new DivisionService();
