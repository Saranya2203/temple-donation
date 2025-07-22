# Temple Donation System - Local & Hostinger Deployment Guide

## Local Development Setup

### Prerequisites
```bash
# Install Node.js 20+
# Install Git
# Have a code editor (VS Code recommended)
```

### Step 1: Download Code
```bash
# Clone from Replit or download project files
git clone <your-repo-url>
cd temple-donation-system

# Or download ZIP file and extract
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup (Local)
```bash
# Option 1: Use local PostgreSQL
# Install PostgreSQL locally
# Create database
createdb temple_donations

# Set DATABASE_URL in .env file
echo "DATABASE_URL=postgresql://username:password@localhost:5432/temple_donations" > .env

# Option 2: Use Neon (cloud database)
# Go to neon.tech, create free database
# Copy connection string to .env file
echo "DATABASE_URL=your_neon_connection_string" > .env
```

### Step 4: Setup Database Schema
```bash
npm run db:push
```

### Step 5: Run Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```

### Access Local App
- Open browser: http://localhost:5000
- Admin login credentials are in server/admin-credentials.ts

---

## Hostinger Deployment

### Method 1: Using Hostinger's Node.js Hosting

#### Step 1: Prepare Files
```bash
# Build the application
npm run build

# Create deployment package
# Include: dist/, package.json, package-lock.json, .env
```

#### Step 2: Upload to Hostinger
1. Login to Hostinger control panel
2. Go to File Manager
3. Upload your project files to public_html or domains folder
4. Extract if uploaded as ZIP

#### Step 3: Install Dependencies on Hostinger
```bash
# SSH into Hostinger server
npm install --production
```

#### Step 4: Environment Variables
```bash
# Create .env file on server
DATABASE_URL=your_production_database_url
NODE_ENV=production
```

#### Step 5: Start Application
```bash
# Start with PM2 (recommended)
npm install -g pm2
pm2 start dist/index.js --name "temple-app"

# Or start directly
node dist/index.js
```

### Method 2: Using Hostinger's Web Hosting (Static Files)

#### Step 1: Build for Static Hosting
```bash
# Modify for static hosting (requires changes)
npm run build
```

#### Step 2: Upload Static Files
1. Upload dist/ folder contents to public_html
2. Setup .htaccess for routing
3. Use external database service

---

## Database Options for Production

### Option 1: Neon (Recommended)
- Free tier available
- PostgreSQL compatible
- No server maintenance
- Get connection string from neon.tech

### Option 2: Hostinger MySQL
- Convert PostgreSQL queries to MySQL
- Update drizzle config for MySQL
- Use Hostinger's database panel

### Option 3: External PostgreSQL
- Use services like ElephantSQL, Supabase
- Get connection string
- Update .env file

---

## Environment Configuration

### Local .env file
```env
DATABASE_URL=postgresql://localhost:5432/temple_donations
NODE_ENV=development
```

### Production .env file
```env
DATABASE_URL=your_production_database_url
NODE_ENV=production
PORT=5000
```

---

## File Structure for Deployment

```
temple-donation-system/
├── dist/                 # Built files (after npm run build)
├── client/              # React frontend source
├── server/              # Node.js backend source
├── shared/              # Shared types/schemas
├── package.json         # Dependencies
├── .env                 # Environment variables
├── drizzle.config.ts    # Database config
└── README.md
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Ensure database exists
   - Check firewall/network access

2. **Module Not Found**
   - Run `npm install`
   - Check Node.js version (need 18+)

3. **Port Already in Use**
   - Change PORT in .env
   - Kill existing processes

4. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run check`

### Hostinger Specific

1. **File Permissions**
   - Set correct permissions: `chmod 755 dist/`

2. **Node.js Version**
   - Check Hostinger's supported Node.js versions
   - Use .nvmrc file if supported

3. **Memory Limits**
   - Optimize build for lower memory usage
   - Use Hostinger's higher tier plans if needed

---

## Maintenance

### Updating Code
```bash
# Local
git pull origin main
npm install
npm run build
npm run start

# Production
# Upload new files
# Restart application
pm2 restart temple-app
```

### Database Migrations
```bash
# After schema changes
npm run db:push
```

### Backup
```bash
# Database backup
pg_dump $DATABASE_URL > backup.sql

# File backup
tar -czf temple-app-backup.tar.gz dist/ package.json .env
```