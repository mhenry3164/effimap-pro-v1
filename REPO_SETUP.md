# Creating Fresh Repository for EffiMap Pro

## Step 1: Create New Directory
```bash
mkdir effimap-pro-v1
cd effimap-pro-v1
```

## Step 2: Copy Essential Files
Copy these directories and files from your current project:
```
src/
public/
functions/
```

And these config files:
```
package.json
vite.config.ts
tailwind.config.js
postcss.config.js
tsconfig.json
.gitignore
netlify.toml
.env.example
README.md
NETLIFY_SETUP.md
```

## Step 3: Initialize New Repository
```bash
npm install
git init
git add .
git commit -m "Initial commit: EffiMap Pro V1"
```

## Step 4: Create .env File
Copy .env.example to .env and add your environment variables:
```bash
cp .env.example .env
```

## Step 5: Test Locally
```bash
npm run dev
```

## Step 6: Push to GitHub
1. Create new repository on GitHub
2. Push your code:
```bash
git remote add origin [new-repo-url]
git branch -M main
git push -u origin main
```

## Step 7: Deploy
Follow NETLIFY_SETUP.md for deployment instructions

Note: This creates a clean repository with only the necessary files, making it easier to manage and deploy.
