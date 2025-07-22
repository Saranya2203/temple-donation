@echo off
title Temple Donation System - Windows Setup

echo 🏛️ Temple Donation System - Windows Setup
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first
    echo Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please reinstall Node.js
    pause
    exit /b 1
)

echo ✅ npm detected: 
npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Create environment file if it doesn't exist
if not exist .env (
    echo ⚙️ Creating environment file...
    (
        echo # Database Configuration
        echo DATABASE_URL=postgresql://localhost:5432/temple_donations
        echo.
        echo # Application Configuration  
        echo NODE_ENV=development
        echo PORT=5000
        echo.
        echo # Session Secret ^(change this in production^)
        echo SESSION_SECRET=your-secret-key-here
    ) > .env
    echo ✅ Environment file created ^(.env^)
    echo ⚠️  Please update DATABASE_URL in .env file with your database connection
) else (
    echo ✅ Environment file already exists
)

echo.
echo 🗄️ Database Setup Options:
echo Option 1 - Local PostgreSQL:
echo   1. Download PostgreSQL from https://postgresql.org/download/windows/
echo   2. Install and setup PostgreSQL
echo   3. Create database using pgAdmin or command line
echo   4. Update DATABASE_URL in .env file
echo.
echo Option 2 - Cloud Database ^(Neon^):
echo   1. Visit https://neon.tech
echo   2. Create free account and database
echo   3. Copy connection string to .env file
echo.

REM Test database connection
echo 🔗 Testing database connection...
npm run db:push >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database connection successful
) else (
    echo ⚠️  Database connection failed - please setup database first
)

echo.
echo 🚀 Setup Complete!
echo.
echo To start the application:
echo   npm run dev     # Development mode
echo   npm run build   # Build for production  
echo   npm run start   # Production mode
echo.
echo Access the app at: http://localhost:5000
echo.
echo Admin Credentials:
echo   Username: templeadmin
echo   Password: Temple@123
echo.
echo Press any key to continue...
pause >nul