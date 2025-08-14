#!/usr/bin/env node

/**
 * FlashFusion GoDaddy Website Integration Setup
 * Connects FlashFusion to GoDaddy domains and hosting
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

// GoDaddy API configuration
const GODADDY_API_KEY = process.env.GODADDY_API_KEY;
const GODADDY_API_SECRET = process.env.GODADDY_API_SECRET;

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
          log('cyan', `   API Access: Working`);
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
                if (domain.expires) {
                  log('yellow', `      Expires: ${new Date(domain.expires).toLocaleDateString()}`);
                }
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
      log('red', `   Error: ${error.message}`);
      resolve(null);
    });

    req.end();
  });
}

// Interactive setup for GoDaddy credentials
async function interactiveGoDaddySetup() {
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

// Update .env file with GoDaddy credentials
function updateEnvWithGoDaddy(apiKey, apiSecret) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the GoDaddy credentials
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

// Create GoDaddy service integration
function createGoDaddyService() {
  log('blue', '\n🔧 Creating GoDaddy Service Integration...');
  console.log('────────────────────────────────────────────────────');

  const serviceCode = `/**
 * FlashFusion GoDaddy Service
 * Manages domain operations and website integration
 */

class GoDaddyService {
  constructor() {
    this.apiKey = process.env.GODADDY_API_KEY;
    this.apiSecret = process.env.GODADDY_API_SECRET;
    this.baseUrl = 'https://api.godaddy.com/v1';
  }

