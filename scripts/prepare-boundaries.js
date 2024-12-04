// prepare-boundaries.js

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';
import geojsonvt from 'geojson-vt';
import simplify from 'simplify-geojson';
import { Worker, isMainThread } from 'worker_threads';
import { cpus } from 'os';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const TILE_MAX_ZOOM = 12;
const TILE_MIN_ZOOM = 0;
const NUM_WORKERS = 16;
const DATA_DIR = path.join(process.cwd(), 'data');

// Progress Tracker Class
class ProgressTracker {
  constructor(total, name) {
    this.total = total;
    this.current = 0;
    this.startTime = Date.now();
    this.name = name;
  }

  increment(amount = 1) {
    this.current += amount;
    this.logProgress();
  }

  logProgress() {
    const percent = ((this.current / this.total) * 100).toFixed(1);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const rate = (this.current / elapsed).toFixed(1);
    process.stdout.write(`\r${this.name}: ${percent}% (${this.current}/${this.total}) | ${rate} items/sec | ${elapsed}s elapsed`);
  }

  complete() {
    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`\n✓ ${this.name} completed in ${totalTime}s`);
  }
}

// Initialize Firebase
let bucket;
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(
    process.env.FIREBASE_ADMIN_CREDENTIALS ||
      fs.readFileSync(path.join(process.cwd(), 'firebase-admin.json'), 'utf8')
  );

  if (!process.env.VITE_FIREBASE_STORAGE_BUCKET) {
    throw new Error('VITE_FIREBASE_STORAGE_BUCKET is not defined in the environment variables.');
  }

  initializeApp({
    credential: cert(firebaseConfig),
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  });

  bucket = getStorage().bucket();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  process.exit(1);
}

// Clear Firebase Storage Bucket
async function clearBucket(prefix) {
  console.log(`\nClearing existing data from bucket: ${prefix}`);
  try {
    const [files] = await bucket.getFiles({ prefix });
    console.log(`Found ${files.length} files to delete`);
    
    const batchSize = 100;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, Math.min(i + batchSize, files.length));
      await Promise.all(batch.map(file => file.delete().catch(err => {
        if (err.code !== 404) {
          console.error(`Failed to delete ${file.name}:`, err);
        }
      })));
      console.log(`Deleted ${Math.min((i + batchSize), files.length)}/${files.length} files`);
    }
  } catch (error) {
    console.error('Error clearing bucket:', error);
    throw error;
  }
}

// Upload with Retry Logic
async function uploadWithRetry(filePath, data, metadata = {}, retryCount = 0) {
  try {
    const file = bucket.file(filePath);
    await file.save(data, { metadata });
    return true;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying upload for ${filePath} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount)));
      return uploadWithRetry(filePath, data, metadata, retryCount + 1);
    }
    throw error;
  }
}

