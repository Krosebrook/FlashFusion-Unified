#!/usr/bin/env node

/**
 * FlashFusion Auth Callback URL Configuration
 * Sets up OAuth and authentication callback URLs for all providers
 */

import dotenv from 'dotenv';
dotenv.config();

// Auth callback URLs for FlashFusion
const CALLBACK_URLS = {
  // Production URLs
  production: {
    base: 'https://flashfusion.co',
    callbacks: {
      supabase: 'https://flashfusion.co/auth/callback',
      google: 'https://flashfusion.co/auth/google/callback',
      github: 'https://flashfusion.co/auth/github/callback',
      microsoft: 'https://flashfusion.co/auth/microsoft/callback',
      notion: 'https://flashfusion.co/auth/notion/callback',
      stripe: 'https://flashfusion.co/webhooks/stripe',
      zapier: 'https://flashfusion.co/webhooks/zapier'
    }
  },

  // Development URLs
  development: {
    base: 'http://localhost:3000',
    callbacks: {
      supabase: 'http://localhost:3000/auth/callback',
      google: 'http://localhost:3000/auth/google/callback',
      github: 'http://localhost:3000/auth/github/callback',
      microsoft: 'http://localhost:3000/auth/microsoft/callback',
      notion: 'http://localhost:3000/auth/notion/callback',
      stripe: 'http://localhost:3000/webhooks/stripe',
      zapier: 'http://localhost:3000/webhooks/zapier'
    }
  },

  // Vercel preview URLs
  preview: {
    base: 'https://flashfusion-unified.vercel.app',
    callbacks: {
      supabase: 'https://flashfusion-unified.vercel.app/auth/callback',
      google: 'https://flashfusion-unified.vercel.app/auth/google/callback',
      github: 'https://flashfusion-unified.vercel.app/auth/github/callback',
      microsoft: 'https://flashfusion-unified.vercel.app/auth/microsoft/callback',
      notion: 'https://flashfusion-unified.vercel.app/auth/notion/callback',
      stripe: 'https://flashfusion-unified.vercel.app/webhooks/stripe',
      zapier: 'https://flashfusion-unified.vercel.app/webhooks/zapier'
    }
  }
};

// Get environment-specific URLs
function getCallbackUrls(environment = 'production') {
  return CALLBACK_URLS[environment] || CALLBACK_URLS.production;
}

// Generate .env variables for callbacks
function generateEnvVariables(environment = 'production') {
  const urls = getCallbackUrls(environment);
  
  return `
# =============================================================================
# 🔗 AUTH CALLBACK URLS (${environment.toUpperCase()})
# =============================================================================

# Base URLs
APP_URL=${urls.base}
FRONTEND_URL=${urls.base}

# OAuth Callback URLs
SUPABASE_REDIRECT_URL=${urls.callbacks.supabase}
GOOGLE_OAUTH_REDIRECT_URI=${urls.callbacks.google}
GITHUB_OAUTH_REDIRECT_URI=${urls.callbacks.github}
MICROSOFT_OAUTH_REDIRECT_URI=${urls.callbacks.microsoft}
NOTION_OAUTH_REDIRECT_URI=${urls.callbacks.notion}

# Webhook URLs  
STRIPE_WEBHOOK_ENDPOINT=${urls.callbacks.stripe}
ZAPIER_WEBHOOK_ENDPOINT=${urls.callbacks.zapier}

# Additional Auth URLs
EMAIL_VERIFICATION_URL=${urls.base}/auth/verify-email
PASSWORD_RESET_URL=${urls.base}/auth/reset-password
MAGIC_LINK_URL=${urls.base}/auth/magic-link
`;
}

// Supabase Auth Configuration
function getSupabaseAuthConfig(environment = 'production') {
  const urls = getCallbackUrls(environment);
  
  return {
    // Site URL (main domain)
    site_url: urls.base,
    
    // Additional redirect URLs (comma-separated)
    additional_redirect_urls: [
      urls.callbacks.supabase,
      `${urls.base}/auth/confirm`,
      `${urls.base}/auth/verify`,
      `${urls.base}/dashboard`,
      // Add all environments for flexibility
      'http://localhost:3000/auth/callback',
      'https://flashfusion.co/auth/callback',
      'https://flashfusion-unified.vercel.app/auth/callback'
    ].join(', '),
    
    // OAuth provider settings
    oauth: {
      google: {
        enabled: true,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: urls.callbacks.google
      },
      github: {
        enabled: true,
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        redirect_uri: urls.callbacks.github
      },
      microsoft: {
        enabled: true,
        client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID,
        client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
        redirect_uri: urls.callbacks.microsoft
      }
    }
  };
}

