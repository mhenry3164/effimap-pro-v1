import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase/firebase-admin.json');

if (!admin.apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();
const db = getFirestore();

async function deleteCollection(collectionPath: string, batchSize: number = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, batchSize, resolve, reject);
  });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, batchSize: number, resolve: any, reject: any) {
  try {
    const snapshot = await query.get();

    // When there are no documents left, we are done
    if (snapshot.size === 0) {
      resolve();
      return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Recurse on the next process tick, to avoid exploding the stack
    process.nextTick(() => {
      deleteQueryBatch(query, batchSize, resolve, reject);
    });
  } catch (err) {
    reject(err);
  }
}

async function deleteSubcollections(docPath: string) {
  const collections = await db.doc(docPath).listCollections();
  const promises = collections.map(async (collection) => {
    await deleteCollection(collection.path);
  });
  await Promise.all(promises);
}

async function deleteTenantData(tenantId: string) {
  console.log(`Deleting data for tenant: ${tenantId}`);
  
  // List of all tenant subcollections
  const subcollections = [
    'activities',
    'boundaries',
    'branches',
    'clients',
    'config',
    'divisions',
    'leads',
    'organizations',
    'platform_settings',
    'representatives',
    'shapefileCatalog',
    'system_logs',
    'system_metrics',
    'territories',
    'users'
  ];

  // Delete all subcollections
  for (const subcollection of subcollections) {
    const collectionPath = `tenants/${tenantId}/${subcollection}`;
    console.log(`Deleting collection: ${collectionPath}`);
    await deleteCollection(collectionPath);
  }

  // Delete any nested subcollections
  await deleteSubcollections(`tenants/${tenantId}`);
  
  // Delete the tenant document itself
  await db.doc(`tenants/${tenantId}`).delete();
  console.log(`Deleted tenant document: ${tenantId}`);
}

async function deleteAllUsers() {
  console.log('Deleting all users...');
  
  // Delete users collection from Firestore
  await deleteCollection('users');
  
  // Delete users from Firebase Auth
  let users;
  try {
    users = await auth.listUsers();
    const deletePromises = users.users.map(user => auth.deleteUser(user.uid));
    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${users.users.length} users from Auth`);
  } catch (error) {
    console.error('Error deleting users from Auth:', error);
  }
}

async function deleteGlobalCollections() {
  console.log('Deleting global collections...');
  
  const globalCollections = [
    'activities',
    'branches',
    'clients',
    'divisions',
    'leads',
    'organizations',
    'platform_settings',
    'representatives',
    'shapefileCatalog',
    'system_logs',
    'system_metrics',
    'territories',
    'users'
  ];

  for (const collection of globalCollections) {
    console.log(`Deleting global collection: ${collection}`);
    await deleteCollection(collection);
  }
}

async function cleanupEnvironment() {
  try {
    console.log('Starting environment cleanup...');
    
    // Delete all users first
    await deleteAllUsers();
    
    // Delete global collections
    await deleteGlobalCollections();
    
    // Delete specific tenants
    const tenantsToDelete = [
      'test-tenant',
      'test-tenant-001',
      'heavy-machines'
    ];
    
    for (const tenantId of tenantsToDelete) {
      await deleteTenantData(tenantId);
    }
    
    console.log('Environment cleanup complete!');
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanupEnvironment();
