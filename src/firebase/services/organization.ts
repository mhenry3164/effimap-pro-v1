import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { organizationsCollection } from '../collections';
import type { Organization } from '../../types/organization';

export const organizationService = {
  async create(orgData: Omit<Organization, 'id'>) {
    const orgRef = doc(organizationsCollection);
    await setDoc(orgRef, {
      ...orgData,
      id: orgRef.id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastBillingDate: new Date(),
        status: 'active'
      }
    });
    return orgRef.id;
  },

  async get(orgId: string) {
    const orgDoc = await getDoc(doc(organizationsCollection, orgId));
    return orgDoc.exists() ? orgDoc.data() as Organization : null;
  },

  async update(orgId: string, data: Partial<Organization>) {
    const orgRef = doc(organizationsCollection, orgId);
    await updateDoc(orgRef, {
      ...data,
      'metadata.updatedAt': new Date()
    });
  },

  async delete(orgId: string) {
    await deleteDoc(doc(organizationsCollection, orgId));
  }
};
