#!/bin/bash

# FlashFusion Replit Deployment Fix Script
# Reduces bundle size and optimizes for Replit deployment

echo "🚀 Starting FlashFusion Replit Deployment Fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the FlashFusion-Unified directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: Must run from FlashFusion-Unified root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-cleanup size:${NC}"
du -sh . | head -1

# Step 1: Remove unnecessary directories
echo -e "${BLUE}🗑️  Removing development directories...${NC}"
rm -rf mcp-servers/ 2>/dev/null
rm -rf FlashFusion-Unified/FlashFusion-Unified/ 2>/dev/null
rm -rf flashfusion-app/flashfusion/node_modules/ 2>/dev/null
rm -rf flashfusion-dashboard/node_modules/ 2>/dev/null
rm -rf agents/lyra/dashboard/node_modules/ 2>/dev/null
rm -rf client/node_modules/ 2>/dev/null
rm -rf client_legacy/ 2>/dev/null
rm -rf .git/ 2>/dev/null
rm -rf logs/*.log 2>/dev/null
rm -rf coverage/ 2>/dev/null
rm -rf dist/ 2>/dev/null
rm -rf .yoyo/ 2>/dev/null

# Step 2: Clean Angular projects (keep source, remove build artifacts)
echo -e "${BLUE}🧹 Cleaning Angular projects...${NC}"
find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null
find . -name ".angular" -type d -exec rm -rf {} + 2>/dev/null
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null

# Step 3: Remove test files and maps
echo -e "${BLUE}🧪 Removing test files...${NC}"
find . -name "*.test.js" -delete 2>/dev/null
find . -name "*.test.ts" -delete 2>/dev/null
find . -name "*.spec.js" -delete 2>/dev/null
find . -name "*.spec.ts" -delete 2>/dev/null
find . -name "*.map" -delete 2>/dev/null

# Step 4: Create optimized package.json for Replit
echo -e "${BLUE}📦 Creating optimized package.json...${NC}"
cat > package-replit.json << 'EOF'
{
  "name": "flashfusion-unified",
  "version": "2.0.0",
  "description": "AI-powered business operating system",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node src/index.js",
    "build": "echo 'Build complete'",
    "health": "node scripts/health-check.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.57.0",
    "@supabase/supabase-js": "^2.38.0",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^4.18.2",
    "helmet": "^8.1.0",
    "winston": "^3.17.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Step 5: Create .replitignore file
echo -e "${BLUE}📝 Creating .replitignore...${NC}"
cat > .replitignore << 'EOF'
# Development files
*.test.js
*.test.ts
*.spec.js
*.spec.ts
*.map
coverage/
tests/
__tests__/
.git/
.github/
docs/

# Angular build artifacts
dist/
.angular/
*.tsbuildinfo

# Large directories
mcp-servers/
FlashFusion-Unified/FlashFusion-Unified/
client_legacy/
flashfusion-app/flashfusion/node_modules/
flashfusion-dashboard/node_modules/
agents/lyra/dashboard/node_modules/

# Logs and temp files
*.log
logs/
tmp/
temp/
.cache/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Other unnecessary files
*.md
!README.md
!CLAUDE.md
*.yml
!vercel.json
*.yaml
!app.yaml
EOF

# Step 6: Backup original package.json and use optimized version
echo -e "${BLUE}💾 Backing up and replacing package.json...${NC}"
cp package.json package-full.json
cp package-replit.json package.json

# Step 7: Install only production dependencies
echo -e "${BLUE}📦 Installing minimal dependencies...${NC}"
rm -rf node_modules package-lock.json
npm install --production --no-optional

# Step 8: Create deployment info file
echo -e "${BLUE}📄 Creating deployment info...${NC}"
cat > REPLIT_DEPLOYMENT.md << 'EOF'
# FlashFusion Replit Deployment

## Deployment Status
- Bundle optimized for Replit
- Size reduced to minimum
- Only production dependencies installed

## Quick Start
```bash
npm start
```

## Environment Variables Required
- ANTHROPIC_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- JWT_SECRET

## Endpoints
- Health: /api/health
- Main API: /api

## Restore Full Version
```bash
cp package-full.json package.json
npm install
```
EOF

# Step 9: Final cleanup
echo -e "${BLUE}🧹 Final cleanup...${NC}"
find . -type f -name "*.log" -delete 2>/dev/null
find . -type f -name ".DS_Store" -delete 2>/dev/null

# Step 10: Show final size
echo -e "${GREEN}✅ Deployment optimization complete!${NC}"
echo -e "${BLUE}📊 Final bundle size:${NC}"
du -sh . | head -1

echo -e "${GREEN}🎉 Ready for Replit deployment!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  1. Commit these changes: ${GREEN}git add . && git commit -m 'Optimize for Replit'${NC}"
echo -e "  2. Push to GitHub: ${GREEN}git push${NC}"
echo -e "  3. Import to Replit from GitHub"
echo -e "  4. Configure environment variables in Replit Secrets"
echo -e "  5. Click Run to start the application"