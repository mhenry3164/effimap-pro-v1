# Creating New Repository for EffiMap Pro

## Step 1: Configure Git (Run these first)
```bash
git config --global core.autocrlf false
git config --global core.eol lf
```

## Step 2: Remove Old Git History
```bash
rm -rf .git
```

## Step 3: Create New Repository
1. Go to GitHub
2. Create new repository named 'effimap-pro'
3. Don't initialize with README, license, or .gitignore

## Step 4: Initialize New Repository (Run these commands in order)
```bash
# Initialize new repository
git init

# Add all files with proper line endings
git add .

# Create initial commit
git commit -m "feat: initial commit - EffiMap Pro V1"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/effimap-pro.git

# Set main branch and push
git branch -M main
git push -u origin main
```

## Step 5: Verify
1. Check GitHub repository to ensure all files are uploaded
2. Verify no line ending warnings in git status
3. Check that .gitattributes is present

## Step 6: Deploy
1. Log into Netlify
2. Choose "Import from Git"
3. Select your new repository
4. Follow NETLIFY_SETUP.md for configuration

Need any of these steps clarified?
