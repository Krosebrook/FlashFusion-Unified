const fs = require('fs');
const path = require('path');

// Check for environment variables and API keys for commerce platforms
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('🛒 Commerce Platform Integration Test\n');

// Check .env.example for commerce-related variables
if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  const commerceVars = [
    'STRIPE_API_KEY',
    'STRIPE_SECRET_KEY', 
    'SHOPIFY_API_KEY',
    'AMAZON_ACCESS_KEY',
    'EBAY_API_KEY',
    'PAYPAL_CLIENT_ID'
  ];
  
  console.log('📋 Commerce Variables in .env.example:');
  commerceVars.forEach(varName => {
    if (envExample.includes(varName)) {
      console.log(`  ✅ ${varName}: Found in template`);
    } else {
      console.log(`  ❌ ${varName}: Not configured`);
    }
  });
}

// Check if .env exists and has commerce keys
if (fs.existsSync(envPath)) {
  console.log('\n🔑 Checking actual environment variables...');
  require('dotenv').config({ path: envPath });
  
  const commerceKeys = {
    'STRIPE_API_KEY': process.env.STRIPE_API_KEY,
    'SHOPIFY_API_KEY': process.env.SHOPIFY_API_KEY,
    'AMAZON_ACCESS_KEY': process.env.AMAZON_ACCESS_KEY,
    'EBAY_API_KEY': process.env.EBAY_API_KEY
  };
  
  Object.entries(commerceKeys).forEach(([key, value]) => {
    if (value) {
      console.log(`  ✅ ${key}: Configured (${value.substring(0, 8)}...)`);
    } else {
      console.log(`  ⚠️  ${key}: Not set`);
    }
  });
} else {
  console.log('\n⚠️  No .env file found - using environment defaults');
}

console.log('\n📊 Commerce Integration Status: Partial - Need API keys for full testing');