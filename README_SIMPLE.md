# 🏛️ Temple Donation Management System

## Windows Setup (மிக எளிமையான வழி)

### 1. Prerequisites Install செய்யுங்கள்
- **Node.js** download செய்யுங்கள்: https://nodejs.org/ (LTS version)
- Install செய்த பிறகு computer restart செய்யுங்கள்

### 2. Project Download
- Project files-ஐ ZIP format-ல் download செய்யுங்கள்
- Extract செய்து folder-ஐ திறங்கள்

### 3. Automatic Setup
- **setup-windows.bat** file-ஐ right-click செய்யுங்கள்
- **"Run as administrator"** select செய்யுங்கள்
- Instructions follow செய்யுங்கள்

### 4. Database Setup
**Option 1: Cloud Database (எளிதான வழி)**
- https://neon.tech-ல் free account உருவாக்குங்கள்
- Database create செய்யுங்கள்
- Connection string copy செய்து .env file-ல் paste செய்யுங்கள்

**Option 2: Local Database**
- PostgreSQL download: https://postgresql.org/download/windows/
- Install செய்து database create செய்யுங்கள்

### 5. Start Application
```
npm run dev
```

### 6. Access
- Browser-ல் திறங்கள்: http://localhost:5000
- Admin login:
  - Username: **templeadmin**
  - Password: **Temple@123**

---

## Commands (Windows Command Prompt-ல்)

```bash
# Dependencies install
npm install

# Development server start
npm run dev

# Production build
npm run build

# Production server start  
npm run start

# Database setup
npm run db:push
```

---

## Folder Structure
```
temple-donation-system/
├── client/              # முன்பக்க code (React)
├── server/              # பின்பக்க code (Node.js)  
├── shared/              # Database models
├── package.json         # Dependencies list
├── .env                 # Database connection
└── setup-windows.bat    # Windows setup script
```

---

## Features
✅ Donation entry with receipt generation  
✅ Donor search by phone number  
✅ Tamil/English language support  
✅ Dashboard with statistics  
✅ CSV/Excel import functionality  
✅ Admin panel with secure login  
✅ Print-ready receipts  

---

## Troubleshooting

**Error: Node.js not found**
- Node.js install செய்யுங்கள் மற்றும் restart செய்யுங்கள்

**Error: Port 5000 already in use**
- Command Prompt-ல்: `netstat -ano | findstr :5000`
- Process kill: `taskkill /PID <process_id> /F`

**Database connection error**
- .env file-ல் DATABASE_URL correct-ஆ உள்ளதா check செய்யுங்கள்

---

## Production Deployment (Hostinger)

1. **Build project**: `npm run build`
2. **Upload files**: dist folder, package.json, .env
3. **Install dependencies**: `npm install --production`
4. **Start server**: `node dist/index.js`

Database: Neon cloud database-ஐ production-லும் use செய்யலாம்