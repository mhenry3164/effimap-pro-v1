import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase/firebase-admin.json');

if (!admin.apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

const TENANT_ID = 'heavy-machines';

async function updateBranchLocations() {
  try {
    const branchesRef = db.collection('tenants').doc(TENANT_ID).collection('branches');
    const branchesSnapshot = await branchesRef.get();
    
    console.log(`Found ${branchesSnapshot.size} branches to update`);
    
    const batch = db.batch();
    let updateCount = 0;

    for (const doc of branchesSnapshot.docs) {
      const branch = doc.data();
      
      // Skip if no location data
      if (!branch.location?.latitude || !branch.location?.longitude) {
        console.log(`Skipping branch ${branch.name} - No location data`);
        continue;
      }

      // Create the new geopoint
      const geopoint = new admin.firestore.GeoPoint(
        branch.location.latitude,
        branch.location.longitude
      );

      // Update the document
      const branchRef = branchesRef.doc(doc.id);
      batch.update(branchRef, {
        location: geopoint,
        // Keep the original location data in a separate field for reference
        originalLocation: branch.location
      });

      updateCount++;
      console.log(`Queued update for branch ${branch.name}`);
    }

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${updateCount} branches`);
    } else {
      console.log('No branches needed updating');
    }

  } catch (error) {
    console.error('Error updating branch locations:', error);
  }
}

async function updateRepresentativeLocations() {
  try {
    const repsRef = db.collection('tenants').doc(TENANT_ID).collection('representatives');
    const repsSnapshot = await repsRef.get();
    
    console.log(`Found ${repsSnapshot.size} representatives to update`);
    
    const batch = db.batch();
    let updateCount = 0;

    for (const doc of repsSnapshot.docs) {
      const rep = doc.data();
      
      // Skip if no location data
      if (!rep.location?.latitude || !rep.location?.longitude) {
        console.log(`Skipping representative ${rep.name} - No location data`);
        continue;
      }

      // Create the new geopoint
      const geopoint = new admin.firestore.GeoPoint(
        rep.location.latitude,
        rep.location.longitude
      );

      // Update the document
      const repRef = repsRef.doc(doc.id);
      batch.update(repRef, {
        location: geopoint,
        // Keep the original location data in a separate field for reference
        originalLocation: rep.location
      });

      updateCount++;
      console.log(`Queued update for representative ${rep.name}`);
    }

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${updateCount} representatives`);
    } else {
      console.log('No representatives needed updating');
    }

  } catch (error) {
    console.error('Error updating representative locations:', error);
  }
}

// Run the updates
async function updateAllLocations() {
  console.log('Starting location updates...');
  
  await updateBranchLocations();
  await updateRepresentativeLocations();
  
  console.log('Location updates completed');
  process.exit(0);
}

updateAllLocations();
