# Git Commands for Clean Repository Push

## Option 1: Update Existing Repository

```bash
# 1. Configure Git for line endings
git config --global core.autocrlf false
git config --global core.eol lf

# 2. Reset and clean the repository
git rm -rf --cached .
git reset --hard
git clean -fdx

# 3. Add all files with new line endings
git add .
git commit -m "refactor: complete codebase update with proper line endings"

# 4. Force push to override old repository
git push origin main --force
```

## Option 2: Create New Repository

```bash
# 1. Configure Git for line endings
git config --global core.autocrlf false
git config --global core.eol lf

# 2. Remove old Git history
rm -rf .git

# 3. Initialize new repository
git init
git add .
git commit -m "feat: initial commit - EffiMap Pro V1"

# 4. Add new remote and push
git remote add origin https://github.com/yourusername/effimap-pro.git
git branch -M main
git push -u origin main
```

## Troubleshooting

If you get permission errors:
```bash
# Verify remote URL
git remote -v

# Update remote URL if needed (HTTPS)
git remote set-url origin https://github.com/yourusername/effimap-pro.git

# Or with SSH
git remote set-url origin git@github.com:yourusername/effimap-pro.git
```

If you get line ending warnings after push:
```bash
# Normalize all line endings in repository
git add . --renormalize
git commit -m "chore: normalize line endings"
git push
```

## After Successful Push

1. Verify files on GitHub
2. Connect repository to Netlify
3. Set up environment variables in Netlify
4. Deploy!

Note: The force push in Option 1 will overwrite the remote repository's history. Make sure you want to do this before proceeding.
