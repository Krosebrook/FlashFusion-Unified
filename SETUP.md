# FlashFusion Unified Platform - Setup Guide

## Quick Start

FlashFusion is an AI Business Operating System that transforms business ideas into automated revenue streams. This guide will help you set up the platform with full functionality.

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git** (for version control)
- **Supabase Account** (for database)
- **OpenAI API Key** (for AI agents)

## 🚀 Installation

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd FlashFusion-Unified
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your actual credentials
nano .env  # or your preferred editor
```

### 3. Database Setup

1. Create a **Supabase** project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the dashboard
3. Run the database schema:
   - Go to your Supabase dashboard
   - Open the SQL editor
   - Copy and paste the contents of `database/schema.sql`
   - Run the query

### 4. AI Service Setup

Get API keys for the AI services you want to use:

- **OpenAI**: Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: Visit [console.anthropic.com](https://console.anthropic.com) (optional)

### 5. Start the Platform

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The platform will be available at:
- **Dashboard**: http://localhost:3333
- **Health Check**: http://localhost:3333/health
- **API**: http://localhost:3333/api/v1

## 🔧 Configuration

### Required Environment Variables

```env
# Database (Required for persistence)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services (Required for agent chat)
OPENAI_API_KEY=your_openai_api_key
```

### Optional Integrations

Add these for enhanced functionality:

```env
# Version Control
GITHUB_TOKEN=your_github_token

# Deployment
VERCEL_TOKEN=your_vercel_token

# E-commerce
SHOPIFY_API_KEY=your_shopify_key
STRIPE_SECRET_KEY=your_stripe_key

# Social Media
TWITTER_API_KEY=your_twitter_key
LINKEDIN_CLIENT_ID=your_linkedin_id
```

## 🧪 Testing the Setup

### 1. Health Check

Visit http://localhost:3333/health or run:

```bash
curl http://localhost:3333/health
```

You should see:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy" },
    "ai": { "initialized": true }
  }
}
```

### 2. Test Agent Chat

1. Open the dashboard at http://localhost:3333
2. Click on "Agents" in the navigation
3. Click "💬 Chat" on any agent
4. Send a message and verify you get an AI response

### 3. Test Workflow Creation

1. Go to "Workflows" page
2. Click "Create Workflow"
3. Select a workflow type and create it
4. Verify it appears in your active workflows

## 📁 Project Structure

```
FlashFusion-Unified/
├── src/
│   ├── core/           # Core orchestration logic
│   ├── services/       # Database and AI services
│   ├── api/           # API endpoints
│   └── config/        # Configuration
├── client/dist/       # Frontend dashboard
├── database/          # Database schemas
├── scripts/           # Utility scripts
└── docs/             # Documentation
```

## 🔑 Key Features

### ✅ Implemented Features

- **6 AI Agents**: Coordinator, Creator, Researcher, Automator, Analyzer, Optimizer
- **Real AI Chat**: Powered by OpenAI GPT models with persistent conversations
- **4 Workflow Types**: Development, Commerce, Content, Hybrid
- **Database Persistence**: All data stored in Supabase
- **Interactive Dashboard**: Full HTML/JS interface with real-time updates
- **Health Monitoring**: System status and service monitoring
- **Agent Personalities**: Customizable agent behavior and traits
- **Memory System**: Conversation history and context preservation

### 🚧 In Development

- **30+ Service Integrations**: GitHub, Shopify, Stripe, social media
- **File Upload/Processing**: Document and media handling
- **Advanced Workflows**: Complex multi-step automation
- **User Authentication**: User accounts and permissions
- **Real-time Collaboration**: Multi-user workflow sharing

## 🔧 API Endpoints

### Core Endpoints

- `GET /health` - System health check
- `GET /api/v1/status` - Detailed system status
- `GET /api/v1/agents` - List all agents
- `POST /api/v1/agents/chat` - Chat with an agent
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow

### Example API Usage

```bash
# Chat with the coordinator agent
curl -X POST http://localhost:3333/api/v1/agents/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "coordinator",
    "message": "Help me create a business plan",
    "context": {"userId": "demo"}
  }'

# Create a development workflow
curl -X POST http://localhost:3333/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "type": "development",
    "config": {
      "name": "My App Project",
      "description": "Build a new web application"
    }
  }'
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - Make sure you've run the database schema
   - Check Supabase project is active

2. **AI Agents Not Responding**
   - Verify your `OPENAI_API_KEY` is valid
   - Check you have sufficient OpenAI credits
   - Look at server logs for API errors

3. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Or kill the process using port 3333: `lsof -ti:3333 | xargs kill`

### Debug Mode

Enable detailed logging:

```bash
LOG_LEVEL=debug npm run dev
```

### Reset Database

If you need to reset your database:

1. Go to Supabase dashboard
2. Go to Settings > Database
3. Reset database or recreate tables
4. Re-run the schema from `database/schema.sql`

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npm run deploy:vercel
```

### Docker Deployment

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

## 📚 Documentation

- **API Documentation**: Available at `/api/docs` when running
- **Agent Personalities**: See `database/schema.sql` for personality system
- **Workflow Types**: Documented in `src/core/WorkflowEngine.js`
- **Integration Guide**: See `INTEGRATION_GUIDE.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📞 Support

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/FlashFusion-Unified/issues)
- **Documentation**: [Full docs](https://docs.flashfusion.ai)
- **Community**: [Discord server](https://discord.gg/flashfusion)

## 📄 License

MIT License - see `LICENSE` file for details.

---

**FlashFusion Unified v2.0.0** - Turning Ideas into Automated Revenue Streams 🚀