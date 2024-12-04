import { db } from './config';
import { collection, CollectionReference, DocumentReference, doc } from 'firebase/firestore';
import { Organization } from '../types/tenant';

// Platform-level collections
export const organizationsCollection = collection(db, 'organizations') as CollectionReference<Organization>;
export const platformSettingsCollection = collection(db, 'platformSettings');

// Organization-scoped collections
export const getOrganizationCollections = (orgId: string) => ({
  // Core collections
  users: collection(db, `organizations/${orgId}/users`),
  divisions: collection(db, `organizations/${orgId}/divisions`),
  branches: collection(db, `organizations/${orgId}/branches`),
  territories: collection(db, `organizations/${orgId}/territories`),
  
  // Configuration collections
  features: collection(db, `organizations/${orgId}/features`),
  settings: collection(db, `organizations/${orgId}/settings`),
  
  // Access control collections
  roles: collection(db, `organizations/${orgId}/roles`),
  permissions: collection(db, `organizations/${orgId}/permissions`),
  
  // Monitoring collections
  activities: collection(db, `organizations/${orgId}/activities`),
  apiRequests: collection(db, `organizations/${orgId}/apiRequests`),
  
  // Feature-specific collections
  analytics: collection(db, `organizations/${orgId}/analytics`)
});

// Helper functions to get specific documents
export const getOrganizationDoc = (orgId: string): DocumentReference<Organization> => 
  doc(db, 'organizations', orgId) as DocumentReference<Organization>;

export const getFeatureConfigDoc = (orgId: string) => 
  doc(db, `organizations/${orgId}/features/config`);

export const getSettingsDoc = (orgId: string) => 
  doc(db, `organizations/${orgId}/settings/config`);

export const getApiSettingsDoc = (orgId: string) => 
  doc(db, `organizations/${orgId}/settings/api`);
