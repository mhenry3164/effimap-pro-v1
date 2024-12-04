import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Branch, BranchInput } from '../types/branch';

export class BranchService {
  constructor() {}

  async getAll(tenantId: string): Promise<Branch[]> {
    try {
      const branchesRef = collection(db, 'tenants', tenantId, 'branches');
      const snapshot = await getDocs(branchesRef);
      const branches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Branch[];
      
      // Sort branches by name
      return branches.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  async create(tenantId: string, branchInput: BranchInput): Promise<Branch> {
    try {
      const branchesRef = collection(db, 'tenants', tenantId, 'branches');
      const newBranch = {
        ...branchInput,
        status: branchInput.status || 'active',
        tenantId,
        metadata: {
          createdAt: serverTimestamp(),
          createdBy: 'system', // TODO: Replace with actual user ID
          updatedAt: serverTimestamp(),
          updatedBy: 'system' // TODO: Replace with actual user ID
        }
      };
      
      const docRef = await addDoc(branchesRef, newBranch);
      return {
        id: docRef.id,
        ...newBranch,
      } as Branch;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  async update(tenantId: string, id: string, updates: BranchInput): Promise<void> {
    try {
      const branchRef = doc(db, 'tenants', tenantId, 'branches', id);
      await updateDoc(branchRef, {
        ...updates,
        'metadata.updatedAt': serverTimestamp(),
        'metadata.updatedBy': 'system' // TODO: Replace with actual user ID
      });
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  }

  async delete(tenantId: string, id: string): Promise<void> {
    try {
      const branchRef = doc(db, 'tenants', tenantId, 'branches', id);
      await deleteDoc(branchRef);
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  }

  async getById(tenantId: string, id: string): Promise<Branch | null> {
    try {
      const branchRef = doc(db, 'tenants', tenantId, 'branches', id);
      const snapshot = await getDoc(branchRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Branch;
    } catch (error) {
      console.error('Error fetching branch:', error);
      throw error;
    }
  }

  async getByDivision(tenantId: string, divisionId: string): Promise<Branch[]> {
    try {
      const branchesRef = collection(db, 'tenants', tenantId, 'branches');
      const q = query(branchesRef, where('divisionId', '==', divisionId));
      const snapshot = await getDocs(q);
      const branches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Branch[];
      
      return branches.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching branches by division:', error);
      throw error;
    }
  }
}

export const branchService = new BranchService();
