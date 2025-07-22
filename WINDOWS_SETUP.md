# 🏛️ Temple Donation System - Windows Setup Guide

## Quick Start (Windows)

### Method 1: Automatic Setup
1. **Download** project files to your computer
2. **Right-click** on `setup-windows.bat` and select "Run as administrator"
3. **Follow** the on-screen instructions
4. **Update** database connection in `.env` file
5. **Run** `npm run dev` to start

### Method 2: PowerShell Setup
1. **Open** PowerShell as Administrator
2. **Navigate** to project folder: `cd C:\path\to\temple-donation-system`
3. **Run** setup script: `.\setup-windows.ps1`
4. **Follow** the instructions

---

## Manual Setup (Step by Step)

### Step 1: Install Prerequisites

#### Node.js (Required)
1. Go to https://nodejs.org/
2. Download **LTS version** (18.x or higher)
3. Run installer and follow defaults
4. Restart computer after installation

#### Git (Optional)
1. Download from https://git-scm.com/download/win
2. Install with default settings

### Step 2: Download Project
```powershell
# Option 1: Clone with Git
git clone <your-repository-url>
cd temple-donation-system

# Option 2: Download ZIP
# Download ZIP file from repository
# Extract to folder like C:\temple-donation-system
```

### Step 3: Install Dependencies
```powershell
# Open Command Prompt or PowerShell in project folder
npm install
```

### Step 4: Database Setup

#### Option A: Local PostgreSQL
1. **Download PostgreSQL**
   - Go to https://postgresql.org/download/windows/
   - Download latest version
   - Remember the password you set during installation

2. **Create Database**
   ```sql
   -- Open pgAdmin or SQL Shell
   CREATE DATABASE temple_donations;
   ```

3. **Update .env file**
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/temple_donations
   ```

#### Option B: Cloud Database (Easier)
1. **Create Neon Account**
   - Visit https://neon.tech
   - Sign up for free account
   - Create new project

2. **Get Connection String**
   - Copy the connection string
   - Update .env file with the connection string

### Step 5: Setup Database Schema
```powershell
npm run db:push
```

### Step 6: Run Application
```powershell
# Development mode (for testing)
npm run dev

# Production mode
npm run build
npm run start
```

### Step 7: Access Application
- Open browser: http://localhost:5000
- Login with admin credentials:
  - **Username**: templeadmin
  - **Password**: Temple@123

---

## Windows-Specific Notes

### Common Issues

#### 1. PowerShell Execution Policy
If you get execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. Path Issues
Always use forward slashes or double backslashes:
```powershell
cd "C:/temple-donation-system"
# or
cd "C:\\temple-donation-system"
```

#### 3. Port Already in Use
```powershell
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

#### 4. Node.js not recognized
- Restart Command Prompt/PowerShell
- Restart computer
- Reinstall Node.js

### File Structure
```
C:\temple-donation-system\
├── client\              # React frontend
├── server\              # Node.js backend
├── shared\              # Database schemas
├── dist\                # Built files (after build)
├── node_modules\        # Dependencies
├── package.json         # Project config
├── .env                 # Environment variables
├── setup-windows.bat    # Windows setup script
└── setup-windows.ps1    # PowerShell setup script
```

---

## Development Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Check TypeScript errors
npm run check

# Update database schema
npm run db:push

# Install new package
npm install package-name
```

---

## Hostinger Deployment from Windows

### Upload Files
1. **Build project**: `npm run build`
2. **Compress files**: Create ZIP with dist/, package.json, .env
3. **Upload to Hostinger**: Use File Manager or FTP
4. **Install dependencies**: SSH and run `npm install --production`
5. **Start application**: `node dist/index.js`

### Database Options for Hostinger
1. **Neon (Recommended)**: Keep using cloud database
2. **Hostinger MySQL**: Convert to MySQL (requires code changes)
3. **External PostgreSQL**: Use services like Supabase

---

## Backup & Maintenance

### Backup Database
```powershell
# Using pg_dump (if local PostgreSQL)
pg_dump temple_donations > backup.sql

# Restore backup
psql temple_donations < backup.sql
```

### Update Application
```powershell
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart server
# Ctrl+C to stop, then npm run start
```

---

## Getting Help

### Check Logs
```powershell
# View application logs
npm run dev

# Check Node.js version
node --version

# Check npm version
npm --version
```

### Common Solutions
1. **Delete node_modules**: `rmdir /s node_modules && npm install`
2. **Clear npm cache**: `npm cache clean --force`
3. **Reset database**: Drop and recreate database, run `npm run db:push`

### Contact Support
- Check project documentation
- Review error messages carefully
- Ensure all prerequisites are installed