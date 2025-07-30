#!/bin/bash

# FlashFusion Replit Deployment Script
echo "🚀 Starting FlashFusion Replit Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a Replit environment
if [ -z "$REPL_SLUG" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not detected as Replit environment${NC}"
fi

echo -e "${BLUE}📋 Environment Check...${NC}"

# Check Node.js version
echo -e "${BLUE}Node.js version:${NC} $(node --version)"
echo -e "${BLUE}NPM version:${NC} $(npm --version)"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Check for environment file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found, copying from .env.example${NC}"
    cp .env.example .env || {
        echo -e "${RED}❌ Failed to copy .env.example${NC}"
        exit 1
    }
    echo -e "${YELLOW}📝 Please edit .env file with your API keys before running${NC}"
fi

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}

# Run health check
echo -e "${BLUE}🏥 Running health check...${NC}"
if command -v npm run health &> /dev/null; then
    npm run health || echo -e "${YELLOW}⚠️  Health check script not available${NC}"
fi

# Display deployment info
echo -e "${GREEN}✅ FlashFusion deployment preparation complete!${NC}"
echo ""
echo -e "${BLUE}🌐 Replit URLs:${NC}"
if [ ! -z "$REPL_SLUG" ]; then
    echo -e "  Main: https://${REPL_SLUG}.${REPL_OWNER}.repl.co"
    echo -e "  Health: https://${REPL_SLUG}.${REPL_OWNER}.repl.co/health"
    echo -e "  API: https://${REPL_SLUG}.${REPL_OWNER}.repl.co/api"
fi

echo ""
echo -e "${BLUE}🚀 To start the application:${NC}"
echo -e "  ${GREEN}npm start${NC}"
echo ""
echo -e "${BLUE}💡 Additional commands:${NC}"
echo -e "  ${GREEN}npm run dev${NC}     - Development mode with hot reload"
echo -e "  ${GREEN}npm test${NC}        - Run tests"
echo -e "  ${GREEN}npm run validate${NC} - Validate environment"
echo ""
echo -e "${GREEN}🎉 Ready to launch FlashFusion on Replit!${NC}"