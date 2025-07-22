# Temple Donation System - Production Start Script for Windows PowerShell

Write-Host "🚀 Starting Temple Donation System in Production Mode" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists (built application)
if (-not (Test-Path "dist")) {
    Write-Host "❌ dist folder not found. Please build the application first." -ForegroundColor Red
    Write-Host "Run: npm run build" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if index.js exists in dist
if (-not (Test-Path "dist\index.js")) {
    Write-Host "❌ dist\index.js not found. Please build the application first." -ForegroundColor Red
    Write-Host "Run: npm run build" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Built application found" -ForegroundColor Green
Write-Host ""

# Set environment variables for Windows PowerShell
$env:NODE_ENV = "production"
$env:PORT = "5000"

Write-Host "🔧 Environment Configuration:" -ForegroundColor Yellow
Write-Host "   NODE_ENV = $env:NODE_ENV" -ForegroundColor White
Write-Host "   PORT = $env:PORT" -ForegroundColor White
Write-Host ""

# Start the application
Write-Host "🚀 Starting application..." -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at: http://localhost:$env:PORT" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Cyan
Write-Host ""

# Start Node.js application
node dist\index.js