// Validate and Load GeoJSON
function loadGeoJSON(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Validate GeoJSON structure
    if (!data || !data.type || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      throw new Error('Invalid GeoJSON: Must be a FeatureCollection');
    }

    // Filter out invalid features
    data.features = data.features.filter(feature => {
      return feature && 
             feature.type === 'Feature' && 
             feature.geometry && 
             feature.geometry.type && 
             feature.geometry.coordinates &&
             Array.isArray(feature.geometry.coordinates);
    });

    if (data.features.length === 0) {
      throw new Error('No valid features found in GeoJSON');
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to load GeoJSON from ${filePath}: ${error.message}`);
  }
}

// Process and Upload Boundary Function
async function processAndUploadBoundary(boundaryType, inputFile, progress) {
  try {
    console.log(`\nProcessing ${boundaryType} from ${inputFile}`);
    
    // Load and validate GeoJSON
    const geojson = loadGeoJSON(inputFile);
    console.log(`Loaded ${geojson.features.length} features for ${boundaryType}`);

    // Simplify geometries
    const simplifiedGeojson = simplify(geojson, 0.01);
    console.log(`Simplified geometries for ${boundaryType}`);

    // Upload metadata
    const metadata = {
      bounds: simplifiedGeojson.bbox || calculateBounds(simplifiedGeojson),
      minZoom: TILE_MIN_ZOOM,
      maxZoom: TILE_MAX_ZOOM,
      featureCount: geojson.features.length,
    };
    
    await uploadWithRetry(
      `boundaries/${boundaryType}/metadata.json`,
      JSON.stringify(metadata),
      { contentType: 'application/json' }
    );

    // Process tiles using worker threads
    const zoomLevels = Array.from({ length: TILE_MAX_ZOOM + 1 }, (_, i) => i);
    const workerPromises = [];
    const zoomLevelsPerWorker = Math.ceil(zoomLevels.length / NUM_WORKERS);

    for (let i = 0; i < NUM_WORKERS; i++) {
      const workerZoomLevels = zoomLevels.slice(
        i * zoomLevelsPerWorker,
        Math.min((i + 1) * zoomLevelsPerWorker, zoomLevels.length)
      );

      if (workerZoomLevels.length === 0) continue;

      const worker = new Worker(new URL('./processTiles.js', import.meta.url));
      const totalTilesForWorker = workerZoomLevels.reduce((acc, z) => {
        return acc + Math.pow(4, z);
      }, 0);

      worker.postMessage({
        zoomLevels: workerZoomLevels,
        boundaryType,
        geojsonData: simplifiedGeojson,
        firebaseConfig: {
          ...firebaseConfig,
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
        }
      });

      worker.on('message', (message) => {
        if (message.type === 'progress') {
          progress.increment();
        } else if (message.type === 'error') {
          console.error(`Worker error:`, message.error);
        }
      });

      worker.on('error', (err) => {
        console.error('Worker thread error:', err);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
      });

      workerPromises.push(
        new Promise((resolve) => {
          worker.on('exit', resolve);
        })
      );
    }

    await Promise.all(workerPromises);
  } catch (error) {
    console.error(`Error processing ${boundaryType}:`, error);
    throw error;
  }
}

// Helper function to calculate bounds from GeoJSON
function calculateBounds(geojson) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  geojson.features.forEach(feature => {
    if (feature.geometry && feature.geometry.coordinates) {
      const coords = feature.geometry.coordinates.flat(2);
      for (let i = 0; i < coords.length; i += 2) {
        minX = Math.min(minX, coords[i]);
        maxX = Math.max(maxX, coords[i]);
        minY = Math.min(minY, coords[i + 1]);
        maxY = Math.max(maxY, coords[i + 1]);
      }
    }
  });
  
  return [minX, minY, maxX, maxY];
}

// Main Function
async function main() {
  try {
    await clearBucket('boundaries/');

    const boundaryTypes = ['states', 'counties', 'zipcodes'];
    
    for (const type of boundaryTypes) {
      const inputFile = path.join(DATA_DIR, `${type}.geojson.json`);
      
      if (!fs.existsSync(inputFile)) {
        console.error(`Missing input file: ${inputFile}`);
        continue;
      }

      // Calculate total tiles for progress tracking
      const totalTiles = calculateTotalTiles(TILE_MIN_ZOOM, TILE_MAX_ZOOM);
      const progress = new ProgressTracker(totalTiles, `${type} tiles`);

      try {
        await processAndUploadBoundary(type, inputFile, progress);
        progress.complete();
      } catch (error) {
        console.error(`Failed to process ${type}:`, error);
        // Continue with next boundary type
      }
    }

    console.log('\n✓ All boundaries processed successfully');
  } catch (error) {
    console.error('\nProcessing failed:', error);
    process.exit(1);
  }
}

// Helper function to calculate total tiles
function calculateTotalTiles(minZoom, maxZoom) {
  let total = 0;
  for (let z = minZoom; z <= maxZoom; z++) {
    const tilesPerAxis = Math.pow(2, z);
    total += tilesPerAxis * tilesPerAxis;
  }
  return total;
}

// Entry Point
if (isMainThread) {
  main();
}
