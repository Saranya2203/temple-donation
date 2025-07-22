# 🚀 Hostinger Upload Guide - Temple Donation System

## Step-by-Step Hostinger Upload Process

### Phase 1: Prepare Files for Upload

#### 1. Build Project Locally
```bash
# Local computer-ல் project folder-ல் இந்த commands run செய்யுங்கள்
npm run build
```

#### 2. Create Upload Package
உங்கள் project folder-ல் இந்த files மட்டும் தேவை:

**Essential Files for Hostinger:**
```
hostinger-upload/
├── dist/                    # Built application files
│   ├── index.js            # Main server file
│   └── assets/             # CSS, JS, images
├── package.json            # Dependencies list
├── package-lock.json       # Exact dependency versions
├── .env                    # Environment variables
└── node_modules/           # (Will install on server)
```

#### 3. Create .env File for Production
```env
# Production environment variables
DATABASE_URL=your_neon_database_connection_string
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-production-secret-key-here
```

---

### Phase 2: Upload to Hostinger

#### Option A: Using Hostinger File Manager (Recommended)

1. **Login to Hostinger**
   - Go to https://hostinger.com
   - Login to your account
   - Go to Hosting → Manage

2. **Open File Manager**
   - Click "File Manager" in control panel
   - Navigate to your domain folder (usually `public_html` or `domains/yourdomain.com/public_html`)

3. **Upload Files**
   - Click "Upload" button
   - Select your project files or ZIP file
   - Upload to root directory

4. **Extract Files (if ZIP)**
   - Right-click ZIP file
   - Select "Extract"
   - Extract to current directory

#### Option B: Using FTP Client (Advanced)

1. **Get FTP Credentials**
   - Hostinger control panel → FTP Accounts
   - Create or use existing FTP account

2. **Upload via FileZilla/WinSCP**
   ```
   Host: ftp.yourdomain.com
   Username: your_ftp_username
   Password: your_ftp_password
   Port: 21
   ```

---

### Phase 3: Server Setup on Hostinger

#### 1. Access SSH Terminal
- Hostinger control panel → Advanced → SSH Access
- Open terminal or use web-based SSH

#### 2. Navigate to Project Directory
```bash
cd domains/yourdomain.com/public_html
# or
cd public_html
```

#### 3. Check Node.js Version
```bash
node --version
npm --version
```

#### 4. Install Dependencies
```bash
# Install production dependencies only
npm install --production

# If error occurs, try:
npm install --legacy-peer-deps --production
```

#### 5. Setup Environment Variables
```bash
# Check if .env file exists
cat .env

# Edit if needed
nano .env
```

---

### Phase 4: Start Application

#### Method 1: Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start dist/index.js --name "temple-app"

# Check status
pm2 status

# View logs
pm2 logs temple-app

# Restart if needed
pm2 restart temple-app
```

#### Method 2: Direct Node.js
```bash
# Start application
node dist/index.js

# Run in background
nohup node dist/index.js &
```

#### Method 3: Using package.json script
```bash
npm run start
```

---

### Phase 5: Domain Configuration

#### 1. Check Application Port
- Your app runs on port 3000 or 5000
- Hostinger usually maps to port 80/443

#### 2. Setup Reverse Proxy (if needed)
Create `.htaccess` file in public_html:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

#### 3. SSL Certificate
- Hostinger control panel → SSL
- Enable free SSL certificate

---

## File Structure on Hostinger Server

```
public_html/
├── dist/
│   ├── index.js           # Main server file
│   └── assets/           # Static files
├── node_modules/         # Dependencies (after npm install)
├── package.json          # Project config
├── package-lock.json     # Lock file
├── .env                  # Environment variables
├── .htaccess            # Apache config (if needed)
└── uploads/             # File uploads (created automatically)
```

---

## Database Setup Options

### Option 1: Keep Neon Database (Recommended)
- No changes needed
- Your existing Neon connection string works
- Free and reliable

### Option 2: Hostinger MySQL Database
```bash
# Install MySQL adapter
npm install mysql2

# Update drizzle config for MySQL
# Modify shared/schema.ts for MySQL syntax
```

### Option 3: External PostgreSQL
- Use Supabase, ElephantSQL, or other providers
- Update DATABASE_URL in .env

---

## Testing and Verification

### 1. Check Application Status
```bash
# Check if app is running
ps aux | grep node

# Check port usage
netstat -tulpn | grep :3000
```

### 2. Test Application
```bash
# Test local connection
curl http://localhost:3000

# Check logs
pm2 logs temple-app
# or
tail -f nohup.out
```

### 3. Access from Browser
- Visit your domain: `https://yourdomain.com`
- Test admin login
- Test donation entry

---

## Common Hostinger Issues & Solutions

### Issue 1: Node.js Version
```bash
# Check available Node.js versions
ls /opt/alt/

# Use specific version (if available)
/opt/alt/nodejs18/bin/node --version
```

### Issue 2: Permission Errors
```bash
# Fix file permissions
chmod 755 dist/
chmod 644 dist/index.js
chmod 600 .env
```

### Issue 3: Memory Limits
```bash
# Check memory usage
free -h

# Optimize for low memory
export NODE_OPTIONS="--max-old-space-size=512"
```

### Issue 4: Port Conflicts
```bash
# Find and kill conflicting processes
lsof -i :3000
kill -9 <PID>
```

---

## Maintenance Commands

### Update Application
```bash
# Stop application
pm2 stop temple-app

# Upload new files
# Replace dist/ folder

# Restart application
pm2 restart temple-app
```

### Backup Data
```bash
# Backup database (if using local DB)
mysqldump -u username -p database_name > backup.sql

# Backup files
tar -czf temple-app-backup.tar.gz dist/ package.json .env
```

### Monitor Application
```bash
# View real-time logs
pm2 logs temple-app --lines 100

# Check memory/CPU usage
pm2 monit
```

---

## Quick Checklist

✅ **Build locally**: `npm run build`  
✅ **Upload dist/, package.json, .env to Hostinger**  
✅ **SSH into server**  
✅ **Run `npm install --production`**  
✅ **Start with PM2**: `pm2 start dist/index.js --name temple-app`  
✅ **Test domain access**  
✅ **Verify admin login works**  
✅ **Test donation entry**  
✅ **Check database connection**  

## Support

### Hostinger Support
- Live chat available 24/7
- Knowledge base: https://support.hostinger.com
- Submit ticket for technical issues

### Application Support
- Check PM2 logs for errors
- Verify database connection
- Test API endpoints manually