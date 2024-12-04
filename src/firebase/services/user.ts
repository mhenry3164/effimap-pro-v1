import { doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../config';
import { getOrganizationCollections } from '../collections';
import type { User } from '../../types/user';
import type { UserRole } from '../../types/roles';

export const userService = {
  async createUser(orgId: string, userData: Omit<User, 'id'>) {
    const { users } = getOrganizationCollections(orgId);
    const userRef = doc(users);
    
    await setDoc(userRef, {
      ...userData,
      id: userRef.id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        status: 'active'
      }
    });
    
    return userRef.id;
  },

  async getUser(orgId: string, userId: string) {
    const { users } = getOrganizationCollections(orgId);
    const userDoc = await getDoc(doc(users, userId));
    return userDoc.exists() ? userDoc.data() as User : null;
  },

  async updateUser(orgId: string, userId: string, data: Partial<User>) {
    const { users } = getOrganizationCollections(orgId);
    const userRef = doc(users, userId);
    await updateDoc(userRef, {
      ...data,
      'metadata.updatedAt': new Date()
    });
  },

  async getUsersByRole(orgId: string, role: string) {
    const { users } = getOrganizationCollections(orgId);
    const q = query(users, where('organizationRoles', 'array-contains', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  },

  async assignRole(orgId: string, userId: string, roleData: UserRole) {
    const { users } = getOrganizationCollections(orgId);
    const userRef = doc(users, userId);
    await updateDoc(userRef, {
      organizationRoles: roleData.roles,
      'metadata.updatedAt': new Date()
    });
  }
};
