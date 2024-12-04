import { parentPort, workerData } from 'worker_threads';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';
import { gzipSync } from 'zlib';
import fs from 'fs';
import path from 'path';

const { zoomLevels, boundaryType, geojsonData, firebaseConfig } = workerData;

// Initialize Firebase in the worker
try {
  initializeApp({
    credential: cert(firebaseConfig),
    storageBucket: firebaseConfig.storageBucket
  });
} catch (error) {
  console.error('Failed to initialize Firebase in worker:', error);
  process.exit(1);
}

const bucket = getStorage().bucket();

// Create tile index from GeoJSON
const tileIndex = geojsonvt(geojsonData, {
  maxZoom: Math.max(...zoomLevels),
  tolerance: 3,
  extent: 4096,
  buffer: 64,
  lineMetrics: false,
  generateId: true,
});

async function uploadTile(z, x, y, tileData) {
  const path = `boundaries/${boundaryType}/tiles/${z}/${x}/${y}.mvt`;
  try {
    const file = bucket.file(path);
    await file.save(tileData, {
      metadata: {
        contentType: 'application/x-protobuf',
        contentEncoding: 'gzip'
      }
    });
    return true;
  } catch (error) {
    console.error(`Failed to upload tile ${path}:`, error);
    parentPort.postMessage({ type: 'error', error: `Failed to upload tile ${path}: ${error.message}` });
    return false;
  }
}

async function processTiles() {
  try {
    for (const z of zoomLevels) {
      const tilesPerAxis = Math.pow(2, z);
      
      for (let x = 0; x < tilesPerAxis; x++) {
        for (let y = 0; y < tilesPerAxis; y++) {
          const tile = tileIndex.getTile(z, x, y);
          
          if (tile) {
            try {
              const pbf = vtpbf(tile);
              const compressed = gzipSync(pbf);
              await uploadTile(z, x, y, compressed);
            } catch (error) {
              console.error(`Error processing tile z=${z} x=${x} y=${y}:`, error);
              parentPort.postMessage({ 
                type: 'error', 
                error: `Error processing tile z=${z} x=${x} y=${y}: ${error.message}` 
              });
            }
          }
          
          // Report progress for each tile processed
          parentPort.postMessage({ type: 'progress', data: 1 });
        }
      }
    }
  } catch (error) {
    console.error('Error in processTiles:', error);
    parentPort.postMessage({ type: 'error', error: error.message });
    process.exit(1);
  }
}

processTiles().catch(error => {
  console.error('Fatal error in worker:', error);
  parentPort.postMessage({ type: 'error', error: error.message });
  process.exit(1);
});
