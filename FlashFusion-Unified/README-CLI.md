# 🚀 FlashFusion Developer CLI

> **Unified Command Suite for AI E-Commerce Platform**  
> 100+ commands across AI agents, validators, product generation, Supabase, deployment, analytics, and system ops.

## ⚡ Quick Installation

### Windows
```bash
# Run the installer
.\install-ff-cli.bat

# Or manually
npm install -g .
```

### Linux/Mac
```bash
# Make executable and install
chmod +x ff-cli.js
npm link

# Or use directly
node ff-cli.js <command>
```

## 🎯 Quick Start

```bash
# Get started guide
ff quickstart

# Initialize new project
ff init

# Install dependencies
ff install

# Configure environment
ff env

# Start development
ff dev

# Check system status
ff status
```

## 📋 Command Categories

### 📦 Core Project Setup
```bash
ff init                    # Scaffold entire monorepo structure
ff install                 # Install dependencies (pnpm or npm)
ff env                     # Generate .env file from template
ff env:check               # Verify env variable completeness
ff dev                     # Run all dev services concurrently
ff build                   # Compile all apps and packages
ff clean                   # Remove .next, dist, node_modules
ff upgrade                 # Check & upgrade all package versions
```

### 🚀 Deployment & Hosting
```bash
ff vercel:link             # Link Vercel project
ff vercel:deploy           # Deploy to staging
ff vercel:prod             # Deploy to production
ff vercel:logs             # View build logs
ff deploy:edge             # Deploy Supabase edge functions
ff deploy:all              # Full stack deploy (web + edge + DB)
```

### 🔐 Supabase DB + Auth
```bash
ff supa:start              # Run Supabase locally
ff supa:push               # Push local changes to remote
ff supa:seed               # Seed DB with dummy ideas
ff supa:rls:apply          # Apply row-level security policies
ff supa:logs               # View DB request logs
ff supa:backup             # Export DB backup
ff supa:restore            # Restore from backup
ff supa:auth:roles         # Show auth roles
```

### 🧠 MCP + Agent Orchestration
```bash
ff agent:list              # Show all registered agents
ff agent:roles             # Print roles, purpose, routing
ff agent:call              # Trigger agent manually
ff agent:log               # View recent calls
ff agent:add               # Add new agent to routing
ff agent:clear             # Clear memory state
ff agent:ping              # Health check all agents
ff agent:test              # Test specific agent's logic
ff agent:trace             # Trace call path with debug
```

### 🧪 Validator Suite
```bash
ff validate:all            # Run SaaS + Content + Ecom
ff validate:saas           # SaaS validator only
ff validate:content        # Content validator only
ff validate:ecom           # Ecom validator only
ff validate:score          # Show score breakdown
ff validate:compare        # Compare 2 ideas
ff validate:trend          # Run trend scraper module
ff validate:save           # Persist verdict to DB
ff validate:export         # Export verdict to PDF
```

### 🖼️ Mockup + Content Generation
```bash
ff mockup:start            # Upload image and generate merch
ff mockup:preview          # Preview results
ff mockup:download         # Download .zip of assets
ff mockup:publish          # Push to connected store
ff content:script          # Generate product ad copy
ff content:brandkit        # Generate brand logo, color, font
ff content:tagline         # Generate tagline based on idea
ff content:edit            # Rewrite description
ff content:save            # Store generated content
```

### 🛍️ Storefront Integration
```bash
ff connect:shopify         # OAuth connect Shopify store
ff connect:etsy            # OAuth connect Etsy
ff connect:tiktok          # OAuth TikTok Shop
ff connect:status          # Check integration health
ff connect:sync            # Sync product catalog
ff product:publish         # Push product to selected store
ff product:update          # Update product listing
ff product:retract         # Unpublish product
```

### 🧰 Developer Tools
```bash
ff ui:dev                  # Run frontend UI only
ff ui:test                 # Run component/unit tests
ff ui:lint                 # Lint UI codebase
ff ui:format               # Auto-format frontend files
ff ui:storybook            # Open Storybook components
ff prompt:test             # Try out prompt dropdowns
ff prompt:add              # Add new generator preset
```

