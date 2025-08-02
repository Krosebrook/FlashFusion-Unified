#!/usr/bin/env node

/**
 * FlashFusion Environment Setup Script
 * Generates secure .env file from .env.example template
 * 
 * Usage: node setup-env.js
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate secure random strings
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWT() {
  return crypto.randomBytes(32).toString('base64url');
}

// Prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupEnvironment() {
  console.log('🚀 FlashFusion Environment Setup');
  console.log('================================\n');

  // Check if .env already exists
  if (fs.existsSync('.env')) {
    const overwrite = await prompt('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  // Read template
  if (!fs.existsSync('.env.example')) {
    console.error('❌ .env.example not found. Please ensure it exists.');
    rl.close();
    return;
  }

  let envContent = fs.readFileSync('.env.example', 'utf8');

  console.log('🔐 Generating secure secrets...\n');

  // Generate secure values
  const secrets = {
    JWT_SECRET: generateJWT(),
    JWT_REFRESH_SECRET: generateJWT(),
    SESSION_SECRET: generateSecret(32),
    COOKIE_SECRET: generateSecret(32),
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex').substring(0, 32)
  };

  // Replace placeholder secrets
  for (const [key, value] of Object.entries(secrets)) {
    const regex = new RegExp(`${key}=.*`, 'g');
    envContent = envContent.replace(regex, `${key}=${value}`);
  }

  // Interactive API key setup
  console.log('🔑 API Key Configuration');
  console.log('========================\n');

  const apiKeys = [
    { key: 'ANTHROPIC_API_KEY', name: 'Anthropic Claude API', optional: false },
    { key: 'OPENAI_API_KEY', name: 'OpenAI API', optional: true },
    { key: 'SUPABASE_URL', name: 'Supabase URL', optional: true },
    { key: 'SUPABASE_ANON_KEY', name: 'Supabase Anon Key', optional: true },
    { key: 'VERCEL_TOKEN', name: 'Vercel Token', optional: true },
    { key: 'DATABASE_URL', name: 'Database URL (PostgreSQL)', optional: true }
  ];

  for (const api of apiKeys) {
    const required = api.optional ? ' (optional)' : ' (required)';
    const value = await prompt(`Enter ${api.name}${required}: `);
    
    if (value.trim()) {
      const regex = new RegExp(`${api.key}=.*`, 'g');
      envContent = envContent.replace(regex, `${api.key}=${value.trim()}`);
    }
  }

  // Write .env file
  fs.writeFileSync('.env', envContent);

  console.log('\n✅ Environment setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Review your .env file');
  console.log('2. Add any additional API keys as needed');
  console.log('3. Start your development server');
  console.log('\n🔒 Security reminders:');
  console.log('- Never commit .env files');
  console.log('- Use different secrets for production');
  console.log('- Rotate secrets regularly');
  console.log('- Keep API keys secure');

  rl.close();
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});

// Run setup
setupEnvironment().catch(console.error);