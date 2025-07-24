# FlashFusion Unified Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/FlashFusion-Unified.git
cd FlashFusion-Unified
npm install
```

### 2. Interactive Setup
```bash
node scripts/setup.js
```
This wizard will guide you through:
- Basic platform configuration
- AI service setup (OpenAI, Claude, Gemini)
- Database configuration (Supabase, Redis)  
- Workflow preferences
- Security settings
- Optional integrations

### 3. Start Development
```bash
npm run dev
```
Open http://localhost:3000 to access your FlashFusion dashboard.

## 📋 Manual Setup

If you prefer manual configuration:

### 1. Environment Variables
```bash
cp .env.example .env
# Edit .env with your specific values
```

### 2. Required Configuration
At minimum, set these variables:
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secure-jwt-secret
```

### 3. AI Services (Choose at least one)
```env
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
GEMINI_API_KEY=your-gemini-key
```

### 4. Database (Optional but recommended)
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
REDIS_URL=redis://localhost:6379
```

## 🔧 Development Environment

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Redis (optional, for caching)
- PostgreSQL (optional, via Supabase)

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Start full development environment (backend + frontend)
npm run dev:full

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run format

# Run health check
npm run health

# Generate documentation
npm run docs
```

## 🎯 Workflow Setup

### Development Workflow
For building AI-powered applications:
```env
# GitHub integration
GITHUB_TOKEN=your-github-token

# Deployment platforms
VERCEL_TOKEN=your-vercel-token
```

### Commerce Workflow  
For e-commerce automation:
```env
# Shopify
SHOPIFY_API_KEY=your-shopify-key
SHOPIFY_API_SECRET=your-shopify-secret

# Amazon
AMAZON_CLIENT_ID=your-amazon-client-id
AMAZON_CLIENT_SECRET=your-amazon-secret

# Payment processing
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### Content Workflow
For content creation and distribution:
```env
# YouTube
YOUTUBE_API_KEY=your-youtube-key

# Social media
TWITTER_BEARER_TOKEN=your-twitter-token
INSTAGRAM_CLIENT_ID=your-instagram-client-id

# Publishing platforms
WORDPRESS_USERNAME=your-wordpress-username
```

## 🐳 Docker Setup

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Manual Docker Build
```bash
# Build image
docker build -t flashfusion-unified .

# Run container
docker run -p 3000:3000 --env-file .env flashfusion-unified
```

## ☁️ Production Deployment

### Vercel (Recommended)
```bash
npm run deploy:vercel
```

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Start the production server:
   ```bash
   npm start
   ```

### Environment Variables for Production
```env
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_FILE_LOGGING=true

# Security
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret

# Database URLs (production)
SUPABASE_URL=your-production-supabase-url
REDIS_URL=your-production-redis-url

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key
```

## 🔍 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process or use a different port
PORT=3001 npm run dev
```

**Missing dependencies**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment variables not loading**
- Ensure `.env` file is in the root directory
- Restart the development server after changes
- Check for typos in variable names

**AI services not working**
- Verify API keys are valid and have sufficient credits
- Check API key format (some require specific prefixes)
- Ensure network connectivity to AI service endpoints

**Database connection issues**
- Verify Supabase URL and keys are correct
- Check if Redis server is running (if using Redis)
- Test database connectivity separately

### Debug Mode
Enable detailed logging:
```env
DEBUG=flashfusion:*
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

### Health Checks
```bash
# Check system health
curl http://localhost:3000/health

# Check specific services
curl http://localhost:3000/api/health/agents
curl http://localhost:3000/api/health/workflows
```

## 📞 Support

### Community Support
- GitHub Discussions: Ask questions and share ideas
- Discord Community: Real-time chat with other users
- GitHub Issues: Report bugs and request features

### Documentation
- [API Documentation](./API.md)
- [Workflow Guide](./WORKFLOWS.md)
- [Agent Development](./AGENTS.md)
- [Integration Guide](./INTEGRATIONS.md)

### Professional Support
For professional support and consulting:
- Email: support@flashfusion.ai
- Website: https://flashfusion.ai/support

---

Ready to automate your business with AI? Let's get started! 🚀