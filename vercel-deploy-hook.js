#!/usr/bin/env node

/**
 * Vercel Deploy Hook Generator & Trigger
 * Creates and manages Vercel deployment hooks for FlashFusion
 * 
 * Usage: 
 *   node vercel-deploy-hook.js create    # Create new deploy hook
 *   node vercel-deploy-hook.js trigger   # Trigger deployment
 *   node vercel-deploy-hook.js status    # Check deployment status
 */

const https = require('https');
const fs = require('fs');
require('dotenv').config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;

if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VERCEL_TOKEN');
  console.error('   - VERCEL_PROJECT_ID');
  console.error('   - VERCEL_ORG_ID (optional)');
  process.exit(1);
}

// Make Vercel API request
function vercelRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(`Vercel API Error: ${response.error?.message || body}`));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Create deployment hook
async function createDeployHook() {
  console.log('🚀 Creating Vercel Deploy Hook...\n');

  try {
    const hookData = {
      name: 'FlashFusion Auto Deploy',
      ref: 'master', // your default branch
      // Add specific conditions if needed
    };

    const teamParam = VERCEL_ORG_ID ? `?teamId=${VERCEL_ORG_ID}` : '';
    const hook = await vercelRequest(
      `/v1/projects/${VERCEL_PROJECT_ID}/hooks${teamParam}`,
      'POST',
      hookData
    );

    console.log('✅ Deploy Hook Created Successfully!');
    console.log(`📋 Hook ID: ${hook.id}`);
    console.log(`🔗 Hook URL: ${hook.url}`);
    console.log(`📅 Created: ${new Date(hook.createdAt).toLocaleString()}\n`);

    // Save hook info
    const hookInfo = {
      id: hook.id,
      url: hook.url,
      name: hook.name,
      ref: hook.ref,
      createdAt: hook.createdAt,
      projectId: VERCEL_PROJECT_ID
    };

    fs.writeFileSync('.vercel-hook.json', JSON.stringify(hookInfo, null, 2));
    console.log('💾 Hook details saved to .vercel-hook.json');
    
    return hook;
  } catch (error) {
    console.error('❌ Failed to create deploy hook:', error.message);
    process.exit(1);
  }
}

// Trigger deployment
async function triggerDeploy() {
  console.log('🚀 Triggering Deployment...\n');

  let hookUrl;
  
  // Try to load saved hook first
  if (fs.existsSync('.vercel-hook.json')) {
    const hookInfo = JSON.parse(fs.readFileSync('.vercel-hook.json', 'utf8'));
    hookUrl = hookInfo.url;
    console.log(`📋 Using saved hook: ${hookInfo.name}`);
  } else {
    console.log('⚠️  No saved hook found. Creating new one...');
    const hook = await createDeployHook();
    hookUrl = hook.url;
  }

  // Trigger the hook
  try {
    const url = new URL(hookUrl);
    const deployData = {
      ref: 'main', // or your branch
      // Add any additional deployment parameters
    };

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      });
      
      req.on('error', reject);
      req.write(JSON.stringify(deployData));
      req.end();
    });

    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Deployment triggered successfully!');
      console.log('🔗 Check status at: https://vercel.com/dashboard');
    } else {
      console.error('❌ Deploy trigger failed:', response.body);
    }
  } catch (error) {
    console.error('❌ Failed to trigger deployment:', error.message);
  }
}

// Check deployment status
async function checkStatus() {
  console.log('📊 Checking Deployment Status...\n');

  try {
    const teamParam = VERCEL_ORG_ID ? `?teamId=${VERCEL_ORG_ID}` : '';
    const deployments = await vercelRequest(`/v6/deployments${teamParam}&projectId=${VERCEL_PROJECT_ID}&limit=5`);

    console.log('📋 Recent Deployments:');
    console.log('═══════════════════════════════════════\n');

    deployments.deployments.forEach((deploy, index) => {
      const status = deploy.readyState === 'READY' ? '✅' : 
                    deploy.readyState === 'ERROR' ? '❌' : 
                    deploy.readyState === 'BUILDING' ? '🔄' : '⏳';
      
      console.log(`${index + 1}. ${status} ${deploy.readyState}`);
      console.log(`   📅 ${new Date(deploy.createdAt).toLocaleString()}`);
      console.log(`   🌐 ${deploy.url || 'N/A'}`);
      console.log(`   📝 ${deploy.meta?.githubCommitMessage || 'No commit message'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to check status:', error.message);
  }
}

// Main function
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      await createDeployHook();
      break;
    case 'trigger':
      await triggerDeploy();
      break;
    case 'status':
      await checkStatus();
      break;
    default:
      console.log('🚀 Vercel Deploy Hook Manager\n');
      console.log('Usage:');
      console.log('  node vercel-deploy-hook.js create    # Create new deploy hook');
      console.log('  node vercel-deploy-hook.js trigger   # Trigger deployment');
      console.log('  node vercel-deploy-hook.js status    # Check deployment status');
      console.log('\nMake sure your .env file has:');
      console.log('  - VERCEL_TOKEN');
      console.log('  - VERCEL_PROJECT_ID');
      console.log('  - VERCEL_ORG_ID (optional)');
  }
}

main().catch(console.error);