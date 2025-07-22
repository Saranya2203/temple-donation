# Temple Donation System - Windows PowerShell Setup Script

Write-Host "🏛️ Temple Donation System - Windows Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
    
    # Check if version is 18+
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Write-Host "❌ Node.js version $versionNumber detected. Please upgrade to Node.js 18+" -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm detected: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please reinstall Node.js" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        throw "npm install failed"
    }
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Create environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Creating environment file..." -ForegroundColor Yellow
    
    $envContent = @"
# Database Configuration
DATABASE_URL=postgresql://localhost:5432/temple_donations

# Application Configuration
NODE_ENV=development
PORT=5000

# Session Secret (change this in production)
SESSION_SECRET=your-secret-key-here
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Environment file created (.env)" -ForegroundColor Green
    Write-Host "⚠️  Please update DATABASE_URL in .env file with your database connection" -ForegroundColor Yellow
} else {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🗄️ Database Setup Options:" -ForegroundColor Cyan
Write-Host "Option 1 - Local PostgreSQL:"
Write-Host "  1. Download PostgreSQL from https://postgresql.org/download/windows/"
Write-Host "  2. Install PostgreSQL (remember the password)"
Write-Host "  3. Open pgAdmin or use command line"
Write-Host "  4. Create database: CREATE DATABASE temple_donations;"
Write-Host "  5. Update DATABASE_URL in .env file"
Write-Host ""
Write-Host "Option 2 - Cloud Database (Neon):"
Write-Host "  1. Visit https://neon.tech"
Write-Host "  2. Create free account and database"
Write-Host "  3. Copy connection string to .env file"
Write-Host ""

# Test database connection
Write-Host "🔗 Testing database connection..." -ForegroundColor Yellow
try {
    npm run db:push | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database connection failed - please setup database first" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Database connection failed - please setup database first" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  npm run dev     # Development mode" -ForegroundColor White
Write-Host "  npm run build   # Build for production" -ForegroundColor White
Write-Host "  npm run start   # Production mode" -ForegroundColor White
Write-Host ""
Write-Host "Access the app at: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Cyan
Write-Host "  Username: templeadmin" -ForegroundColor White
Write-Host "  Password: Temple@123" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"