#!/usr/bin/env node

/**
 * Setup Vercel Environment Variables
 * This script helps you quickly add all environment variables to Vercel
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read the current .env file
const envPath = path.join(__dirname, '..', '.env');
const envProdPath = path.join(__dirname, '..', '.env.production');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  process.exit(1);
}

console.log('🔧 Setting up Vercel environment variables...\n');

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

const variables = {};
lines.forEach(line => {
  // Skip comments and empty lines
  if (line.startsWith('#') || !line.trim()) return;
  
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim();
    // Skip placeholder values
    if (!value.includes('your_new_') && !value.includes('your_')) {
      variables[key.trim()] = value;
    }
  }
});

// Known values from your setup
const knownValues = {
  // Supabase (from your configuration)
  SUPABASE_URL: 'https://yfalwodlcfanjlsnahlx.supabase.co',
  
  // LangSmith
  LANGSMITH_TRACING: 'true',
  LANGSMITH_ENDPOINT: 'https://api.smith.langchain.com',
  LANGSMITH_PROJECT: 'FlashFusion',
  
  // Application
  NODE_ENV: 'production',
  APP_URL: 'https://flashfusion.vercel.app',
  
  // Security (generate if not exists)
  JWT_SECRET: variables.JWT_SECRET || generateSecret(32),
  ENCRYPTION_KEY: variables.ENCRYPTION_KEY || generateSecret(32),
  
  // Rate Limiting
  RATE_LIMIT_REQUESTS: '100',
  RATE_LIMIT_WINDOW: '60'
};

// Merge known values with existing env
Object.assign(variables, knownValues);

console.log('📋 Environment variables to set:\n');
Object.keys(variables).forEach(key => {
  const value = variables[key];
  const displayValue = key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN') 
    ? value.substring(0, 10) + '...' 
    : value;
  console.log(`  ${key} = ${displayValue}`);
});

console.log('\n⚠️  Important: You still need to add these API keys manually:');
console.log('  - OPENROUTER_API_KEY');
console.log('  - SUPABASE_ANON_KEY');
console.log('  - SUPABASE_SERVICE_ROLE_KEY');
console.log('  - OPENAI_API_KEY');
console.log('  - ANTHROPIC_API_KEY');
console.log('  - LANGSMITH_API_KEY');

console.log('\n📝 To add these to Vercel:');
console.log('1. Go to https://vercel.com/your-project/settings/environment-variables');
console.log('2. Add each variable for Production environment');
console.log('3. Redeploy your application\n');

// Generate Vercel CLI commands
console.log('🖥️  Or use Vercel CLI commands:\n');
Object.entries(variables).forEach(([key, value]) => {
  if (!value.includes('your_')) {
    console.log(`vercel env add ${key} production`);
  }
});

function generateSecret(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a production env template
const prodEnvContent = `# Production Environment Variables
# Generated on ${new Date().toISOString()}

${Object.entries(variables)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')}

# Add these manually with your actual keys:
OPENROUTER_API_KEY=your_openrouter_key_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
LANGSMITH_API_KEY=your_langsmith_key_here
`;

fs.writeFileSync(envProdPath, prodEnvContent);
console.log(`\n✅ Production env template saved to: .env.production`);
console.log('📌 Remember to update it with your actual API keys before deployment!');