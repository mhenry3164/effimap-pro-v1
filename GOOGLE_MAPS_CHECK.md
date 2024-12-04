# Google Maps API Key Checklist

1. Verify API Key Configuration:
   - Current key in use: AIzaSyB-614xoquXWTIUgVJCMgHvIrSdIPpFlEg
   - Environment variable name: VITE_GOOGLE_MAPS_API_KEY

2. Required API Services:
   Make sure these services are enabled in Google Cloud Console:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Maps Embed API
   - Drawing API
   - Geometry Library
   - Visualization Library

3. API Key Restrictions:
   Check these settings in Google Cloud Console:
   - Application restrictions:
     * Set to "HTTP referrers (websites)"
     * Add your Netlify domains:
       - https://effimap-pro-v1.netlify.app/*
       - https://*.netlify.app/*
       - http://localhost:*
   - API restrictions:
     * Enable all required APIs listed above

4. Billing:
   - Ensure billing is enabled on your Google Cloud Project
   - Check if you're within free tier limits or have billing set up

To fix the "For development purposes only" watermark:
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your API key
4. Add the website restrictions mentioned above
5. Enable all required APIs
6. Ensure billing is set up
