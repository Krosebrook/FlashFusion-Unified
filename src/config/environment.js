/**
 * Environment Configuration for FlashFusion Unified Platform
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
    // Application
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_VERSION: process.env.APP_VERSION || '2.0.0',
    PORT: parseInt(process.env.PORT) || 3333,
    
    // CORS
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3333', 'https://flashfusion.co'],
    
    // Database (Supabase)
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    
    // AI Services
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    
    // Integration Services
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    VERCEL_TOKEN: process.env.VERCEL_TOKEN,
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    TWITTER_API_KEY: process.env.TWITTER_API_KEY,
    TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    
    // Google Services
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    
    // Security
    JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'dev-jwt-secret-key'),
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here',
    
    // Features
    ENABLE_AI_AGENTS: process.env.ENABLE_AI_AGENTS !== 'false',
    ENABLE_WORKFLOWS: process.env.ENABLE_WORKFLOWS !== 'false',
    ENABLE_INTEGRATIONS: process.env.ENABLE_INTEGRATIONS !== 'false',
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Validation helpers
    isProduction: () => config.NODE_ENV === 'production',
    isDevelopment: () => config.NODE_ENV === 'development',
    isTest: () => config.NODE_ENV === 'test',
    
    // Configuration validation
    validate: () => {
        const required = [];
        const warnings = [];
        
        // Check critical configurations for production
        if (config.isProduction()) {
            // JWT_SECRET is required in production
            if (!config.JWT_SECRET || config.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
                required.push('JWT_SECRET environment variable is required but not configured in production deployment');
            }
            
            // Database configuration warnings for production
            if (!config.SUPABASE_URL) {
                warnings.push('SUPABASE_URL environment variable is missing, preventing database connectivity');
            }
            
            if (!config.SUPABASE_ANON_KEY) {
                warnings.push('SUPABASE_ANON_KEY environment variable is missing, preventing database authentication');
            }
        } else {
            // Development warnings only
            if (!config.SUPABASE_URL) {
                warnings.push('SUPABASE_URL not configured - database features will be limited');
            }
            
            if (!config.SUPABASE_ANON_KEY) {
                warnings.push('SUPABASE_ANON_KEY not configured - database features will be limited');
            }
        }
        
        if (!config.OPENAI_API_KEY && !config.ANTHROPIC_API_KEY) {
            warnings.push('No AI API keys configured - agent chat features will be limited');
        }
        
        // Log warnings
        if (warnings.length > 0) {
            console.warn('⚠️ Configuration warnings:');
            warnings.forEach(warning => console.warn(`   - ${warning}`));
        }
        
        // Throw errors for required configs in production only
        if (required.length > 0) {
            console.error('❌ Configuration errors:');
            required.forEach(error => console.error(`   - ${error}`));
            if (config.isProduction()) {
                throw new Error('Invalid production configuration');
            }
        }
        
        if (warnings.length === 0 && required.length === 0) {
            console.log('✅ Configuration validation passed');
        }
        
        return true;
    },
    
    // Get database URL for different environments
    getDatabaseConfig: () => {
        const hasCredentials = !!(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
        return {
            url: config.SUPABASE_URL,
            key: config.SUPABASE_ANON_KEY,
            serviceKey: config.SUPABASE_SERVICE_KEY,
            configured: hasCredentials,
            canConnect: hasCredentials,
            fallbackMode: !hasCredentials
        };
    },
    
    // Get AI service configuration
    getAIConfig: () => {
        return {
            openai: {
                apiKey: config.OPENAI_API_KEY,
                enabled: !!config.OPENAI_API_KEY
            },
            anthropic: {
                apiKey: config.ANTHROPIC_API_KEY,
                enabled: !!config.ANTHROPIC_API_KEY
            },
            gemini: {
                apiKey: config.GEMINI_API_KEY,
                enabled: !!config.GEMINI_API_KEY
            }
        };
    },
    
    // Get integration services configuration
    getIntegrationConfig: () => {
        return {
            github: {
                token: config.GITHUB_TOKEN,
                enabled: !!config.GITHUB_TOKEN
            },
            vercel: {
                token: config.VERCEL_TOKEN,
                enabled: !!config.VERCEL_TOKEN
            },
            shopify: {
                apiKey: config.SHOPIFY_API_KEY,
                apiSecret: config.SHOPIFY_API_SECRET,
                enabled: !!(config.SHOPIFY_API_KEY && config.SHOPIFY_API_SECRET)
            },
            stripe: {
                secretKey: config.STRIPE_SECRET_KEY,
                enabled: !!config.STRIPE_SECRET_KEY
            },
            twitter: {
                apiKey: config.TWITTER_API_KEY,
                apiSecret: config.TWITTER_API_SECRET,
                enabled: !!(config.TWITTER_API_KEY && config.TWITTER_API_SECRET)
            },
            linkedin: {
                clientId: config.LINKEDIN_CLIENT_ID,
                clientSecret: config.LINKEDIN_CLIENT_SECRET,
                enabled: !!(config.LINKEDIN_CLIENT_ID && config.LINKEDIN_CLIENT_SECRET)
            },
            google: {
                clientId: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                analyticsId: config.GOOGLE_ANALYTICS_ID,
                enabled: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET)
            }
        };
    }
};

// Validate configuration on load
if (require.main !== module) {
    try {
        const EnvironmentValidator = require('../utils/environmentValidator');
        const validation = EnvironmentValidator.validate();
        
        if (!validation.isValid && config.isProduction()) {
            console.error('\n❌ Critical configuration errors detected in production:');
            validation.errors.forEach(error => {
                console.error(`   ${error.message}`);
            });
            console.error('\nSuggested fixes:');
            validation.errors.forEach(error => {
                console.error(`   ${error.solution}`);
            });
            process.exit(1);
        }
    } catch (error) {
        console.error('Environment validation failed:', error.message);
        // Don't exit in development, just warn
        if (config.isProduction()) {
            process.exit(1);
        }
    }
}

module.exports = config;