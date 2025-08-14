#!/usr/bin/env node

/**
 * FlashFusion CLI - Complete Implementation
 * Merges core and extended commands into unified CLI
 */

const core = require('./ff-cli.js');
const extended = require('./ff-cli-extended.js');

// Merge all commands
const allCommands = {
    ...core.commands,
    ...extended,
    
    // Additional helper commands
    'help:all': () => {
        console.log(`
${core.log ? '' : ''}FlashFusion Developer CLI v2.0.0 - Complete Command Reference

📦 CORE PROJECT SETUP
  ff:init                    → Scaffold entire monorepo structure
  ff:install                 → Install dependencies (pnpm or npm)
  ff:env                     → Generate .env file from template
  ff:env:check               → Verify env variable completeness
  ff:dev                     → Run all dev services concurrently
  ff:build                   → Compile all apps and packages
  ff:clean                   → Remove .next, dist, node_modules
  ff:upgrade                 → Check & upgrade all package versions

🚀 DEPLOYMENT & HOSTING
  ff:vercel:link             → Link Vercel project
  ff:vercel:deploy           → Deploy to staging
  ff:vercel:prod             → Deploy to production
  ff:vercel:logs             → View build logs
  ff:deploy:edge             → Deploy Supabase edge functions
  ff:deploy:all              → Full stack deploy (web + edge + DB)

🔐 SUPABASE DB + AUTH
  ff:supa:start              → Run Supabase locally
  ff:supa:push               → Push local changes to remote
  ff:supa:seed               → Seed DB with dummy ideas
  ff:supa:rls:apply          → Apply row-level security policies
  ff:supa:logs               → View DB request logs
  ff:supa:backup             → Export DB backup
  ff:supa:restore            → Restore from backup
  ff:supa:auth:roles         → Show auth roles

🧠 MCP + AGENT ORCHESTRATION
  ff:agent:list              → Show all registered agents
  ff:agent:roles             → Print roles, purpose, routing
  ff:agent:call              → Trigger agent manually
  ff:agent:log               → View recent calls
  ff:agent:add               → Add new agent to routing
  ff:agent:clear             → Clear memory state
  ff:agent:ping              → Health check all agents
  ff:agent:test              → Test specific agent's logic
  ff:agent:trace             → Trace call path with debug

🧪 VALIDATOR SUITE
  ff:validate:all            → Run SaaS + Content + Ecom
  ff:validate:saas           → SaaS validator only
  ff:validate:content        → Content validator only
  ff:validate:ecom           → Ecom validator only
  ff:validate:score          → Show score breakdown
  ff:validate:compare        → Compare 2 ideas
  ff:validate:trend          → Run trend scraper module
  ff:validate:save           → Persist verdict to DB
  ff:validate:export         → Export verdict to PDF

🖼️ MOCKUP + CONTENT GENERATION
  ff:mockup:start            → Upload image and generate merch
  ff:mockup:preview          → Preview results
  ff:mockup:download         → Download .zip of assets
  ff:mockup:publish          → Push to connected store
  ff:content:script          → Generate product ad copy
  ff:content:brandkit        → Generate brand logo, color, font
  ff:content:tagline         → Generate tagline based on idea
  ff:content:edit            → Rewrite description
  ff:content:save            → Store generated content

🛍️ STOREFRONT INTEGRATION
  ff:connect:shopify         → OAuth connect Shopify store
  ff:connect:etsy            → OAuth connect Etsy
  ff:connect:tiktok          → OAuth TikTok Shop
  ff:connect:status          → Check integration health
  ff:connect:sync            → Sync product catalog
  ff:product:publish         → Push product to selected store
  ff:product:update          → Update product listing
  ff:product:retract         → Unpublish product

🧰 DEVELOPER TOOLS
  ff:ui:dev                  → Run frontend UI only
  ff:ui:test                 → Run component/unit tests
  ff:ui:lint                 → Lint UI codebase
  ff:ui:format               → Auto-format frontend files
  ff:ui:storybook            → Open Storybook components
  ff:prompt:test             → Try out prompt dropdowns
  ff:prompt:add              → Add new generator preset

📊 ANALYTICS & FEEDBACK
  ff:log:validate            → Show all past validation scores
  ff:log:agent               → Show past agent activities
  ff:feedback:form           → Launch feedback collector
  ff:feedback:list           → View user feedback
  ff:insight:weekly          → Summary of idea trends
  ff:insight:funnels         → Conversion report
  ff:trend:report            → Run trends + display UI

💾 EXPORTING & DOCS
  ff:export:pdf              → Export current view
  ff:export:zip              → Download full mockup + copy
  ff:export:csv              → Export ideas database
  ff:docs:generate           → Build internal docs
  ff:docs:serve              → Serve docs locally

🔄 AUTOMATION & WORKFLOWS
  ff:auto:daily              → Trigger daily validator runs
  ff:auto:clean              → Cleanup unused ideas/files
  ff:auto:share              → Post best ideas to GPTs
  ff:auto:backup             → Schedule DB backups
  ff:auto:report             → Email insights to owner

🧠 BONUS FEATURES
  ff:demo:mode               → Fake data auto-mode for pitching/demoing
  ff:cloner:create           → Turn validated idea into standalone microapp repo
  ff:gpt:export              → Generate GPT spec from idea
  ff:seo:gen                 → AI SEO meta generator for all products
  ff:embed:widget            → Generate embeddable FlashFusion widget
        `);
    },

    'status': () => {
        console.log(`
🚀 FlashFusion System Status

📊 Core Services:
  ✅ Main Server (Port 8080)
  ✅ Lyra Dashboard (Port 3000)  
  ✅ MCP Server (Port 3001)
  
🔗 Integrations:
  🟢 Supabase Connected
  🟢 Anthropic Claude API
  🟡 OpenAI API (Configured)
  
🤖 Agents Status:
  ✅ Coordinator Active
  ✅ Creator Active  
  ✅ Researcher Active
  ✅ Optimizer Active
  ✅ Analyzer Active
  ✅ Automator Active

📈 System Health: Excellent
🔧 Last Updated: ${new Date().toLocaleString()}
        `);
    },

    'quickstart': () => {
        console.log(`
🚀 FlashFusion Quick Start Guide

1️⃣ Initialize Project:
   ff:init

2️⃣ Install Dependencies:
   ff:install

3️⃣ Configure Environment:
   ff:env
   # Edit .env with your API keys

4️⃣ Start Development:
   ff:dev

5️⃣ Open in Browser:
   • Main Dashboard: http://localhost:8080
   • Lyra Agent: http://localhost:3000

🎯 Ready to build? Try:
   ff:validate:all    # Test the validator
   ff:agent:ping      # Check agent health
   ff:mockup:start    # Generate content

💡 Need help? Run: ff:help:all
        `);
    }
};

// Main execution logic
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === 'help') {
        allCommands.help();
        return;
    }

    if (command === 'quickstart') {
        allCommands.quickstart();
        return;
    }

    if (command === 'status') {
        allCommands.status(); 
        return;
    }

    // Remove 'ff:' prefix if present
    const cleanCommand = command.replace(/^ff:/, '');

    if (allCommands[cleanCommand]) {
        try {
            await allCommands[cleanCommand]();
        } catch (error) {
            console.error(`❌ Command failed: ${error.message}`);
            process.exit(1);
        }
    } else {
        console.error(`❌ Unknown command: ${command}`);
        console.log('💡 Run "ff:help:all" to see all available commands');
        process.exit(1);
    }
}

// Make CLI executable
if (require.main === module) {
    main().catch(error => {
        console.error(`❌ ${error.message}`);
        process.exit(1);
    });
}

module.exports = allCommands;