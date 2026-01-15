# Git Setup Guide for Trinity Lodge

**Project**: Trinity Lodge Management System
**Date**: January 14, 2026

---

## Critical Files to NEVER Commit

### 🚨 SECURITY - NEVER COMMIT THESE:

1. **Database Files**
   - `trinity.db` - Contains ALL your customer data, bills, reservations
   - `*.db`, `*.sqlite` - Any database files
   - Reason: Contains sensitive customer information, PII

2. **Environment Files**
   - `.env` - May contain secrets, API keys, database credentials
   - `.env.local`, `.env.production` - Environment-specific secrets
   - Reason: Contains sensitive configuration

3. **Compiled Binaries**
   - `bin/trinity-backend.exe` - Your compiled backend
   - Any `.exe` files
   - Reason: Large files, platform-specific, should be built from source

4. **Dependencies**
   - `frontend/node_modules/` - 100,000+ files from npm packages
   - `vendor/` - Go dependencies (if using vendor mode)
   - Reason: Huge directory, can be reinstalled from package files

5. **Build Outputs**
   - `frontend/dist/` - Compiled frontend
   - `frontend/build/` - Build artifacts
   - Reason: Generated files, can be rebuilt

6. **IDE Files**
   - `.vscode/` - VSCode settings (might contain local paths)
   - `.idea/` - JetBrains IDE settings
   - Reason: Personal preferences, local paths

7. **Logs**
   - `*.log` - Application logs
   - May contain sensitive data
   - Reason: Can be large, may contain user data

8. **Temporary Files**
   - `.claude/` - Claude Code session data
   - `*.output` - Task output files
   - Reason: Session-specific, not needed in repo

---

## What SHOULD Be Committed

### ✅ Source Code
- `backend/**/*.go` - All Go source files
- `frontend/src/**/*.tsx`, `*.ts` - All React/TypeScript source
- `frontend/src/**/*.css` - Stylesheets

### ✅ Configuration Files
- `backend/go.mod` - Go dependencies manifest
- `backend/go.sum` - Go dependency checksums (**KEEP THIS**)
- `frontend/package.json` - npm dependencies manifest
- `frontend/package-lock.json` - npm dependency lock (**KEEP THIS**)
- `frontend/vite.config.ts` - Vite configuration
- `frontend/tsconfig.json` - TypeScript configuration

### ✅ Documentation
- `README.md` - Project documentation
- `Plan.md` - Project plan (if you want to share it)
- Any other `.md` files you want to track

### ✅ Git Files
- `.gitignore` - This file!
- `.gitattributes` - Git attributes (if needed)

### ✅ Public Assets
- `frontend/public/**/*` - Images, icons, static files
- `frontend/index.html` - Entry HTML

---

## Pre-Commit Checklist

Before running `git add .`, verify:

### 1. Check What Will Be Added
```bash
git status
```

Look for these red flags:
- ❌ `trinity.db` or any `.db` files
- ❌ `bin/` directory
- ❌ `frontend/node_modules/`
- ❌ `.env` files
- ❌ `*.log` files

### 2. Check File Sizes
```bash
# Windows PowerShell
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 10MB} | Select-Object FullName, @{Name="Size(MB)";Expression={$_.Length / 1MB}}
```

Large files that shouldn't be committed:
- Database files (can be 10MB+)
- Compiled binaries
- node_modules (can be 100MB+)

### 3. Verify Sensitive Data
Check these files don't have secrets:
```bash
# Search for common secret patterns
grep -r "password" --include="*.go" --include="*.ts"
grep -r "api_key" --include="*.go" --include="*.ts"
grep -r "secret" --include="*.go" --include="*.ts"
```

---

## Recommended Git Workflow

### Initial Setup

```bash
# 1. Initialize Git repository
cd d:/Trinity
git init

# 2. Verify .gitignore is in place
cat .gitignore

# 3. Add all files (respecting .gitignore)
git add .

# 4. Check what's staged (IMPORTANT!)
git status

# 5. Review staged files
git diff --cached --name-only

# 6. If everything looks good, commit
git commit -m "Initial commit: Trinity Lodge Management System

- Go backend with SQLite database
- React frontend with TypeScript
- Full reservation and billing system
- Dashboard with analytics
"

# 7. Add remote repository (GitHub/GitLab)
git remote add origin <your-repo-url>

# 8. Push to remote
git push -u origin main
```

### Daily Workflow

```bash
# 1. Check status
git status

# 2. Add specific files or all files
git add .

# 3. Commit with meaningful message
git commit -m "Add Bills page with filtering"

# 4. Push to remote
git push
```

---

## .gitignore Breakdown

### Database Files (Lines 7-12)
```gitignore
*.db
*.db-shm
*.db-wal
*.sqlite
*.sqlite3
```
**Why**: Contains customer data, reservations, bills - sensitive information

### Go Backend (Lines 17-35)
```gitignore
*.exe
bin/
vendor/
```
**Why**: Compiled binaries are platform-specific and large

### Frontend (Lines 40-61)
```gitignore
node_modules/
frontend/dist/
.env
```
**Why**:
- node_modules: 100,000+ files, huge directory
- dist: Generated build output
- .env: May contain API keys, secrets

### IDE Files (Lines 66-88)
```gitignore
.vscode/
.idea/
```
**Why**: Personal editor settings, local paths

### Logs (Lines 113-118)
```gitignore
*.log
npm-debug.log*
```
**Why**: Can contain sensitive data, grow large

### Claude Code (Lines 142-145)
```gitignore
.claude/
*.output
```
**Why**: Session-specific data, not needed in repo

