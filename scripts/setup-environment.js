#!/usr/bin/env node

/**
 * Environment Setup Helper
 * Helps users configure their .env file with required values
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EnvironmentSetup {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.prodEnvPath = path.join(process.cwd(), '.env.production');
    this.exampleEnvPath = path.join(process.cwd(), '.env.example');
  }

  async setup() {
    console.log('🔧 FlashFusion Environment Setup');
    console.log('═'.repeat(50));
    
    // Check if .env already exists
    if (fs.existsSync(this.envPath)) {
      console.log('⚠️  .env file already exists');
      console.log('   Backing up existing file...');
      fs.copyFileSync(this.envPath, `${this.envPath}.backup.${Date.now()}`);
    }
    
    // Create .env from production template
    if (fs.existsSync(this.prodEnvPath)) {
      console.log('📋 Copying .env.production template...');
      let envContent = fs.readFileSync(this.prodEnvPath, 'utf8');
      
      // Generate secure secrets
      envContent = this.generateSecureSecrets(envContent);
      
      // Write to .env
      fs.writeFileSync(this.envPath, envContent);
      console.log('✅ .env file created with secure defaults');
      
    } else {
      console.log('❌ .env.production template not found');
      return;
    }
    
    // Show setup instructions
    this.showSetupInstructions();
  }

  generateSecureSecrets(content) {
    console.log('🔐 Generating secure secrets...');
    
    // Generate JWT Secret (64 characters)
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    content = content.replace(
      'JWT_SECRET=ff_jwt_2025_super_secure_key_change_this_in_production_12345',
      `JWT_SECRET=${jwtSecret}`
    );
    
    // Generate Encryption Key (32 characters)
    const encryptionKey = crypto.randomBytes(16).toString('hex');
    content = content.replace(
      'ENCRYPTION_KEY=ff_encryption_32_char_key_2025_chng',
      `ENCRYPTION_KEY=${encryptionKey}`
    );
    
    // Generate Session Secret (64 characters)
    const sessionSecret = crypto.randomBytes(32).toString('hex');
    content = content.replace(
      'SESSION_SECRET=ff_session_secret_change_this_for_production_security_2025',
      `SESSION_SECRET=${sessionSecret}`
    );
    
    console.log('✅ Secure secrets generated');
    return content;
  }

  showSetupInstructions() {
    console.log('');
    console.log('🎯 SETUP COMPLETE - Next Steps:');
    console.log('═'.repeat(50));
    console.log('');
    console.log('📝 REQUIRED: Add these API keys to .env file:');
    console.log('');
    console.log('🤖 AI Services (at least one required):');
    console.log('   • ANTHROPIC_API_KEY - Get from https://console.anthropic.com');
    console.log('   • OPENAI_API_KEY - Get from https://platform.openai.com');
    console.log('');
    console.log('🗄️  Database (required):');
    console.log('   • SUPABASE_URL - Get from https://supabase.com/dashboard');
    console.log('   • SUPABASE_ANON_KEY - From Supabase project settings');
    console.log('   • SUPABASE_SERVICE_ROLE_KEY - From Supabase project settings');
    console.log('');
    console.log('🚀 Deployment (required for autonomous agents):');
    console.log('   • VERCEL_TOKEN - Get from https://vercel.com/account/tokens');
    console.log('   • VERCEL_ORG_ID - Your Vercel team/username');
    console.log('   • VERCEL_PROJECT_ID - From Vercel project settings');
    console.log('   • GITHUB_TOKEN - Get from https://github.com/settings/tokens');
    console.log('');
    console.log('🌐 Domain (optional):');
    console.log('   • GODADDY_API_KEY - For DNS automation');
    console.log('   • GODADDY_API_SECRET - For DNS automation');
    console.log('');
    console.log('⚡ QUICK START:');
    console.log('   1. Edit .env file with your API keys');
    console.log('   2. Run: npm install');
    console.log('   3. Run: npm run agents:start');
    console.log('   4. Visit: http://localhost:3000');
    console.log('');
    console.log('🔐 SECURITY NOTES:');
    console.log('   • .env file is gitignored (never committed)');
    console.log('   • Secure secrets have been auto-generated');
    console.log('   • Security Agent will monitor and rotate keys');
    console.log('');
  }
}

// CLI interface  
if (require.main === module) {
  const setup = new EnvironmentSetup();
  setup.setup();
}

module.exports = EnvironmentSetup;