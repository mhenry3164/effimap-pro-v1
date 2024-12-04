# Netlify Environment Variables - PRIVATE COPY

Copy and paste these pre-filled environment variables into Netlify (Site settings > Build & deploy > Environment):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDwWtipHZYlNIzfHRrAq-7sM8Aniju7beA
VITE_FIREBASE_AUTH_DOMAIN=hmi-territory-mapping-tool.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hmi-territory-mapping-tool
VITE_FIREBASE_STORAGE_BUCKET=hmi-territory-mapping-tool.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=111564690259
VITE_FIREBASE_APP_ID=1:111564690259:web:40235bd7ad81dfee7687a6
VITE_FIREBASE_MEASUREMENT_ID=G-LQKV8KH8XK

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaSyB-614xoquXWTIUgVJCMgHvIrSdIPpFlEg

# App Configuration
VITE_APP_NAME=EffiMap Pro
VITE_APP_URL=https://effimap-pro-v1.netlify.app
VITE_APP_ENV=production

# Firebase Project Settings
FIREBASE_PROJECT_ID=hmi-territory-mapping-tool
FIREBASE_REGION=us-central1

# Build Configuration
CI=false
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
NODE_VERSION=18

# ⚠️ IMPORTANT: Keep this file private and never commit it to Git!
# These values should only be used in your Netlify environment settings.
```

## Steps:

1. Go to Netlify Dashboard
2. Select your site
3. Go to Site settings > Build & deploy > Environment
4. Click "Edit variables"
5. Add each variable exactly as shown above
6. Click "Save"
7. Trigger a new deploy: Deploy > Clear cache and deploy site

Note: This file contains your actual API keys and should be kept private. Do not commit this file to Git or share it publicly.
