# Netlify Deployment Guide for EffiMap Pro

## Build Settings

1. In your Netlify dashboard, set the following build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

## Environment Variables

Add the following environment variables in Netlify (Site settings > Build & deploy > Environment):

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Google Maps Configuration
```
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```
Important: Ensure your Google Maps API key has these APIs enabled:
- Maps JavaScript API
- Places API
- Geocoding API
- Visualization API

### Build Environment Variables
```
CI=false
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
```

## Domain and HTTPS Settings

1. Set up your custom domain in Netlify:
   - Site settings > Domain management > Add custom domain
   - Enable HTTPS (Netlify handles this automatically)

2. Update your Firebase Authentication settings:
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add your Netlify domain (both netlify.app and custom domain if used)

## Functions Configuration

If using Netlify Functions with Firebase Admin:

1. Add Firebase Admin credentials:
   ```
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
   FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
   ```

2. Add function configurations in netlify.toml:
   ```toml
   [functions]
   directory = "functions"
   node_bundler = "esbuild"
   ```

## Post-Deployment Checks

After deploying, verify:
1. Firebase Authentication works
2. Google Maps loads correctly
3. Real-time updates work
4. File uploads function properly
5. Heat map visualization works

## Troubleshooting

Common issues and solutions:

1. **Blank Page After Deploy**
   - Check if all environment variables are set
   - Verify Firebase configuration
   - Check browser console for errors

2. **Google Maps Not Loading**
   - Verify API key is correct
   - Check if all required APIs are enabled
   - Verify domain is authorized

3. **Authentication Issues**
   - Verify Firebase Auth domain settings
   - Check if the correct Firebase project is linked
   - Verify environment variables are properly set

4. **Build Failures**
   - Check build logs for specific errors
   - Verify Node version is set to 18
   - Ensure all dependencies are properly installed

## Security Headers

The following security headers are automatically set via netlify.toml:
- Content-Security-Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## Performance Optimization

Enable the following Netlify features:
1. Asset Optimization
2. Prerendering
3. Caching headers
4. Brotli compression
