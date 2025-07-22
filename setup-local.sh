#!/bin/bash

# Temple Donation System - Local Setup Script
echo "🏛️ Temple Donation System - Local Setup"
echo "========================================"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Please upgrade to Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Setup environment file
if [ ! -f .env ]; then
    echo "⚙️ Creating environment file..."
    cat > .env << EOL
# Database Configuration
DATABASE_URL=postgresql://localhost:5432/temple_donations

# Application Configuration
NODE_ENV=development
PORT=5000

# Session Secret (change this in production)
SESSION_SECRET=your-secret-key-here
EOL
    echo "✅ Environment file created (.env)"
    echo "⚠️  Please update DATABASE_URL in .env file with your database connection"
else
    echo "✅ Environment file already exists"
fi

# Database setup instructions
echo ""
echo "🗄️ Database Setup Options:"
echo "Option 1 - Local PostgreSQL:"
echo "  1. Install PostgreSQL locally"
echo "  2. Create database: createdb temple_donations"
echo "  3. Update DATABASE_URL in .env file"
echo ""
echo "Option 2 - Cloud Database (Neon):"
echo "  1. Visit https://neon.tech"
echo "  2. Create free account and database"
echo "  3. Copy connection string to .env file"
echo ""

# Check if database is accessible
echo "🔗 Testing database connection..."
if npm run db:push > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection failed - please setup database first"
fi

echo ""
echo "🚀 Setup Complete!"
echo ""
echo "To start the application:"
echo "  npm run dev     # Development mode"
echo "  npm run build   # Build for production"
echo "  npm run start   # Production mode"
echo ""
echo "Access the app at: http://localhost:5000"
echo ""
echo "Admin Credentials:"
echo "  Username: templeadmin"
echo "  Password: Temple@123"
echo ""