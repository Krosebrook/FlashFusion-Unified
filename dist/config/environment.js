/**
 * FlashFusion Unified Platform Environment Configuration
 * Centralized configuration management for all platform services
 */

require('dotenv').config();

// Helper function to parse boolean environment variables
const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Helper function to parse JSON environment variables
const parseJSON = (value, defaultValue = {}) => {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Failed to parse JSON config: ${value}`);
    return defaultValue;
  }
};
const config = {
  // ========================================
  // CORE PLATFORM CONFIGURATION
  // ========================================
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  APP_NAME: process.env.APP_NAME || 'FlashFusion Unified',
  APP_VERSION: process.env.APP_VERSION || '2.0.0',
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  // ========================================
  // AI SERVICE PROVIDERS
  // ========================================
  AI_SERVICES: {
    OPENAI: {
      API_KEY: process.env.OPENAI_API_KEY,
      MODEL: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 4000,
      TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
    },
    ANTHROPIC: {
      API_KEY: process.env.ANTHROPIC_API_KEY,
      MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      MAX_TOKENS: parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10) || 4000
    },
    GEMINI: {
      API_KEY: process.env.GEMINI_API_KEY,
      MODEL: process.env.GEMINI_MODEL || 'gemini-pro'
    }
  },
  // ========================================
  // DATABASE & STORAGE
  // ========================================
  DATABASE: {
    SUPABASE: {
      URL: process.env.SUPABASE_URL,
      ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    REDIS: {
      URL: process.env.REDIS_URL || 'redis://localhost:6379',
      PASSWORD: process.env.REDIS_PASSWORD,
      MAX_RETRIES: parseInt(process.env.REDIS_MAX_RETRIES, 10) || 3
    }
  },
  // ========================================
  // AUTHENTICATION & SECURITY
  // ========================================
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
    RATE_LIMIT: {
      WINDOW_MS: parseInt(process.env.API_RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 15 * 60 * 1000,
      MAX_REQUESTS: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001']
  },
  // ========================================
  // WORKFLOW INTEGRATIONS
  // ========================================
  INTEGRATIONS: {
    // Development workflow
    DEVELOPMENT: {
      GITHUB: {
        TOKEN: process.env.GITHUB_TOKEN,
        WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET
      },
      VERCEL: {
        TOKEN: process.env.VERCEL_TOKEN
      },
      DOCKER: {
        USERNAME: process.env.DOCKER_USERNAME,
        PASSWORD: process.env.DOCKER_PASSWORD
      }
    },
    // Commerce workflow
    COMMERCE: {
      SHOPIFY: {
        API_KEY: process.env.SHOPIFY_API_KEY,
        API_SECRET: process.env.SHOPIFY_API_SECRET,
        WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET
      },
      AMAZON: {
        CLIENT_ID: process.env.AMAZON_CLIENT_ID,
        CLIENT_SECRET: process.env.AMAZON_CLIENT_SECRET,
        REFRESH_TOKEN: process.env.AMAZON_REFRESH_TOKEN
      },
      EBAY: {
        CLIENT_ID: process.env.EBAY_CLIENT_ID,
        CLIENT_SECRET: process.env.EBAY_CLIENT_SECRET
      },
      STRIPE: {
        PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
      }
    },
    // Content workflow
    CONTENT: {
      YOUTUBE: {
        API_KEY: process.env.YOUTUBE_API_KEY,
        CLIENT_ID: process.env.YOUTUBE_CLIENT_ID,
        CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET
      },
      TWITTER: {
        BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
        API_KEY: process.env.TWITTER_API_KEY,
        API_SECRET: process.env.TWITTER_API_SECRET
      },
      INSTAGRAM: {
        CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
        CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET
      }
    },
    // Shared services
    SHARED: {
      SENDGRID: {
        API_KEY: process.env.SENDGRID_API_KEY,
        FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'noreply@flashfusion.ai'
      },
      FIRECRAWL: {
        API_KEY: process.env.FIRECRAWL_API_KEY
      }
    }
  },
  // ========================================
  // AGENT ORCHESTRATION SETTINGS
  // ========================================
  AGENTS: {
    MAX_CONCURRENT: parseInt(process.env.MAX_CONCURRENT_AGENTS, 10) || 10,
    TIMEOUT: parseInt(process.env.AGENT_TIMEOUT, 10) || 300000,
    // 5 minutes
    HANDOFF_TIMEOUT: parseInt(process.env.HANDOFF_TIMEOUT, 10) || 60000,
    // 1 minute
    ENABLE_LOGGING: parseBoolean(process.env.ENABLE_AGENT_LOGGING, true),
    RETRY_ATTEMPTS: parseInt(process.env.AGENT_RETRY_ATTEMPTS, 10) || 3
  },
  // ========================================
  // WORKFLOW SETTINGS
  // ========================================
  WORKFLOWS: {
    MAX_STEPS: parseInt(process.env.MAX_WORKFLOW_STEPS, 10) || 100,
    TIMEOUT: parseInt(process.env.WORKFLOW_TIMEOUT, 10) || 1800000,
    // 30 minutes
    ENABLE_CACHING: parseBoolean(process.env.ENABLE_WORKFLOW_CACHING, true),
    ENABLE_CROSS_DATA_SHARING: parseBoolean(process.env.ENABLE_CROSS_WORKFLOW_DATA_SHARING, true),
    DATA_RETENTION_DAYS: parseInt(process.env.DATA_RETENTION_DAYS, 10) || 90
  },
  // ========================================
  // ANALYTICS & MONITORING
  // ========================================
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    ENABLE_PERFORMANCE_MONITORING: parseBoolean(process.env.ENABLE_PERFORMANCE_MONITORING, true),
    ENABLE_USER_ANALYTICS: parseBoolean(process.env.ENABLE_USER_ANALYTICS, true),
    ENABLE_WORKFLOW_METRICS: parseBoolean(process.env.ENABLE_WORKFLOW_METRICS, true)
  },
  // ========================================
  // BUSINESS SETTINGS
  // ========================================
  BUSINESS: {
    SUBSCRIPTION_TIERS: parseJSON(process.env.SUBSCRIPTION_TIERS, {
      starter: {
        price: 97,
        workflows: 3,
        agents: 6,
        tasks: 100
      },
      professional: {
        price: 297,
        workflows: 10,
        agents: 'unlimited',
        tasks: 1000
      },
      enterprise: {
        price: 997,
        workflows: 'unlimited',
        agents: 'unlimited',
        tasks: 'unlimited'
      }
    }),
    FREE_TIER_LIMITS: parseJSON(process.env.FREE_TIER_LIMITS, {
      workflows: 1,
      tasks: 10,
      agents: 2
    }),
    TRACK_API_USAGE: parseBoolean(process.env.TRACK_API_USAGE, true)
  },
  // ========================================
  // DEVELOPMENT & DEBUGGING
  // ========================================
  DEVELOPMENT: {
    DEBUG: process.env.DEBUG,
    ENABLE_REQUEST_LOGGING: parseBoolean(process.env.ENABLE_REQUEST_LOGGING, false),
    ENABLE_BETA_FEATURES: parseBoolean(process.env.ENABLE_BETA_FEATURES, false),
    ENABLE_EXPERIMENTAL_AGENTS: parseBoolean(process.env.ENABLE_EXPERIMENTAL_AGENTS, false),
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    TEST_REDIS_URL: process.env.TEST_REDIS_URL || 'redis://localhost:6380'
  },
  // ========================================
  // DEPLOYMENT & SCALING
  // ========================================
  DEPLOYMENT: {
    CLUSTER_MODE: parseBoolean(process.env.CLUSTER_MODE, false),
    WORKER_PROCESSES: process.env.WORKER_PROCESSES || 'auto',
    ENABLE_REDIS_CACHING: parseBoolean(process.env.ENABLE_REDIS_CACHING, true),
    CACHE_TTL: parseInt(process.env.CACHE_TTL, 10) || 3600,
    // 1 hour
    FILE_UPLOAD_MAX_SIZE: parseInt(process.env.FILE_UPLOAD_MAX_SIZE, 10) || 10485760,
    // 10MB
    CDN_URL: process.env.CDN_URL,
    STATIC_ASSETS_URL: process.env.STATIC_ASSETS_URL
  }
};

// Validation function to check required environment variables
const validateConfig = () => {
  const requiredForProduction = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  if (config.NODE_ENV === 'production') {
    const missing = requiredForProduction.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
    }
  }

  // Warn about missing AI service keys
  const aiServices = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];
  const missingAI = aiServices.filter(key => !process.env[key]);
  if (missingAI.length === aiServices.length) {
    console.warn('⚠️  No AI service API keys configured. Some features will be limited.');
  }
};

// Run validation
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
}
module.exports = config;