### 📊 Analytics & Feedback
```bash
ff log:validate            # Show all past validation scores
ff log:agent               # Show past agent activities
ff feedback:form           # Launch feedback collector
ff feedback:list           # View user feedback
ff insight:weekly          # Summary of idea trends
ff insight:funnels         # Conversion report
ff trend:report            # Run trends + display UI
```

### 💾 Exporting & Docs
```bash
ff export:pdf              # Export current view
ff export:zip              # Download full mockup + copy
ff export:csv              # Export ideas database
ff docs:generate           # Build internal docs
ff docs:serve              # Serve docs locally
```

### 🔄 Automation & Workflows
```bash
ff auto:daily              # Trigger daily validator runs
ff auto:clean              # Cleanup unused ideas/files
ff auto:share              # Post best ideas to GPTs
ff auto:backup             # Schedule DB backups
ff auto:report             # Email insights to owner
```

### 🧠 Bonus Features
```bash
ff demo:mode               # Fake data auto-mode for pitching/demoing
ff gpt:export              # Generate GPT spec from idea
ff seo:gen                 # AI SEO meta generator for all products
```

## 🛠️ Development Workflow

### 1. **New Project Setup**
```bash
# Create new FlashFusion project
ff init
ff install
ff env
# Edit .env with your API keys
ff env:check
```

### 2. **Development**
```bash
# Start all services
ff dev

# In separate terminals:
ff agent:ping              # Check agents
ff ui:dev                  # Frontend only
ff supa:start              # Database
```

### 3. **Testing & Validation**
```bash
# Test your ideas
ff validate:all
ff agent:test
ff ui:test

# Generate content
ff mockup:start
ff content:script
```

### 4. **Deployment**
```bash
# Build and deploy
ff build
ff vercel:link
ff deploy:all

# Check deployment
ff vercel:logs
```

## 🔧 Configuration

### Environment Variables
```bash
# Generate template
ff env

# Required variables:
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secret
```

### Project Structure
```
FlashFusion-Unified/
├── src/                   # Core server code
├── agents/lyra/           # Lyra AI agent
├── mcp-servers/           # MCP integrations
├── api/                   # API endpoints
├── scripts/               # Automation scripts
├── ff-cli.js              # CLI implementation
└── package.json           # Project config
```

## 🐛 Troubleshooting

### Common Issues

**CLI not found**
```bash
# Reinstall globally
npm uninstall -g flashfusion-unified
npm install -g .

# Or use npm scripts
npm run ff <command>
```

**Environment issues**
```bash
# Check configuration
ff env:check
ff status

# Reset environment
ff env
# Edit .env file
```

**Development server issues**
```bash
# Clean and restart
ff clean
ff install
ff dev
```

**Agent connectivity**
```bash
# Check agent health
ff agent:ping
ff agent:log

# Restart MCP server
ff mcp:restart
```

## 📚 Advanced Usage

### Custom Workflows
```bash
# Create custom workflow
ff workflow:create --type=hybrid --name="my-workflow"

# Add custom agent
ff agent:add --name="specialist" --role="custom"
```

### Automation
```bash
# Set up daily automation
ff auto:daily
ff auto:backup

# Custom automation
ff auto:schedule --task="validate" --cron="0 9 * * *"
```

### Integration
```bash
# Connect external services
ff connect:shopify
ff connect:status

# Sync data
ff connect:sync
ff product:publish
```

## 💻 Development

### Adding New Commands
1. Edit `ff-cli.js` or `ff-cli-extended.js`
2. Add command to the `commands` object
3. Test with `ff <your-command>`
4. Update documentation

### Testing
```bash
# Test CLI locally
node ff-cli.js <command>

# Run project tests
ff ui:test
npm test
```

## 📈 System Status

Use `ff status` to check:
- ✅ Core services running
- 🔗 Integration health
- 🤖 Agent status
- 📊 System metrics

## 🆘 Support

- **Documentation**: `ff docs:serve`
- **Help**: `ff help:all`
- **Status**: `ff status`
- **Issues**: Create GitHub issue
- **Discord**: [FlashFusion Community](https://discord.gg/flashfusion)

---

**🎯 Ready to build your AI empire? Start with `ff quickstart`!**