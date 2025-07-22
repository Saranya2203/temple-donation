@echo off
title Temple Donation System - Production Mode

echo 🚀 Starting Temple Donation System in Production Mode
echo ====================================================
echo.

REM Check if dist folder exists (built application)
if not exist "dist" (
    echo ❌ dist folder not found. Please build the application first.
    echo Run: npm run build
    echo.
    pause
    exit /b 1
)

REM Check if index.js exists in dist
if not exist "dist\index.js" (
    echo ❌ dist\index.js not found. Please build the application first.
    echo Run: npm run build
    echo.
    pause
    exit /b 1
)

echo ✅ Built application found
echo.

REM Set environment variables for Windows
set NODE_ENV=production
set PORT=5000

echo 🔧 Environment Configuration:
echo   NODE_ENV = %NODE_ENV%
echo   PORT = %PORT%
echo.

REM Start the application
echo 🚀 Starting application...
echo.
node dist\index.js

pause