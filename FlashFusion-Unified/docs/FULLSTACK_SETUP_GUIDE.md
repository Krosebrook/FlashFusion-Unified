# 🚀 Complete Fullstack Setup Guide - FlashFusion Unified
*Enterprise-Grade Development Environment with Claude Code CLI Integration*

> **Version**: 2025 Production Ready  
> **Target**: 20-year veteran developers  
> **Environment**: Windows/WSL, macOS, Linux  
> **Tech Stack**: Node.js, React/Next.js, Express, PostgreSQL/MongoDB, Claude Code CLI

---

## Table of Contents

1. [System Prerequisites](#system-prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [FlashFusion Project Installation](#flashfusion-project-installation)
4. [Database Configuration](#database-configuration)
5. [AI Services Integration](#ai-services-integration)
6. [Development Workflow Setup](#development-workflow-setup)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## System Prerequisites

### Base System Requirements
```bash
# Verify system compatibility
node --version    # v18.0.0+ required
npm --version     # v9.0.0+ required
git --version     # v2.30.0+ recommended
```

### Essential Tools Installation

#### Windows (PowerShell as Administrator)
```powershell
# Install Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install essential tools
choco install nodejs git vscode postman docker-desktop -y
choco install postgresql mongodb -y

# Install WSL2 for better Linux compatibility
wsl --install
```

#### macOS (Homebrew)
```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install development tools
brew install node git postgresql mongodb docker
brew install --cask visual-studio-code postman docker

# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code
```

#### Linux (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional tools
sudo apt install -y git postgresql mongodb docker.io docker-compose
sudo snap install code --classic
sudo snap install postman

# Install Claude Code CLI
sudo npm install -g @anthropic-ai/claude-code
```

---

## Development Environment Setup

### 1. Shell Configuration

#### Bash/Zsh Optimization
Add to `~/.bashrc` or `~/.zshrc`:

```bash
# FlashFusion Development Environment
export FLASHFUSION_HOME="$HOME/FlashFusion-Unified"
export NODE_ENV="development"

# Claude Code Aliases
alias cc='claude --dangerously-skip-permissions'
alias ccplan='claude /plan'
alias cctest='claude /test'
alias ccreview='claude /review'

# FlashFusion Aliases  
alias ff='cd $FLASHFUSION_HOME'
alias ffdev='cd $FLASHFUSION_HOME && npm run dev'
alias fftest='cd $FLASHFUSION_HOME && npm test'
alias ffbuild='cd $FLASHFUSION_HOME && npm run build'

# Quick project navigation
alias ffapi='cd $FLASHFUSION_HOME/api'
alias ffclient='cd $FLASHFUSION_HOME/FlashFusion-Unified/client'
alias ffdocs='cd $FLASHFUSION_HOME/FlashFusion-Unified/docs'

# Development utilities
alias ports='netstat -tulpn | grep LISTEN'
alias logs='tail -f logs/combined.log'
alias envcheck='node scripts/validate_env.js'

# Git shortcuts
alias gst='git status'
alias gaa='git add -A'
alias gcm='git commit -m'
alias gps='git push'
alias gpl='git pull'

# Reload configuration
alias reload='source ~/.bashrc'  # or ~/.zshrc
```

#### Environment Variables Template
Create `~/.env.development`:
```bash
# Core Configuration  
NODE_ENV=development
PORT=3001
APP_URL=http://localhost:3001

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/flashfusion_dev
MONGODB_URI=mongodb://localhost:27017/flashfusion_dev
REDIS_URL=redis://localhost:6379

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
OPENAI_API_KEY=sk-your-key-here

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# External Services
NOTION_API_KEY=secret_your-notion-integration-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.your-key
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook

# Email Configuration  
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Storage & CDN
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=flashfusion-assets

# Monitoring & Analytics
SENTRY_DSN=https://your-sentry-dsn
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Development Tools
WEBPACK_ANALYZE=false
DEBUG=flashfusion:*
```

### 2. VS Code Configuration

#### Extensions Installation
```bash
# Install essential extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-python.python
code --install-extension ms-vscode.vscode-json

# Claude Code specific (if available)
code --install-extension anthropic.claude-code
```

#### VS Code Settings
Create `.vscode/settings.json` in project root:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.md": "markdown"
  },
  "editor.rulers": [80, 120],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true
  }
}
```

---

## FlashFusion Project Installation

### 1. Repository Setup
```bash
# Clone the repository
cd ~/
git clone https://github.com/Krosebrook/FlashFusion-Unified.git
cd FlashFusion-Unified

# Verify directory structure
ls -la
# Should show: package.json, FlashFusion-Unified/, docs/, etc.

# Install root dependencies
npm install

# Install all project dependencies
npm run dev:install
```

### 2. Project Structure Verification
```bash
# Check project structure
tree -L 3 -I node_modules
```

Expected structure:
```
FlashFusion-Unified/
├── package.json                 # Root package management
├── FlashFusion-Unified/         # Main application
│   ├── client/                  # React frontend
│   ├── api/                     # Express API
│   ├── functions/               # Firebase functions
│   ├── src/                     # Core services
│   ├── docs/                    # Documentation
│   └── scripts/                 # Utility scripts
├── docs/                        # Project documentation
├── monitoring/                  # System monitoring
└── README.md
```

### 3. Environment Configuration
```bash
# Copy environment template
cp FlashFusion-Unified/.env.example FlashFusion-Unified/.env

# Edit with your configuration
code FlashFusion-Unified/.env
# Fill in all required environment variables
```

### 4. Claude Code Integration Setup
```bash
# Initialize Claude Code for the project
cd FlashFusion-Unified/FlashFusion-Unified
claude /init

# This creates:
# - CLAUDE.md (project context)
# - .claude/ directory
# - Custom commands

# Verify Claude setup
ls -la .claude/
```

---

## Database Configuration

### PostgreSQL Setup

#### Installation Verification
```bash
# Check PostgreSQL installation
psql --version

# Start PostgreSQL service
# Linux/WSL
sudo service postgresql start

# macOS
brew services start postgresql

# Windows
net start postgresql-x64-14
```

#### Database Creation
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE flashfusion_dev;
CREATE USER flashfusion WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE flashfusion_dev TO flashfusion;

# Exit PostgreSQL
\q
```

#### Schema Migration
```bash
# Run database migrations
cd FlashFusion-Unified/FlashFusion-Unified
npm run db:migrate

# Verify tables created
npm run db:status
```

### MongoDB Setup (Alternative/Additional)

#### Start MongoDB Service
```bash
# Linux/WSL
sudo service mongod start

# macOS  
brew services start mongodb-community

# Windows
net start MongoDB
```

#### Create Development Database
```bash
# Connect to MongoDB
mongo

# Create database
use flashfusion_dev

# Create initial collection
db.users.insertOne({"_id": 1, "name": "test"})

# Exit MongoDB
exit
```

### Redis Setup (Caching & Sessions)
```bash
# Install Redis
# Ubuntu/WSL
sudo apt install redis-server

# macOS
brew install redis

# Windows
# Download from: https://github.com/microsoftarchive/redis/releases

# Start Redis
redis-server

# Test Redis connection
redis-cli ping
# Should respond: PONG
```

---

## AI Services Integration

### 1. Anthropic Claude Setup
```bash
# Set Claude API key
export ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"

# Verify Claude Code CLI connection
claude --version
claude auth

# Test Claude integration
echo "console.log('Hello Claude');" | claude -p "explain this code"
```

### 2. OpenAI Integration (Optional)
```bash
# Set OpenAI API key
export OPENAI_API_KEY="sk-your-openai-key-here"

# Test OpenAI integration
node -e "
const { OpenAI } = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log('OpenAI configured successfully');
"
```

### 3. Service Configuration Verification
```bash
# Run AI services test
cd FlashFusion-Unified/FlashFusion-Unified
npm run test:ai-integration

# Should show successful connections to configured services
```

---

## Development Workflow Setup

### 1. Development Scripts Configuration

Verify these scripts in `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "nodemon api/main.js",
    "dev:client": "cd FlashFusion-Unified/client && npm run dev",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext js,jsx,ts,tsx",
    "build": "npm run build:client && npm run build:functions"
  }
}
```

### 2. Start Development Environment
```bash
# Terminal 1: Start full development stack
cd FlashFusion-Unified
npm run dev

# This starts:
# - Express API server on port 3001
# - React client on port 3000  
# - Hot reload for both
```

### 3. Verification Checklist
```bash
# Check all services are running
curl http://localhost:3001/api/health    # API health check
curl http://localhost:3000               # Client health check

# Check database connections
npm run health                           # Full system health check

# Verify Claude Code integration
claude --dangerously-skip-permissions
/health
```

### 4. Development Workflow Commands
```bash
# Quick development workflow
alias devup='cd $FLASHFUSION_HOME && npm run dev'
alias devdown='pkill -f "node.*dev"'
alias devrestart='devdown && sleep 2 && devup'
alias devlogs='cd $FLASHFUSION_HOME && npm run logs'
alias devtest='cd $FLASHFUSION_HOME && npm run test:watch'
```

---

## Production Deployment

### 1. Build Process
```bash
# Production build
npm run build

# Verify build artifacts
ls -la FlashFusion-Unified/client/dist/
ls -la FlashFusion-Unified/functions/lib/
```

### 2. Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:password@prod_host:5432/flashfusion_prod
REDIS_URL=redis://prod_redis_host:6379

# Security configurations
JWT_SECRET=ultra_secure_production_secret
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Docker Deployment (Recommended)
```bash
# Build Docker images
docker-compose -f docker-compose.yml build

# Run production containers
docker-compose -f docker-compose.yml up -d

# Verify deployment
docker-compose logs -f
```

### 4. Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
cd FlashFusion-Unified/FlashFusion-Unified
vercel --prod

# Configure environment variables in Vercel dashboard
# https://vercel.com/your-account/your-project/settings/environment-variables
```

### 5. Health Monitoring Setup
```bash
# Set up monitoring endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/metrics

# Configure alerts (example with Sentry)
npm install @sentry/node @sentry/integrations
```

---

## Monitoring & Maintenance

### 1. System Monitoring Setup

#### Application Monitoring
```bash
# Install monitoring dependencies
npm install winston morgan helmet compression

# Start monitoring dashboard
npm run monitor

# Check system metrics
npm run metrics
```

#### Database Monitoring
```bash
# PostgreSQL monitoring
SELECT * FROM pg_stat_activity;

# MongoDB monitoring  
db.stats()

# Redis monitoring
redis-cli info stats
```

### 2. Log Management
```bash
# Central logging configuration
mkdir -p logs/
touch logs/combined.log logs/error.log logs/access.log

# Log rotation setup (Linux)
sudo logrotate -f /etc/logrotate.conf

# View logs
tail -f logs/combined.log | grep ERROR
```

### 3. Backup Procedures
```bash
# Database backup
pg_dump flashfusion_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# MongoDB backup
mongodump --db flashfusion_prod --out backup_$(date +%Y%m%d_%H%M%S)/

# Code backup
tar -czf code_backup_$(date +%Y%m%d_%H%M%S).tar.gz FlashFusion-Unified/
```

### 4. Performance Optimization
```bash
# Bundle analysis
npm run analyze

# Performance testing
npm run test:performance

# Memory usage monitoring
node --inspect api/main.js
```

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Port Conflicts
```bash
# Find processes using ports
lsof -i :3000
lsof -i :3001

# Kill process if needed
kill -9 PID
```

#### Database Connection Issues
```bash
# PostgreSQL connection test
pg_isready -h localhost -p 5432

# MongoDB connection test
mongo --eval "db.adminCommand('ismaster')"

# Reset connections
sudo service postgresql restart
sudo service mongod restart
```

#### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

#### Claude Code CLI Issues
```bash
# Reset Claude Code
rm -rf ~/.claude/
claude auth

# Skip permissions issues
claude --dangerously-skip-permissions
```

### Performance Debugging
```bash
# Memory usage
node --max-old-space-size=4096 api/main.js

# CPU profiling
node --prof api/main.js

# Network debugging  
DEBUG=* npm run dev
```

---

## Security Checklist

### Development Security
- [ ] Environment variables properly configured
- [ ] No secrets committed to git
- [ ] HTTPS enforced in production
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Helmet.js security headers
- [ ] JWT tokens properly handled
- [ ] Database queries parameterized
- [ ] File uploads restricted and validated

### Production Security
- [ ] SSL/TLS certificates configured
- [ ] Database connections encrypted  
- [ ] API keys rotated regularly
- [ ] Security headers configured
- [ ] Monitoring and alerting active
- [ ] Backup procedures tested
- [ ] Access logs monitored
- [ ] Dependency vulnerabilities checked
- [ ] Server hardening applied
- [ ] Incident response plan documented

---

## Next Steps

### 1. Team Onboarding
- Share this guide with team members
- Create team-specific Claude Code commands
- Set up shared development standards
- Configure team communication channels

### 2. Development Process
- Implement code review workflows
- Set up automated testing
- Configure deployment pipelines  
- Establish monitoring procedures

### 3. Production Readiness
- Load testing and optimization
- Security audit and penetration testing
- Disaster recovery planning
- Performance baseline establishment

---

*🎯 This guide provides enterprise-grade setup for FlashFusion development with Claude Code CLI integration, optimized for experienced fullstack developers.*