#!/usr/bin/env node

/**
 * DevOps Agent Startup Script
 * Launches the autonomous DevOps Orchestrator Agent
 */

require('dotenv').config();
const DevOpsOrchestratorAgent = require('../src/agents/DevOpsOrchestratorAgent');

class DevOpsManager {
  constructor() {
    this.agent = null;
    this.setupSignalHandlers();
  }

  async start() {
    console.log('🚀 FlashFusion DevOps Agent Starting...');
    console.log('═'.repeat(60));
    
    try {
      // Validate environment
      await this.validateEnvironment();
      
      // Create and start agent
      this.agent = new DevOpsOrchestratorAgent();
      const result = await this.agent.start();
      
      if (result.success) {
        console.log('');
        console.log('🎯 AUTONOMOUS PIPELINE ACTIVE:');
        console.log('   Replit → GitHub → Vercel → GoDaddy → FlashFusion.co');
        console.log('');
        console.log('📊 Monitoring:');
        console.log('   ✅ Code changes (auto-commit)');
        console.log('   ✅ Deployments (auto-trigger)');
        console.log('   ✅ DNS updates (auto-configure)');
        console.log('   ✅ Health checks (every 5min)');
        console.log('');
        console.log('🌐 Your site will auto-update at: https://flashfusion.co');
        console.log('');
        console.log('Press Ctrl+C to stop the agent');
        
        // Start status reporting
        this.startStatusReporting();
        
      } else {
        console.error('❌ Failed to start agent:', result.error);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Startup failed:', error.message);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    const required = [
      'GITHUB_TOKEN',
      'VERCEL_TOKEN', 
      'VERCEL_ORG_ID',
      'VERCEL_PROJECT_ID'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:');
      missing.forEach(key => console.error(`   ${key}`));
      console.error('');
      console.error('💡 Add these to your .env file');
      throw new Error('Environment validation failed');
    }
    
    // Optional but recommended
    const optional = [
      'GODADDY_API_KEY',
      'GODADDY_API_SECRET',
      'REPLIT_WEBHOOK_URL'
    ];
    
    const missingOptional = optional.filter(key => !process.env[key]);
    if (missingOptional.length > 0) {
      console.log('⚠️ Optional environment variables not set:');
      missingOptional.forEach(key => console.log(`   ${key} (limited functionality)`));
    }
    
    console.log('✅ Environment validated');
  }

  startStatusReporting() {
    // Report status every 5 minutes
    setInterval(() => {
      if (this.agent) {
        const status = this.agent.getStatus();
        this.logStatus(status);
      }
    }, 5 * 60 * 1000);
  }

  logStatus(status) {
    console.log('');
    console.log('📊 DevOps Agent Status:');
    console.log(`   Active: ${status.isActive ? '✅' : '❌'}`);
    console.log(`   Queue: ${status.queuedDeployments} pending deployments`);
    console.log(`   Uptime: ${Math.floor(status.uptime / 60)} minutes`);
    
    console.log('   Health Checks:');
    Object.entries(status.healthChecks).forEach(([service, check]) => {
      const icon = check.status === 'healthy' ? '✅' : 
                   check.status === 'warning' ? '⚠️' : '❌';
      console.log(`     ${service}: ${icon} ${check.status}`);
    });
    
    if (status.lastDeployment) {
      console.log(`   Last Deploy: ${status.lastDeployment.completedAt} (${status.lastDeployment.status})`);
    }
    console.log('');
  }

  setupSignalHandlers() {
    process.on('SIGINT', async () => {
      console.log('\\n🛑 Shutting down DevOps Agent...');
      
      if (this.agent) {
        await this.agent.stop();
      }
      
      console.log('✅ DevOps Agent stopped');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\\n🛑 Received SIGTERM, shutting down...');
      
      if (this.agent) {
        await this.agent.stop();
      }
      
      process.exit(0);
    });
  }
}

// CLI interface
if (require.main === module) {
  const manager = new DevOpsManager();
  manager.start().catch(console.error);
}

module.exports = DevOpsManager;