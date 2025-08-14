#!/usr/bin/env node

// Environment Validation Script
// Verifies all required API keys and configuration

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvironment() {
  log('\n🔐 FlashFusion Environment Validation', 'cyan');
  log('=' .repeat(50), 'blue');

  const requiredVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  const optionalVars = [
    'LANGSMITH_API_KEY',
    'GITHUB_TOKEN',
    'GEMINI_API_KEY',
    'REPLIT_API_TOKEN'
  ];

  const securityVars = [
    'OPENAI_KEY_PREFIX',
    'ANTHROPIC_KEY_PREFIX',
    'MIN_API_KEY_LENGTH',
    'NODE_ENV'
  ];

  let errors = 0;
  let warnings = 0;

  // Check required variables
  log('\n📋 Required Variables:', 'yellow');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      log(`  ❌ ${varName}: Missing or placeholder`, 'red');
      errors++;
    } else {
      const masked = maskApiKey(value);
      log(`  ✅ ${varName}: ${masked}`, 'green');
    }
  });

  // Check optional variables
  log('\n🔧 Optional Variables:', 'yellow');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      log(`  ⚠️  ${varName}: Not configured`, 'yellow');
      warnings++;
    } else {
      const masked = maskApiKey(value);
      log(`  ✅ ${varName}: ${masked}`, 'green');
    }
  });

  // Check security configuration
  log('\n🛡️  Security Configuration:', 'yellow');
  securityVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`  ✅ ${varName}: ${value}`, 'green');
    } else {
      log(`  ⚠️  ${varName}: Using default`, 'yellow');
    }
  });

  // Validate API key formats
  log('\n🔑 API Key Format Validation:', 'yellow');
  
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) {
    const isValid = validateOpenAIKey(process.env.OPENAI_API_KEY);
    log(`  ${isValid ? '✅' : '❌'} OpenAI API Key format: ${isValid ? 'Valid' : 'Invalid'}`, isValid ? 'green' : 'red');
    if (!isValid) errors++;
  }

  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('your_')) {
    const isValid = validateAnthropicKey(process.env.ANTHROPIC_API_KEY);
    log(`  ${isValid ? '✅' : '❌'} Anthropic API Key format: ${isValid ? 'Valid' : 'Invalid'}`, isValid ? 'green' : 'red');
    if (!isValid) errors++;
  }

  // Summary
  log('\n📊 Validation Summary:', 'cyan');
  log(`  Errors: ${errors}`, errors > 0 ? 'red' : 'green');
  log(`  Warnings: ${warnings}`, warnings > 0 ? 'yellow' : 'green');

  if (errors === 0) {
    log('\n🎉 Environment validation passed!', 'green');
    return true;
  } else {
    log('\n❌ Environment validation failed. Please fix the errors above.', 'red');
    return false;
  }
}

function maskApiKey(key) {
  if (!key || key.length < 8) return '***';
  return `${key.substring(0, 4)}***${key.substring(key.length - 4)}`;
}

function validateOpenAIKey(key) {
  const prefix = process.env.OPENAI_KEY_PREFIX || 'sk-';
  const minLength = parseInt(process.env.MIN_API_KEY_LENGTH) || 20;
  return key.startsWith(prefix) && key.length >= minLength;
}

function validateAnthropicKey(key) {
  const prefix = process.env.ANTHROPIC_KEY_PREFIX || 'sk-ant-';
  const minLength = parseInt(process.env.MIN_API_KEY_LENGTH) || 20;
  return key.startsWith(prefix) && key.length >= minLength;
}

// Run validation if called directly
if (require.main === module) {
  const isValid = validateEnvironment();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateEnvironment };