#!/usr/bin/env node

/**
 * FlashFusion Token Rotation Script
 * Safely rotates all exposed API keys and tokens
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class TokenRotator {
  constructor() {
    this.envFile = path.join(process.cwd(), '.env');
    this.envLocalFile = path.join(process.cwd(), '.env.local');
    this.backupDir = path.join(process.cwd(), '.env.backup');
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate JWT secret
   */
  generateJWTSecret() {
    return crypto.randomBytes(64).toString('base64');
  }

  /**
   * Generate encryption key
   */
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create backup of current env files
   */
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (fs.existsSync(this.envFile)) {
      const backupPath = path.join(this.backupDir, `.env.${timestamp}`);
      fs.copyFileSync(this.envFile, backupPath);
      console.log(`✅ Backed up .env to ${backupPath}`);
    }

    if (fs.existsSync(this.envLocalFile)) {
      const backupPath = path.join(this.backupDir, `.env.local.${timestamp}`);
      fs.copyFileSync(this.envLocalFile, backupPath);
      console.log(`✅ Backed up .env.local to ${backupPath}`);
    }
  }

  /**
   * Read and parse env file
   */
  readEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const env = {};

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key] = valueParts.join('=');
        }
      }
    });

    return env;
  }

  /**
   * Write env file
   */
  writeEnvFile(filePath, env) {
    const lines = [];
    
    Object.entries(env).forEach(([key, value]) => {
      lines.push(`${key}=${value}`);
    });

    fs.writeFileSync(filePath, lines.join('\n') + '\n');
  }

  /**
   * Rotate tokens in .env file
   */
  rotateMainEnvTokens() {
    console.log('\n🔄 Rotating tokens in .env file...');
    
    const env = this.readEnvFile(this.envFile);
    let rotated = false;

    // Tokens that should be marked for manual rotation
    const manualRotationTokens = {
      'SUPABASE_ACCESS_TOKEN': 'Go to Supabase Dashboard → Settings → API',
      'GITHUB_TOKEN': 'Go to GitHub → Settings → Developer settings → Personal access tokens',
      'FIGMA_API_TOKEN': 'Go to Figma → Settings → Personal access tokens',
      'NOTION_API_KEY': 'Go to Notion → My integrations → Create new integration',
      'REPLIT_API_TOKEN': 'Go to Replit → Account → Create token',
      'VERCEL_TOKEN': 'Go to Vercel → Settings → Tokens',
      'ANTHROPIC_API_KEY': 'Go to Anthropic Console → API Keys',
      'OPENAI_API_KEY': 'Go to OpenAI Platform → API keys',
      'OPENAI_SERVICE_KEY': 'Go to OpenAI Platform → API keys'
    };

    // Auto-generate new secure keys
    const autoGenerateKeys = {
      'JWT_SECRET': this.generateJWTSecret(),
      'ENCRYPTION_KEY': this.generateEncryptionKey()
    };

    // Auto-generate keys
    Object.entries(autoGenerateKeys).forEach(([key, newValue]) => {
      if (env[key]) {
        console.log(`🔑 Rotating ${key}...`);
        env[key] = newValue;
        rotated = true;
      }
    });

    // Mark manual tokens for rotation
    Object.entries(manualRotationTokens).forEach(([key, instructions]) => {
      if (env[key] && !env[key].includes('your_new_') && !env[key].includes('your_actual_')) {
        console.log(`⚠️  ${key} needs manual rotation: ${instructions}`);
        env[key] = `your_new_${key.toLowerCase()}_here`;
        rotated = true;
      }
    });

    if (rotated) {
      this.writeEnvFile(this.envFile, env);
      console.log('✅ .env file updated');
    } else {
      console.log('ℹ️  No tokens to rotate in .env file');
    }

    return env;
  }

  /**
   * Rotate tokens in .env.local file
   */
  rotateLocalEnvTokens() {
    console.log('\n🔄 Rotating tokens in .env.local file...');
    
    const env = this.readEnvFile(this.envLocalFile);
    let rotated = false;

    // Auto-generate new secure keys
    const updates = {
      'JWT_SECRET': this.generateJWTSecret(),
      'ENCRYPTION_KEY': this.generateEncryptionKey()
    };

    Object.entries(updates).forEach(([key, newValue]) => {
      if (env[key]) {
        console.log(`🔑 Rotating ${key}...`);
        env[key] = newValue;
        rotated = true;
      }
    });

    // Update Supabase keys to use new format
    if (env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] && env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] === 'your_supabase_anon_key_here') {
      console.log('⚠️  Update NEXT_PUBLIC_SUPABASE_ANON_KEY with your actual Supabase anon key');
    }

    if (env['SUPABASE_SERVICE_ROLE_KEY'] && env['SUPABASE_SERVICE_ROLE_KEY'] === 'your_supabase_service_role_key_here') {
      console.log('⚠️  Update SUPABASE_SERVICE_ROLE_KEY with your actual Supabase service role key');
    }

    if (rotated) {
      this.writeEnvFile(this.envLocalFile, env);
      console.log('✅ .env.local file updated');
    } else {
      console.log('ℹ️  No tokens to rotate in .env.local file');
    }

    return env;
  }

  /**
   * Generate new secure configuration
   */
  generateSecureConfig() {
    console.log('\n🛡️  Generating new secure configuration...');

    const secureConfig = {
      // Database encryption keys
      DATABASE_ENCRYPTION_KEY: this.generateEncryptionKey(),
      
      // Session management
      SESSION_SECRET: this.generateJWTSecret(),
      REFRESH_TOKEN_SECRET: this.generateJWTSecret(),
      
      // API rate limiting keys
      RATE_LIMIT_SECRET: this.generateSecureToken(32),
      
      // CSRF protection
      CSRF_SECRET: this.generateSecureToken(32),
      
      // Cookie signing key
      COOKIE_SECRET: this.generateSecureToken(32)
    };

    console.log('✅ Generated new security configuration');
    return secureConfig;
  }

  /**
   * Create security recommendations
   */
  createSecurityRecommendations() {
    const recommendations = `
# FlashFusion Security Recommendations
# Generated on ${new Date().toISOString()}

## Immediate Actions Required:

1. **Supabase Tokens:**
   - Go to: https://supabase.com/dashboard/project/dswosmoivswodjgqrwqr/settings/api
   - Generate new anon key and service role key
   - Update .env.local with new keys

2. **GitHub Token:**
   - Go to: https://github.com/settings/tokens
   - Generate new personal access token with repo permissions
   - Update .env file

3. **API Keys:**
   - Anthropic: https://console.anthropic.com/
   - OpenAI: https://platform.openai.com/api-keys
   - Rotate all exposed keys

## Security Checklist:

- [ ] All environment variables updated
- [ ] Database RLS policies applied
- [ ] OAuth integrations configured
- [ ] Session management implemented
- [ ] Token rotation scheduled
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] Security headers applied

## Monitoring:

- Set up alerts for failed authentication attempts
- Monitor for unusual API usage patterns
- Regular token rotation (monthly)
- Review access logs weekly

## Next Steps:

1. Run: npm run setup-database
2. Run: npm run security-check
3. Test authentication flows
4. Deploy with new configuration
`;

    fs.writeFileSync(path.join(process.cwd(), 'SECURITY_RECOMMENDATIONS.md'), recommendations);
    console.log('✅ Created SECURITY_RECOMMENDATIONS.md');
  }

  /**
   * Run complete token rotation
   */
  async rotate() {
    console.log('🔐 FlashFusion Token Rotation Starting...');
    console.log('====================================\n');

    try {
      // Create backups
      this.createBackup();

      // Rotate tokens
      const mainEnv = this.rotateMainEnvTokens();
      const localEnv = this.rotateLocalEnvTokens();

      // Generate secure config
      const secureConfig = this.generateSecureConfig();

      // Create recommendations
      this.createSecurityRecommendations();

      console.log('\n🎉 Token rotation completed successfully!');
      console.log('\n📋 Manual actions required:');
      console.log('1. Update Supabase keys in .env.local');
      console.log('2. Rotate API keys for external services');
      console.log('3. Apply database RLS policies');
      console.log('4. Test authentication flows');
      console.log('\nSee SECURITY_RECOMMENDATIONS.md for details');

      return {
        success: true,
        mainEnv,
        localEnv,
        secureConfig
      };

    } catch (error) {
      console.error('❌ Token rotation failed:', error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const rotator = new TokenRotator();
  rotator.rotate().catch(console.error);
}

module.exports = { TokenRotator };