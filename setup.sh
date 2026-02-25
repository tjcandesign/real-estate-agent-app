#!/bin/bash

# Real Estate Agent App - Automated Setup Script
# This script sets up the database and prepares the app for development

set -e

echo "🚀 Real Estate Agent App - Setup Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local not found!${NC}"
    echo ""
    echo "Please create .env.local with the following content:"
    echo ""
    echo "DATABASE_URL=\"postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres\""
    echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"your_clerk_key\""
    echo "CLERK_SECRET_KEY=\"your_clerk_secret\""
    echo "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/agents/sign-in"
    echo "NEXT_PUBLIC_CLERK_SIGN_UP_URL=/agents/sign-up"
    echo "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/agents/dashboard"
    echo "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/agents/onboarding"
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3003"
    echo ""
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
    echo -e "${RED}✗ DATABASE_URL not found in .env.local!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env.local found${NC}"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Step 2: Generate Prisma client
echo "🔧 Step 2: Generating Prisma client..."
npm run prisma:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

# Step 3: Run database migrations
echo "🗄️  Step 3: Running database migrations..."
echo -e "${YELLOW}Note: You may be prompted to create your first migration${NC}"
npm run prisma:migrate || {
    echo -e "${RED}Migration failed. Check your DATABASE_URL in .env.local${NC}"
    exit 1
}
echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# Step 4: Success summary
echo "========================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Your Real Estate Agent app is ready! 🎉"
echo ""
echo "Next steps:"
echo "  1. Start the dev server: npm run dev"
echo "  2. Open http://localhost:3003 in your browser"
echo "  3. Sign in with your Clerk credentials"
echo ""
echo "Useful commands:"
echo "  - npm run dev              # Start development server"
echo "  - npm run prisma:studio    # Open Prisma Studio (database GUI)"
echo "  - npm run build            # Build for production"
echo "  - npm run lint             # Run ESLint"
echo ""
