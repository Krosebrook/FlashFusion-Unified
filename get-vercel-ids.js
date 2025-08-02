#!/usr/bin/env node

/**
 * Get Vercel Project and Org IDs
 * Usage: node get-vercel-ids.js
 */

import https from 'https';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN required in .env file');
  process.exit(1);
}

function vercelRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path,
      method: 'GET',
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
            reject(new Error(`API Error: ${response.error?.message || body}`));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function getIDs() {
  try {
    console.log('🔍 Fetching Vercel IDs...\n');
    
    // Get teams/orgs
    const teams = await vercelRequest('/v2/teams');
    console.log('📋 Organizations:');
    teams.teams.forEach(team => {
      console.log(`   • ${team.name} (ID: ${team.id})`);
    });

    // Get projects
    const projects = await vercelRequest('/v9/projects');
    console.log('\n📋 Projects:');
    projects.projects.forEach(project => {
      console.log(`   • ${project.name} (ID: ${project.id})`);
      if (project.name === 'flashfusion-unified') {
        console.log(`     ✅ FlashFusion Project ID: ${project.id}`);
      }
    });

    // Find MiniDrama org ID
    const miniDrama = teams.teams.find(t => t.name === 'MiniDrama');
    if (miniDrama) {
      console.log(`\n✅ MiniDrama Org ID: ${miniDrama.id}`);
    }

    const flashfusion = projects.projects.find(p => p.name === 'flashfusion-unified');
    
    console.log('\n📋 Use these in your .env:');
    console.log(`VERCEL_ORG_ID=${miniDrama?.id || 'MINI_DRAMA_ID_HERE'}`);
    console.log(`VERCEL_PROJECT_ID=${flashfusion?.id || 'FLASHFUSION_PROJECT_ID_HERE'}`);

  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.log('\n🔧 Manual method:');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. URL will show: /[ORG_ID]/[PROJECT_NAME]');
    console.log('3. Or check project settings for exact IDs');
  }
}

getIDs();