#!/usr/bin/env node

/**
 * FlashFusion GoDaddy Website Connection
 * Simple setup for GoDaddy integration
 */

const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Load environment variables
require('dotenv').config();

// Test GoDaddy API connection
async function testGoDaddyConnection(apiKey, apiSecret) {
  log('blue', '\n🌐 Testing GoDaddy API Connection...');
  console.log('────────────────────────────────────────────────────');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.godaddy.com',
      path: '/v1/domains/available?domain=example.com',
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          log('green', '✅ GoDaddy API connection successful!');
          log('cyan', `   Status: ${res.statusCode}`);
          resolve(true);
        } else {
          log('red', `❌ GoDaddy API error: ${res.statusCode}`);
          log('yellow', `   Response: ${data.substring(0, 200)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ GoDaddy connection error');
      log('red', `   Error: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      log('red', '❌ GoDaddy request timeout');
      resolve(false);
    });

    req.end();
  });
}

// Get user's domains
async function getUserDomains(apiKey, apiSecret) {
  log('blue', '\n📋 Fetching Your GoDaddy Domains...');
  console.log('────────────────────────────────────────────────────');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.godaddy.com',
      path: '/v1/domains',
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const domains = JSON.parse(data);
            
            if (domains.length > 0) {
              log('green', `✅ Found ${domains.length} domain(s) in your account:`);
              domains.forEach((domain, index) => {
                log('cyan', `   ${index + 1}. ${domain.domain} (Status: ${domain.status})`);
              });
              resolve(domains);
            } else {
              log('yellow', '⚠️  No domains found in your GoDaddy account');
              resolve([]);
            }
          } else {
            log('red', `❌ Failed to fetch domains: ${res.statusCode}`);
            resolve(null);
          }
        } catch (error) {
          log('red', `❌ Failed to parse domains response: ${error.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ Error fetching domains');
      resolve(null);
    });

    req.end();
  });
}

// Interactive setup
async function getGoDaddyCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  log('cyan', '\n🔐 GoDaddy API Credentials Setup');
  console.log('════════════════════════════════════════════════════');
  
  log('yellow', '📋 To get your GoDaddy API credentials:');
  log('cyan', '   1. Go to https://developer.godaddy.com/');
  log('cyan', '   2. Sign in with your GoDaddy account');
  log('cyan', '   3. Navigate to "My Production Keys"');
  log('cyan', '   4. Create a new API key if needed');
  log('cyan', '   5. Copy both the API Key and Secret');

  console.log('\n');
  const apiKey = await question('🔑 Enter your GoDaddy API Key: ');
  const apiSecret = await question('🔐 Enter your GoDaddy API Secret: ');

  rl.close();

  return { 
    apiKey: apiKey.trim(), 
    apiSecret: apiSecret.trim() 
  };
}

// Update .env file
function updateEnvFile(apiKey, apiSecret) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(
      /GODADDY_API_KEY=.*/,
      `GODADDY_API_KEY=${apiKey}`
    );
    envContent = envContent.replace(
      /GODADDY_API_SECRET=.*/,
      `GODADDY_API_SECRET=${apiSecret}`
    );
    
    fs.writeFileSync(envPath, envContent);
    log('green', '✅ .env file updated with GoDaddy credentials');
    return true;
  } catch (error) {
    log('red', `❌ Failed to update .env file: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log('bold', '\n🚀 FlashFusion GoDaddy Website Connection');
  console.log('═══════════════════════════════════════════════════════════════');

  // Check current credentials
  const currentKey = process.env.GODADDY_API_KEY;
  const currentSecret = process.env.GODADDY_API_SECRET;
  
  const hasValidCredentials = currentKey && 
                             currentSecret && 
                             !currentKey.includes('your_new') && 
                             !currentSecret.includes('your_new');

  let apiKey = currentKey;
  let apiSecret = currentSecret;

  if (!hasValidCredentials) {
    log('yellow', '⚠️  GoDaddy credentials need to be configured');
    const credentials = await getGoDaddyCredentials();
    apiKey = credentials.apiKey;
    apiSecret = credentials.apiSecret;
    
    if (apiKey && apiSecret) {
      updateEnvFile(apiKey, apiSecret);
    } else {
      log('red', '❌ Setup cancelled - no credentials provided');
      process.exit(1);
    }
  } else {
    log('green', '✅ GoDaddy credentials found in .env file');
  }

  // Test connection
  const connected = await testGoDaddyConnection(apiKey, apiSecret);
  
  if (!connected) {
    log('red', '\n❌ Failed to connect to GoDaddy API');
    log('yellow', '💡 Please check your API credentials');
    process.exit(1);
  }

  // Get domains
  const domains = await getUserDomains(apiKey, apiSecret);
  
  // Summary
  log('green', '\n🎉 GoDaddy Connection Complete!');
  log('cyan', '\n📊 Connection Summary:');
  console.log('────────────────────────────────────────────────────');
  log('green', `✅ API Connection: Working`);
  log('green', `✅ Domains Found: ${domains ? domains.length : 0}`);
  
  if (domains && domains.length > 0) {
    log('blue', '\n🌐 Your Domains:');
    domains.forEach((domain, index) => {
      log('cyan', `   ${index + 1}. ${domain.domain}`);
      log('yellow', `      Status: ${domain.status}`);
      if (domain.expires) {
        log('yellow', `      Expires: ${new Date(domain.expires).toLocaleDateString()}`);
      }
    });
  }
  
  log('blue', '\n🚀 Next Steps:');
  log('cyan', '   • Your GoDaddy account is now connected to FlashFusion');
  log('cyan', '   • You can manage domains through the FlashFusion interface');
  log('cyan', '   • Deploy FlashFusion projects to your domains');
  log('cyan', '   • Manage DNS settings programmatically');
  
  log('green', '\n✨ FlashFusion <-> GoDaddy integration ready! ✨');
}

main().catch(console.error);