  // Get authorization header
  getAuthHeader() {
    return \`sso-key \${this.apiKey}:\${this.apiSecret}\`;
  }

  // List all domains
  async getDomains() {
    try {
      const response = await fetch(\`\${this.baseUrl}/domains\`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(\`GoDaddy API error: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }
  }

  // Get domain details
  async getDomainDetails(domain) {
    try {
      const response = await fetch(\`\${this.baseUrl}/domains/\${domain}\`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(\`GoDaddy API error: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching domain details:', error);
      throw error;
    }
  }

  // Get DNS records
  async getDNSRecords(domain) {
    try {
      const response = await fetch(\`\${this.baseUrl}/domains/\${domain}/records\`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(\`GoDaddy API error: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching DNS records:', error);
      throw error;
    }
  }

  // Update DNS records (for FlashFusion deployment)
  async updateDNSRecord(domain, recordType, name, data) {
    try {
      const response = await fetch(\`\${this.baseUrl}/domains/\${domain}/records/\${recordType}/\${name}\`, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          data: data,
          ttl: 3600
        }])
      });
      
      if (!response.ok) {
        throw new Error(\`GoDaddy API error: \${response.status}\`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating DNS record:', error);
      throw error;
    }
  }

  // Check if domain is ready for FlashFusion deployment
  async checkDeploymentReadiness(domain) {
    try {
      const details = await this.getDomainDetails(domain);
      const dnsRecords = await this.getDNSRecords(domain);
      
      return {
        domain: domain,
        status: details.status,
        expires: details.expires,
        nameServers: details.nameServers,
        dnsRecords: dnsRecords,
        readyForDeployment: details.status === 'ACTIVE'
      };
    } catch (error) {
      console.error('Error checking deployment readiness:', error);
      throw error;
    }
  }
}

module.exports = GoDaddyService;`;

  try {
    const servicePath = path.join(process.cwd(), 'server', 'services', 'godaddyService.js');
    fs.writeFileSync(servicePath, serviceCode);
    log('green', '✅ GoDaddy service created: server/services/godaddyService.js');
    return true;
  } catch (error) {
    log('red', `❌ Failed to create GoDaddy service: ${error.message}`);
    return false;
  }
}

// Create GoDaddy API routes
function createGoDaddyRoutes() {
  const routeCode = `/**
 * FlashFusion GoDaddy API Routes
 * Provides endpoints for domain management
 */

const express = require('express');
const GoDaddyService = require('../services/godaddyService');
const router = express.Router();

const godaddyService = new GoDaddyService();

// Get all domains
router.get('/domains', async (req, res) => {
  try {
    const domains = await godaddyService.getDomains();
    res.json({
      success: true,
      data: domains
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get domain details
router.get('/domains/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const details = await godaddyService.getDomainDetails(domain);
    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get DNS records
router.get('/domains/:domain/dns', async (req, res) => {
  try {
    const { domain } = req.params;
    const records = await godaddyService.getDNSRecords(domain);
    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check deployment readiness
router.get('/domains/:domain/deployment-check', async (req, res) => {
  try {
    const { domain } = req.params;
    const readiness = await godaddyService.checkDeploymentReadiness(domain);
    res.json({
      success: true,
      data: readiness
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;`;

  try {
    const routePath = path.join(process.cwd(), 'server', 'routes', 'godaddy.js');
    fs.writeFileSync(routePath, routeCode);
    log('green', '✅ GoDaddy routes created: server/routes/godaddy.js');
    return true;
  } catch (error) {
    log('red', `❌ Failed to create GoDaddy routes: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log('bold', '\n🚀 FlashFusion GoDaddy Integration Setup');
  console.log('═══════════════════════════════════════════════════════════════');

  // Check if GoDaddy credentials are already configured
  const hasValidCredentials = GODADDY_API_KEY && 
                             GODADDY_API_SECRET && 
                             !GODADDY_API_KEY.includes('your_new') && 
                             !GODADDY_API_SECRET.includes('your_new');

  let apiKey = GODADDY_API_KEY;
  let apiSecret = GODADDY_API_SECRET;

  if (!hasValidCredentials) {
    log('yellow', '⚠️  GoDaddy credentials not configured or using placeholders');
    const credentials = await interactiveGoDaddySetup();
    apiKey = credentials.apiKey;
    apiSecret = credentials.apiSecret;
    
    if (apiKey && apiSecret) {
      updateEnvWithGoDaddy(apiKey, apiSecret);
    } else {
      log('red', '❌ Setup cancelled - no credentials provided');
      process.exit(1);
    }
  } else {
    log('green', '✅ GoDaddy credentials found in .env file');
  }

  // Test GoDaddy connection
  const connected = await testGoDaddyConnection(apiKey, apiSecret);
  
  if (!connected) {
    log('red', '\n❌ Failed to connect to GoDaddy API');
    log('yellow', '💡 Please check your API credentials');
    process.exit(1);
  }

  // Get user's domains
  const domains = await getUserDomains(apiKey, apiSecret);
  
  // Create service integration files
  const serviceCreated = createGoDaddyService();
  const routesCreated = createGoDaddyRoutes();

  // Summary
  log('green', '\n🎉 GoDaddy Integration Setup Complete!');
  log('cyan', '\n📊 Setup Summary:');
  console.log('────────────────────────────────────────────────────');
  log('green', `✅ API Connection: Working`);
  log('green', `✅ Domains Found: ${domains ? domains.length : 0}`);
  log(serviceCreated ? 'green' : 'red', `${serviceCreated ? '✅' : '❌'} Service Integration`);
  log(routesCreated ? 'green' : 'red', `${routesCreated ? '✅' : '❌'} API Routes`);
  
  if (connected && domains) {
    log('blue', '\n🚀 Next Steps:');
    log('cyan', '   • Restart FlashFusion server to load GoDaddy integration');
    log('cyan', '   • Test endpoints: GET /api/godaddy/domains');
    log('cyan', '   • Configure domain for FlashFusion deployment');
    log('cyan', '   • Set up DNS records for production hosting');
    
    log('blue', '\n🌐 Available Endpoints:');
    log('yellow', '   GET /api/godaddy/domains - List your domains');
    log('yellow', '   GET /api/godaddy/domains/:domain - Domain details');
    log('yellow', '   GET /api/godaddy/domains/:domain/dns - DNS records');
    log('yellow', '   GET /api/godaddy/domains/:domain/deployment-check - Deployment readiness');
    
    log('green', '\n✨ FlashFusion is now connected to your GoDaddy account! ✨');
  }
}

// Run the setup
main().catch(console.error);