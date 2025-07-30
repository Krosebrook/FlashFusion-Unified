#!/usr/bin/env node

/**
 * Test GoDaddy API connections with provided keys
 */

const https = require('https');

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
async function testGoDaddyAPI(apiKey, apiSecret, keyName) {
  log('blue', `\n🌐 Testing ${keyName}...`);
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
          log('green', `✅ ${keyName}: Connection successful!`);
          log('cyan', `   Status: ${res.statusCode}`);
          resolve({ success: true, keyName, status: res.statusCode });
        } else {
          log('red', `❌ ${keyName}: API error ${res.statusCode}`);
          log('yellow', `   Response: ${data.substring(0, 100)}...`);
          resolve({ success: false, keyName, status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', (error) => {
      log('red', `❌ ${keyName}: Connection error`);
      log('red', `   Error: ${error.message}`);
      resolve({ success: false, keyName, error: error.message });
    });

    req.setTimeout(10000, () => {
      log('red', `❌ ${keyName}: Request timeout`);
      resolve({ success: false, keyName, error: 'timeout' });
    });

    req.end();
  });
}

// Get domains using working API key
async function getDomains(apiKey, apiSecret, keyName) {
  log('blue', `\n📋 Fetching domains with ${keyName}...`);
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
              log('green', `✅ Found ${domains.length} domain(s):`);
              domains.forEach((domain, index) => {
                log('cyan', `   ${index + 1}. ${domain.domain} (Status: ${domain.status})`);
                if (domain.expires) {
                  log('yellow', `      Expires: ${new Date(domain.expires).toLocaleDateString()}`);
                }
              });
              resolve(domains);
            } else {
              log('yellow', '⚠️  No domains found');
              resolve([]);
            }
          } else {
            log('red', `❌ Failed to fetch domains: ${res.statusCode}`);
            resolve(null);
          }
        } catch (error) {
          log('red', `❌ Failed to parse response: ${error.message}`);
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

// Main execution
async function main() {
  log('bold', '\n🚀 FlashFusion GoDaddy API Connection Test');
  console.log('═══════════════════════════════════════════════════════════════');

  // Test all provided API key sets
  const apiKeys = [
    {
      name: 'Primary API Key',
      key: process.env.GODADDY_API_KEY,
      secret: process.env.GODADDY_API_SECRET
    },
    {
      name: 'Production Key',
      key: process.env.GODADDY_PRODUCTION_KEY,
      secret: process.env.GODADDY_PRODUCTION_SECRET
    },
    {
      name: 'Replit Key',
      key: process.env.GODADDY_REPLIT_KEY,
      secret: process.env.GODADDY_REPLIT_SECRET
    }
  ];

  const results = [];

  // Test each API key set
  for (const apiKeySet of apiKeys) {
    if (apiKeySet.key && apiKeySet.secret) {
      const result = await testGoDaddyAPI(apiKeySet.key, apiKeySet.secret, apiKeySet.name);
      results.push(result);
    } else {
      log('yellow', `⚠️  ${apiKeySet.name}: Missing credentials`);
    }
  }

  // Find working API key and get domains
  const workingKey = results.find(r => r.success);
  let domains = null;

  if (workingKey) {
    const keySet = apiKeys.find(k => k.name === workingKey.keyName);
    domains = await getDomains(keySet.key, keySet.secret, workingKey.keyName);
  }

  // Summary
  log('green', '\n🎉 GoDaddy Connection Test Complete!');
  log('cyan', '\n📊 Results Summary:');
  console.log('────────────────────────────────────────────────────');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(color, `${status} ${result.keyName}: ${result.success ? 'Working' : 'Failed'}`);
  });

  const workingKeys = results.filter(r => r.success).length;
  log('cyan', `\nWorking API Keys: ${workingKeys}/${results.length}`);
  
  if (domains) {
    log('cyan', `Domains Found: ${domains.length}`);
  }

  if (workingKeys > 0) {
    log('blue', '\n🚀 Next Steps:');
    log('cyan', '   • GoDaddy integration is ready!');
    log('cyan', '   • You can now manage domains through FlashFusion');
    log('cyan', '   • Deploy projects to your GoDaddy domains');
    log('cyan', '   • Access domain management APIs');
    
    log('green', '\n✨ FlashFusion <-> GoDaddy connection established! ✨');
  } else {
    log('red', '\n❌ No working GoDaddy API keys found');
    log('yellow', '💡 Please verify your API credentials with GoDaddy');
  }
}

main().catch(console.error);