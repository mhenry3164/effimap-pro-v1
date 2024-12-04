/**
 * Environment configuration for the application
 * Access environment variables in a type-safe way
 */

// Ensure environment variables are loaded
if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API Key is not defined in environment variables');
}

if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error('Stripe Publishable Key is not defined in environment variables');
}

export const env = {
  // Google Maps
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  
  // Firebase
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY as string,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID as string,
  
  // Stripe
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
  
  // Environment
  NODE_ENV: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;

// Type guard to check if environment variables are defined
Object.entries(env).forEach(([key, value]) => {
  if (value === undefined) {
    console.error(`Environment variable ${key} is not defined`);
  }
});
