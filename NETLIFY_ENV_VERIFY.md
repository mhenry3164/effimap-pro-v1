# Netlify Environment Variables Verification

Go to Netlify > Site settings > Environment variables and verify these exact values:

```bash
# Google Maps API Key (Required)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyB-614xoquXWTIUgVJCMgHvIrSdIPpFlEg

# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=AIzaSyDwWtipHZYlNIzfHRrAq-7sM8Aniju7beA
VITE_FIREBASE_AUTH_DOMAIN=hmi-territory-mapping-tool.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hmi-territory-mapping-tool
VITE_FIREBASE_STORAGE_BUCKET=hmi-territory-mapping-tool.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=111564690259
VITE_FIREBASE_APP_ID=1:111564690259:web:40235bd7ad81dfee7687a6
VITE_FIREBASE_MEASUREMENT_ID=G-LQKV8KH8XK

# Build Configuration (Required)
NODE_ENV=production
CI=false
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
NODE_VERSION=18

# Firebase Project Settings (Required)
FIREBASE_PROJECT_ID=hmi-territory-mapping-tool
FIREBASE_REGION=us-central1
```

After verifying:
1. Make sure all variables match exactly
2. Click "Clear build cache" under Deploys
3. Trigger a new deploy

Important: The Google Maps API key must be exactly correct and the domain must be authorized in Google Cloud Console.