### Security (Lines 150-161)
```gitignore
*.key
*.pem
credentials.json
```
**Why**: **CRITICAL** - These are secret files that should NEVER be committed

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Committing Database
```bash
# DON'T DO THIS:
git add trinity.db
```
**Fix**: Remove from staging
```bash
git reset trinity.db
```

### ❌ Mistake 2: Committing node_modules
```bash
# If you accidentally staged it:
git reset frontend/node_modules
```

### ❌ Mistake 3: Committing .env with secrets
```bash
# If already committed, remove from history:
git rm --cached .env
git commit -m "Remove .env from repo"
```

### ❌ Mistake 4: Committing binary files
```bash
# Remove large files from staging:
git reset bin/trinity-backend.exe
```

---

## Cleaning Up If You Made a Mistake

### If You Committed Sensitive Files (Before Push)

```bash
# 1. Remove file from last commit but keep locally
git rm --cached trinity.db
git rm --cached .env

# 2. Commit the removal
git commit --amend -m "Initial commit (remove sensitive files)"

# 3. Verify it's gone
git log --stat
```

### If You Already Pushed Sensitive Files

**⚠️ WARNING**: This rewrites history. Coordinate with team.

```bash
# 1. Remove from history using BFG or git-filter-repo
# Install BFG: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Clone a fresh copy
git clone <repo-url> trinity-clean

# 3. Remove sensitive files from history
bfg --delete-files trinity.db trinity-clean/

# 4. Clean up
cd trinity-clean
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (WARNING: Rewrites history)
git push --force
```

---

## GitHub/GitLab Setup

### Create Repository

**GitHub**:
1. Go to https://github.com/new
2. Repository name: `trinity-lodge`
3. Description: "Hotel management system with Go backend and React frontend"
4. **Private** (recommended - contains business logic)
5. **Don't** initialize with README (you already have one)
6. Create repository

**Commands**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/trinity-lodge.git
git branch -M main
git push -u origin main
```

### Repository Settings

**Recommended**:
- ✅ Make repository **Private** (sensitive business logic)
- ✅ Enable "Require pull request reviews" (if working with team)
- ✅ Add `.gitattributes` for line ending consistency
- ✅ Add branch protection rules for `main`

---

## .gitattributes (Optional but Recommended)

Create `d:/Trinity/.gitattributes`:

```gitattributes
# Auto detect text files and perform LF normalization
* text=auto

# Go files
*.go text eol=lf

# TypeScript/JavaScript
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.json text eol=lf

# Shell scripts
*.sh text eol=lf

# Windows scripts
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# Binary files
*.exe binary
*.dll binary
*.so binary
*.dylib binary
*.db binary
*.sqlite binary
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.pdf binary
```

This ensures consistent line endings across different operating systems.

---

## File Size Considerations

### GitHub Limits
- **File size**: 100 MB hard limit
- **Repository size**: 5 GB recommended limit
- **Warning**: Files over 50 MB

### What to Check
```bash
# Find large files (>10MB)
find . -type f -size +10M -not -path "*/node_modules/*" -not -path "*/.git/*"

# Windows PowerShell
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 10MB -and $_.FullName -notmatch "node_modules"} | Select-Object FullName
```

**Large files that shouldn't be committed**:
- `trinity.db` (grows with data)
- `bin/trinity-backend.exe` (compiled binary)
- `frontend/node_modules/` (if not ignored properly)

---

## Environment Variables Setup

Instead of committing `.env`, provide a template:

**Create `.env.example`** (this CAN be committed):
```env
# Backend Configuration
SERVER_PORT=8080
DATABASE_PATH=./trinity.db

# JWT Secret (generate a strong random string)
JWT_SECRET=your-secret-key-here

# Frontend Configuration (if needed)
VITE_API_URL=http://localhost:8080

# DO NOT commit the actual .env file!
# Copy this file to .env and fill in real values
```

**Commit this**:
```bash
git add .env.example
git commit -m "Add environment variables template"
```

**Team members create their own `.env`**:
```bash
cp .env.example .env
# Edit .env with actual values (never commit this)
```

---

## README for Your Repository

Create a good `README.md`:

```markdown
# Trinity Lodge Management System

Hotel management system with Go backend and React frontend.

## Features
- Customer management
- Room reservations
- Billing system
- Dashboard analytics

## Setup

### Backend
\`\`\`bash
cd backend
go mod download
go build -o ../bin/trinity-backend.exe ./cmd/server
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Environment
Copy `.env.example` to `.env` and configure:
\`\`\`bash
cp .env.example .env
\`\`\`

## Tech Stack
- Backend: Go, Gin, GORM, SQLite
- Frontend: React, TypeScript, Vite, Tailwind CSS
```

---

## Summary Checklist

Before your first push:

- [x] `.gitignore` is comprehensive and in place
- [ ] No database files in `git status`
- [ ] No `.env` files in `git status`
- [ ] No `node_modules/` in `git status`
- [ ] No compiled binaries (`*.exe`) in `git status`
- [ ] No sensitive data in any committed files
- [ ] Created `.env.example` for team
- [ ] Repository is set to **Private** (recommended)
- [ ] Reviewed all files with `git diff --cached`

**Safe to push**: ✅

---

## Quick Reference

```bash
# Check what will be committed
git status

# See ignored files
git status --ignored

# Check file sizes
git ls-files | xargs -I{} du -sh {}

# Verify no secrets
git diff --cached | grep -i "password\|secret\|key"

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Remove file from Git but keep locally
git rm --cached <file>
```

---

**Status**: Ready for Git! 🚀

Your `.gitignore` is now comprehensive and production-ready.
