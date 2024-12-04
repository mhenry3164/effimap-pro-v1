import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Representative } from '../types/representative';

export class RepresentativeService {
  async getRepresentativesByBranch(tenantId: string, branchId: string): Promise<Representative[]> {
    try {
      const representativesRef = collection(db, 'tenants', tenantId, 'representatives');
      const q = query(representativesRef, where('branchId', '==', branchId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Representative[];
    } catch (error) {
      console.error('Error fetching representatives by branch:', error);
      throw error;
    }
  }

  constructor() {}

  async getAll(tenantId: string): Promise<Representative[]> {
    try {
      const representativesRef = collection(db, 'tenants', tenantId, 'representatives');
      const snapshot = await getDocs(representativesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Representative[];
    } catch (error) {
      console.error('Error fetching representatives:', error);
      throw error;
    }
  }

  async getById(tenantId: string, id: string): Promise<Representative | null> {
    try {
      const representativeRef = doc(db, 'tenants', tenantId, 'representatives', id);
      const representativeDoc = await getDoc(representativeRef);
      
      if (!representativeDoc.exists()) {
        return null;
      }

      return {
        id: representativeDoc.id,
        ...representativeDoc.data()
      } as Representative;
    } catch (error) {
      console.error('Error fetching representative:', error);
      throw error;
    }
  }

  async getByBranchId(tenantId: string, branchId: string): Promise<Representative[]> {
    try {
      const representativesRef = collection(db, 'tenants', tenantId, 'representatives');
      const q = query(representativesRef, where('branchId', '==', branchId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Representative[];
    } catch (error) {
      console.error('Error fetching representatives by branch:', error);
      throw error;
    }
  }

  async add(tenantId: string, representative: Omit<Representative, 'id'>): Promise<string> {
    try {
      const representativesRef = collection(db, 'tenants', tenantId, 'representatives');
      const docRef = await addDoc(representativesRef, {
        ...representative,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tenantId
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding representative:', error);
      throw error;
    }
  }

  async update(tenantId: string, id: string, representative: Partial<Representative>): Promise<void> {
    try {
      const representativeRef = doc(db, 'tenants', tenantId, 'representatives', id);
      await updateDoc(representativeRef, {
        ...representative,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating representative:', error);
      throw error;
    }
  }

  async delete(tenantId: string, id: string): Promise<void> {
    try {
      const representativeRef = doc(db, 'tenants', tenantId, 'representatives', id);
      await deleteDoc(representativeRef);
    } catch (error) {
      console.error('Error deleting representative:', error);
      throw error;
    }
  }
}

export const representativeService = new RepresentativeService();
