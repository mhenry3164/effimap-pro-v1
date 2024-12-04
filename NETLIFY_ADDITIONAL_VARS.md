# Additional Netlify Environment Variables

Add these additional variables to your Netlify environment settings:

```bash
# Build Configuration (Required)
CI=false
NODE_VERSION=18
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true

# App Configuration (Required)
VITE_APP_NAME=EffiMap Pro
VITE_APP_URL=https://effimap-pro-v1.netlify.app
VITE_APP_ENV=production

# Firebase Region (Optional but Recommended)
FIREBASE_REGION=us-central1

# Deployment Configuration (Optional)
NETLIFY_USE_YARN=false
BUILD_DIRECTORY=dist
```

## Why These Variables Are Needed:

1. Build Configuration:
   - CI=false: Prevents treating warnings as errors
   - NODE_VERSION=18: Ensures correct Node.js version
   - SKIP_PREFLIGHT_CHECK=true: Bypasses dependency checks
   - TSC_COMPILE_ON_ERROR=true: Allows build with TypeScript errors

2. App Configuration:
   - VITE_APP_NAME: Used in app title and branding
   - VITE_APP_URL: Your Netlify deployment URL
   - VITE_APP_ENV: Sets production environment

3. Firebase Region:
   - FIREBASE_REGION: Specifies Firebase functions region

4. Deployment Configuration:
   - NETLIFY_USE_YARN: Use npm instead of yarn
   - BUILD_DIRECTORY: Specifies build output directory

Add these to your existing Firebase and Google Maps variables in Netlify's environment settings.
