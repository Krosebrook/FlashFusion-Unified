#!/usr/bin/env node

/**
 * Security Guardian Agent Startup Script
 * Launches the autonomous Security Guardian Agent
 */

require('dotenv').config();
const SecurityGuardianAgent = require('../src/agents/SecurityGuardianAgent');

class SecurityManager {
  constructor() {
    this.agent = null;
    this.setupSignalHandlers();
  }

  async start() {
    console.log('🛡️ FlashFusion Security Guardian Starting...');
    console.log('═'.repeat(60));
    
    try {
      // Validate environment
      await this.validateEnvironment();
      
      // Create and start agent
      this.agent = new SecurityGuardianAgent();
      const result = await this.agent.start();
      
      if (result.success) {
        console.log('');
        console.log('🛡️ SECURITY GUARDIAN ACTIVE:');
        console.log('   Protecting FlashFusion Infrastructure');
        console.log('');
        console.log('🔐 Monitoring:');
        console.log('   ✅ Supabase RLS policies (continuous)');
        console.log('   ✅ API key rotation (30-90 day cycles)');
        console.log('   ✅ Vulnerability scanning (daily)');
        console.log('   ✅ Access pattern analysis (15min intervals)');
        console.log('   ✅ Threat detection (real-time)');
        console.log('');
        console.log('🚨 Auto-Response:');
        console.log('   ✅ Critical threat blocking');
        console.log('   ✅ Emergency key rotation');
        console.log('   ✅ Security alert notifications');
        console.log('   ✅ Audit logging');
        console.log('');
        console.log('🔍 Security Dashboard: /api/security/status');
        console.log('');
        console.log('Press Ctrl+C to stop the agent');
        
        // Start status reporting
        this.startStatusReporting();
        
      } else {
        console.error('❌ Failed to start Security Guardian:', result.error);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Security startup failed:', error.message);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating security environment...');
    
    const required = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required security variables:');
      missing.forEach(key => console.error(`   ${key}`));
      console.error('');
      console.error('💡 Add these to your .env file for full security protection');
      throw new Error('Security environment validation failed');
    }
    
    // Check for API keys to protect
    const apiKeys = [
      'ANTHROPIC_API_KEY',
      'OPENAI_API_KEY', 
      'GITHUB_TOKEN',
      'NOTION_API_KEY'
    ];
    
    const foundKeys = apiKeys.filter(key => process.env[key]);
    console.log(`✅ Found ${foundKeys.length} API keys to protect`);
    
    if (foundKeys.length === 0) {
      console.log('⚠️ No API keys found - limited security protection');
    }
    
    console.log('✅ Security environment validated');
  }

  startStatusReporting() {
    // Report security status every 30 minutes
    setInterval(() => {
      if (this.agent) {
        const status = this.agent.getStatus();
        this.logSecurityStatus(status);
      }
    }, 30 * 60 * 1000);
  }

  logSecurityStatus(status) {
    console.log('');
    console.log('🛡️ Security Guardian Status:');
    console.log(`   Active: ${status.isActive ? '✅' : '❌'}`);
    console.log(`   Uptime: ${Math.floor(status.uptime / 3600)} hours`);
    
    if (status.lastVulnerabilityScan) {
      const scanAge = Math.floor((Date.now() - new Date(status.lastVulnerabilityScan)) / (1000 * 60 * 60));
      console.log(`   Last Vuln Scan: ${scanAge} hours ago`);
    }
    
    console.log('   Key Rotation Schedule:');
    Object.entries(status.keyRotationSchedule).forEach(([key, schedule]) => {
      const daysUntilRotation = Math.floor((new Date(schedule.nextRotation) - Date.now()) / (1000 * 60 * 60 * 24));
      const statusIcon = schedule.status === 'due' ? '🔴' : 
                        daysUntilRotation < 7 ? '🟡' : '🟢';
      console.log(`     ${key}: ${statusIcon} ${daysUntilRotation} days`);
    });
    
    if (status.recentThreats.length > 0) {
      console.log(`   Recent Threats: ⚠️ ${status.recentThreats.length} in monitoring period`);
    } else {
      console.log('   Recent Threats: ✅ None detected');
    }
    console.log('');
  }

  setupSignalHandlers() {
    process.on('SIGINT', async () => {
      console.log('\\n🛑 Shutting down Security Guardian...');
      
      if (this.agent) {
        await this.agent.stop();
      }
      
      console.log('✅ Security Guardian stopped');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\\n🛑 Received SIGTERM, shutting down security...');
      
      if (this.agent) {
        await this.agent.stop();
      }
      
      process.exit(0);
    });
  }
}

// CLI interface
if (require.main === module) {
  const manager = new SecurityManager();
  manager.start().catch(console.error);
}

module.exports = SecurityManager;