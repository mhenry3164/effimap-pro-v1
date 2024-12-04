# Netlify Build Settings Configuration

## Basic Build Settings
- Base directory: (leave empty)
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `functions`

## Branch Settings
- Production branch: `main`
- Deploy contexts: All deploys from main branch

## Advanced Build Settings
- Build image: Ubuntu Focal 20.04 (default)
- NodeJS version: 18.x (set via environment variable)

## Important Notes:
1. The base directory should be empty since your project is in the root
2. The publish directory must be `dist` as that's where Vite builds to
3. Functions directory should be set to `functions` for Firebase functions
4. Make sure the build command matches your package.json script

Your current settings look correct for build command and publish directory. Just ensure the base directory is empty and functions directory is set to `functions`.
