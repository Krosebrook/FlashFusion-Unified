#!/usr/bin/env node

/**
 * FlashFusion Environment Setup Script
 * Helps users configure environment variables for deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EnvironmentSetup {
    constructor() {
        this.envPath = path.join(process.cwd(), '.env');
        this.templatePath = path.join(process.cwd(), 'deployment-env-template.md');
    }

    generateSecureSecret(length = 64) {
        return crypto.randomBytes(length).toString('hex');
    }

    createEnvTemplate() {
        const envContent = `# FlashFusion Environment Variables
# Copy this file to .env and fill in your actual values

# === REQUIRED FOR PRODUCTION ===
JWT_SECRET=${this.generateSecureSecret(32)}
ENCRYPTION_KEY=${this.generateSecureSecret(16)}

# === DATABASE (Recommended) ===
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-supabase-anon-key
# SUPABASE_SERVICE_KEY=your-supabase-service-key

# === AI SERVICES (Optional) ===
# OPENAI_API_KEY=sk-your-openai-key
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
# GEMINI_API_KEY=your-gemini-api-key

# === APPLICATION SETTINGS ===
NODE_ENV=development
APP_VERSION=2.0.0
PORT=3000

# === FEATURES ===
ENABLE_AI_AGENTS=true
ENABLE_WORKFLOWS=true
ENABLE_INTEGRATIONS=true

# === LOGGING ===
LOG_LEVEL=info

# === CORS (Production) ===
# ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# === INTEGRATIONS (Optional) ===
# GITHUB_TOKEN=ghp_your-github-token
# VERCEL_TOKEN=your-vercel-token
# SHOPIFY_API_KEY=your-shopify-api-key
# SHOPIFY_API_SECRET=your-shopify-secret
# STRIPE_SECRET_KEY=sk_live_your-stripe-secret
# TWITTER_API_KEY=your-twitter-key
# TWITTER_API_SECRET=your-twitter-secret
# LINKEDIN_CLIENT_ID=your-linkedin-id
# LINKEDIN_CLIENT_SECRET=your-linkedin-secret
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_ANALYTICS_ID=GA-your-analytics-id
`;

        return envContent;
    }

    setup() {
        console.log('🔧 FlashFusion Environment Setup');
        console.log('=' .repeat(50));

        // Check if .env already exists
        if (fs.existsSync(this.envPath)) {
            console.log('⚠️  .env file already exists');
            console.log('   Backup created as .env.backup');
            fs.copyFileSync(this.envPath, this.envPath + '.backup');
        }

        // Create new .env file
        const envContent = this.createEnvTemplate();
        fs.writeFileSync(this.envPath, envContent);

        console.log('✅ Environment template created successfully!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Edit .env file with your actual values');
        console.log('   2. Configure database credentials (SUPABASE_URL, SUPABASE_ANON_KEY)');
        console.log('   3. Add AI API keys (OPENAI_API_KEY or ANTHROPIC_API_KEY)');
        console.log('   4. Run: npm run validate');
        console.log('\n💡 Tips:');
        console.log('   - JWT_SECRET and ENCRYPTION_KEY have been auto-generated');
        console.log('   - Uncomment and fill in optional services as needed');
        console.log('   - See deployment-env-template.md for detailed instructions');

        this.showValidationInfo();
    }

    showValidationInfo() {
        console.log('\n🔍 Environment Validation:');
        
        try {
            const EnvironmentValidator = require('../src/utils/environmentValidator');
            const validation = EnvironmentValidator.validate();
            
            if (validation.errors.length > 0) {
                console.log('❌ Critical Issues:');
                validation.errors.forEach(error => {
                    console.log(`   - ${error.message}`);
                });
            }
            
            if (validation.warnings.length > 0) {
                console.log('⚠️  Warnings:');
                validation.warnings.forEach(warning => {
                    console.log(`   - ${warning.message}`);
                });
            }
            
            if (validation.suggestions.length > 0) {
                console.log('💡 Suggestions:');
                validation.suggestions.forEach(suggestion => {
                    console.log(`   - ${suggestion.message}`);
                });
            }
            
        } catch (error) {
            console.log('   Run "npm run validate" after configuring .env');
        }
    }

    // Generate production-ready environment variables
    generateProductionSecrets() {
        console.log('🔐 Production Secrets Generator');
        console.log('=' .repeat(50));
        
        const secrets = {
            JWT_SECRET: this.generateSecureSecret(32),
            ENCRYPTION_KEY: this.generateSecureSecret(16)
        };
        
        console.log('\n🔑 Generated Secrets (copy to your deployment platform):');
        Object.entries(secrets).forEach(([key, value]) => {
            console.log(`${key}=${value}`);
        });
        
        console.log('\n⚠️  Important Security Notes:');
        console.log('   - Store these secrets securely in your deployment platform');
        console.log('   - Never commit these values to version control');
        console.log('   - Rotate secrets regularly for security');
        
        return secrets;
    }
}

// CLI interface
if (require.main === module) {
    const command = process.argv[2];
    const setup = new EnvironmentSetup();
    
    switch (command) {
        case 'secrets':
            setup.generateProductionSecrets();
            break;
        case 'setup':
        default:
            setup.setup();
            break;
    }
}

module.exports = EnvironmentSetup;