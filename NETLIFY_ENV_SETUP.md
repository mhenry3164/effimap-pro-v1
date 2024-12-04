# Netlify Environment Variables Setup

Copy and paste these environment variables into your Netlify site's environment variables section (Site settings > Build & deploy > Environment):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=effimap-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=effimap-pro
VITE_FIREBASE_STORAGE_BUCKET=effimap-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXXX
VITE_FIREBASE_APP_ID=1:XXXXXXXXXXXX:web:XXXXXXXXXXXX

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# App Configuration
VITE_APP_NAME=EffiMap Pro
VITE_APP_URL=https://effimap-pro-v1.netlify.app
VITE_APP_ENV=production

# Build Configuration
CI=false
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
NODE_VERSION=18
```

## Important Notes:

1. Replace the X's with your actual Firebase configuration values from your Firebase Console
2. Replace the Google Maps API key with your actual key
3. Update VITE_APP_URL to match your Netlify domain
4. All variables must be added exactly as shown (including the VITE_ prefix)
5. Do not use quotes around the values
6. Make sure there are no spaces around the = sign

## Steps:

1. Go to Netlify Dashboard
2. Select your site
3. Go to Site settings > Build & deploy > Environment
4. Click "Edit variables"
5. Add each variable one by one
6. Click "Save"
7. Trigger a new deploy

## Verification:

After adding the variables:
1. Go to Deploys
2. Click "Trigger deploy" > "Clear cache and deploy site"
3. Watch the deploy logs to ensure all environment variables are being read correctly
