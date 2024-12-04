import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDwWtipHZYlNIzfHRrAq-7sM8Aniju7beA",
  authDomain: "hmi-territory-mapping-tool.firebaseapp.com",
  projectId: "hmi-territory-mapping-tool",
  storageBucket: "hmi-territory-mapping-tool.firebasestorage.app",
  messagingSenderId: "111564690259",
  appId: "1:111564690259:web:40235bd7ad81dfee7687a6",
  measurementId: "G-LQKV8KH8XK"
};

// Initialize Firebase
console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set persistence based on browser compatibility
const initializeAuth = async () => {
  console.log('Setting up auth persistence...');
  try {
    // Test IndexedDB availability
    const testDb = window.indexedDB.open('test');
    testDb.onerror = () => {
      console.log('IndexedDB not available, using in-memory persistence');
      // If IndexedDB is not available, fall back to in-memory persistence
      setPersistence(auth, inMemoryPersistence);
    };
    testDb.onsuccess = () => {
      console.log('IndexedDB available, using local persistence');
      // If IndexedDB is available, use local persistence
      setPersistence(auth, browserLocalPersistence);
      testDb.result.close();
      window.indexedDB.deleteDatabase('test');
    };
  } catch (error) {
    console.error('Error setting auth persistence:', error);
    // Fall back to in-memory persistence if there's an error
    setPersistence(auth, inMemoryPersistence);
  }
};

// Initialize auth settings
console.log('Starting auth initialization...');
initializeAuth().then(() => {
  console.log('Auth initialization complete');
}).catch(error => {
  console.error('Auth initialization failed:', error);
});

export { app, auth, db, storage };