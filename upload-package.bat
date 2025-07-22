@echo off
title Temple App - Create Hostinger Upload Package

echo 🚀 Creating Hostinger Upload Package
echo ====================================
echo.

REM Check if this is run from project directory
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo ✅ Project directory confirmed
echo.

REM Build the application
echo 📦 Building application for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix errors and try again
    pause
    exit /b 1
)

echo ✅ Build completed successfully
echo.

REM Create upload directory
if exist "hostinger-upload" rmdir /s /q "hostinger-upload"
mkdir "hostinger-upload"
echo ✅ Created upload directory

REM Copy essential files
echo 📁 Copying files for upload...

REM Copy dist folder
if exist "dist" (
    xcopy "dist" "hostinger-upload\dist\" /E /I /Q
    echo   ✅ Copied dist/
) else (
    echo   ❌ dist/ folder not found - build may have failed
    pause
    exit /b 1
)

REM Copy package files
copy "package.json" "hostinger-upload\" >nul
copy "package-lock.json" "hostinger-upload\" >nul 2>nul
echo   ✅ Copied package.json

REM Create production .env file
echo   ⚙️ Creating production .env file...
(
    echo # Production Environment Variables
    echo DATABASE_URL=your_neon_database_connection_string_here
    echo NODE_ENV=production
    echo PORT=3000
    echo SESSION_SECRET=change-this-to-secure-random-string
    echo.
    echo # Instructions:
    echo # 1. Replace DATABASE_URL with your actual Neon database connection string
    echo # 2. Generate a secure SESSION_SECRET using a password generator
    echo # 3. Remove these comment lines before uploading
) > "hostinger-upload\.env"
echo   ✅ Created .env template

REM Create upload instructions
echo   📋 Creating upload instructions...
(
    echo HOSTINGER UPLOAD INSTRUCTIONS
    echo ============================
    echo.
    echo 1. BEFORE UPLOADING:
    echo    - Edit .env file with your actual database connection
    echo    - Replace SESSION_SECRET with secure random string
    echo    - Remove comment lines from .env file
    echo.
    echo 2. UPLOAD TO HOSTINGER:
    echo    - Compress this entire hostinger-upload folder to ZIP
    echo    - Upload ZIP to your domain folder in Hostinger File Manager
    echo    - Extract ZIP in the web root directory
    echo.
    echo 3. SERVER SETUP:
    echo    - SSH into your Hostinger server
    echo    - Navigate to your domain directory
    echo    - Run: npm install --production
    echo    - Run: pm2 start dist/index.js --name temple-app
    echo.
    echo 4. TEST:
    echo    - Visit your domain in browser
    echo    - Test admin login: templeadmin / Temple@123
    echo    - Test donation entry
    echo.
    echo 5. TROUBLESHOOTING:
    echo    - Check logs: pm2 logs temple-app
    echo    - Restart app: pm2 restart temple-app
    echo    - Check status: pm2 status
    echo.
    echo For detailed guide, see HOSTINGER_UPLOAD_GUIDE.md
) > "hostinger-upload\UPLOAD_INSTRUCTIONS.txt"
echo   ✅ Created upload instructions

REM Create .htaccess for proper routing
(
    echo RewriteEngine On
    echo RewriteCond %%{REQUEST_FILENAME} !-f
    echo RewriteCond %%{REQUEST_FILENAME} !-d
    echo RewriteRule ^^(.*)$$ http://localhost:3000/$$1 [P,L]
    echo.
    echo # Enable compression
    echo ^<IfModule mod_deflate.c^>
    echo   AddOutputFilterByType DEFLATE text/plain
    echo   AddOutputFilterByType DEFLATE text/html
    echo   AddOutputFilterByType DEFLATE text/xml
    echo   AddOutputFilterByType DEFLATE text/css
    echo   AddOutputFilterByType DEFLATE application/xml
    echo   AddOutputFilterByType DEFLATE application/xhtml+xml
    echo   AddOutputFilterByType DEFLATE application/rss+xml
    echo   AddOutputFilterByType DEFLATE application/javascript
    echo   AddOutputFilterByType DEFLATE application/x-javascript
    echo ^</IfModule^>
) > "hostinger-upload\.htaccess"
echo   ✅ Created .htaccess file

echo.
echo 🎉 Upload package created successfully!
echo.
echo 📁 Package location: hostinger-upload\
echo.
echo ⚠️  IMPORTANT NEXT STEPS:
echo 1. Edit hostinger-upload\.env with your actual database connection
echo 2. Create ZIP file from hostinger-upload folder
echo 3. Upload ZIP to Hostinger and extract
echo 4. Follow instructions in UPLOAD_INSTRUCTIONS.txt
echo.
echo 📖 For detailed guide, see HOSTINGER_UPLOAD_GUIDE.md
echo.
pause