// Fix Supabase URL
function getCorrectSupabaseUrl() {
  const currentUrl = process.env.SUPABASE_URL;
  
  // Extract project reference from the current URL if it's a dashboard URL
  if (currentUrl && currentUrl.includes('dashboard')) {
    console.log('⚠️  Detected dashboard URL instead of API URL');
    console.log('   Current:', currentUrl);
    console.log('   Expected format: https://[project-ref].supabase.co');
    
    // Try to extract project ref if possible
    const match = currentUrl.match(/project\/([a-zA-Z0-9]+)/);
    if (match) {
      const projectRef = match[1];
      const correctUrl = `https://${projectRef}.supabase.co`;
      console.log('   Suggested:', correctUrl);
      return correctUrl;
    }
  }
  
  return currentUrl;
}

// Provider-specific callback instructions
const PROVIDER_INSTRUCTIONS = {
  supabase: {
    title: 'Supabase Authentication',
    dashboard: 'https://supabase.com/dashboard/project/[your-project]/auth/settings',
    steps: [
      'Go to Authentication → Settings',
      'Set Site URL to your production domain',
      'Add redirect URLs for all environments',
      'Configure OAuth providers if needed'
    ]
  },
  
  google: {
    title: 'Google OAuth',
    dashboard: 'https://console.developers.google.com/apis/credentials',
    steps: [
      'Create OAuth 2.0 Client ID',
      'Add authorized redirect URIs',
      'Copy Client ID and Client Secret',
      'Add to your .env file'
    ]
  },
  
  github: {
    title: 'GitHub OAuth',
    dashboard: 'https://github.com/settings/applications/new',
    steps: [
      'Create new OAuth App',
      'Set Authorization callback URL',
      'Copy Client ID and Client Secret',
      'Add to your .env file'
    ]
  },
  
  notion: {
    title: 'Notion OAuth',
    dashboard: 'https://www.notion.so/my-integrations',
    steps: [
      'Create new integration',
      'Set redirect URI for OAuth',
      'Copy OAuth client credentials',
      'Add to your .env file'
    ]
  }
};

// Main configuration function
function displayCallbackConfig() {
  console.log('🔐 FlashFusion Auth Callback URL Configuration\n');
  console.log('═'.repeat(60));

  // Check Supabase URL
  const correctSupabaseUrl = getCorrectSupabaseUrl();
  if (correctSupabaseUrl !== process.env.SUPABASE_URL) {
    console.log('\n❌ Supabase URL Issue Detected:');
    console.log(`   Update SUPABASE_URL to: ${correctSupabaseUrl}\n`);
  }

  // Show URLs for each environment
  ['production', 'development', 'preview'].forEach(env => {
    const urls = getCallbackUrls(env);
    console.log(`\n📋 ${env.toUpperCase()} URLs:`);
    console.log(`   Base: ${urls.base}`);
    Object.entries(urls.callbacks).forEach(([provider, url]) => {
      console.log(`   ${provider}: ${url}`);
    });
  });

  // Provider setup instructions
  console.log('\n🔧 Provider Setup Instructions:');
  console.log('═'.repeat(60));
  
  Object.entries(PROVIDER_INSTRUCTIONS).forEach(([provider, config]) => {
    console.log(`\n📌 ${config.title}:`);
    console.log(`   Dashboard: ${config.dashboard}`);
    config.steps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
  });

  // Environment variables
  console.log('\n📝 Environment Variables to Add:');
  console.log('═'.repeat(60));
  console.log(generateEnvVariables('production'));
}

// Export functions
export { 
  CALLBACK_URLS, 
  getCallbackUrls, 
  getSupabaseAuthConfig, 
  generateEnvVariables,
  getCorrectSupabaseUrl
};

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  displayCallbackConfig();
}