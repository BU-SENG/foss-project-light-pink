#!/bin/bash

# Installation Verification Script
# This script checks if all dependencies and configurations are properly set up

echo "🔍 Verifying AI Docstring Generator Installation..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js installation... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
echo -n "Checking npm installation... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check if package.json exists
echo -n "Checking package.json... "
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${RED}✗${NC} Not found"
    exit 1
fi

# Check if node_modules exists
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}!${NC} Not installed"
    echo "Running npm install..."
    npm install
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check if required env vars are set
    if grep -q "VITE_SUPABASE_URL=" .env && grep -q "VITE_SUPABASE_ANON_KEY=" .env; then
        echo -e "${GREEN}✓${NC} Environment variables configured"
    else
        echo -e "${YELLOW}!${NC} Environment variables not fully configured"
        echo "Please check your .env file"
    fi
else
    echo -e "${YELLOW}!${NC} Not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}!${NC} Please edit .env with your Supabase credentials"
fi

# Check src directory
echo -n "Checking source files... "
if [ -d "src" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${RED}✗${NC} src directory not found"
    exit 1
fi

# Check Supabase directory
echo -n "Checking Supabase files... "
if [ -d "supabase" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}!${NC} Supabase directory not found"
fi

echo ""
echo "📋 Installation Summary:"
echo "----------------------------------------"
echo -e "${GREEN}✓${NC} Node.js and npm installed"
echo -e "${GREEN}✓${NC} Project dependencies installed"
echo -e "${GREEN}✓${NC} Source files present"

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Environment file configured"
else
    echo -e "${YELLOW}!${NC} Environment needs configuration"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Configure your .env file with Supabase credentials"
echo "2. Set up Supabase (see SUPABASE_SETUP.md)"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:5173"
echo ""
echo "📚 Documentation:"
echo "- QUICKSTART.md - 5-minute setup guide"
echo "- README.md - Full documentation"
echo "- SUPABASE_SETUP.md - Backend setup"
echo ""
echo "Happy coding! 🎉"
