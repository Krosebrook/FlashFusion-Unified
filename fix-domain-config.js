#!/usr/bin/env node

/**
 * FlashFusion Domain Configuration Fix
 * Diagnoses and fixes flashfusion.co domain validation issues
 * 
 * Usage: node fix-domain-config.js
 */

import https from 'https';
import dns from 'dns';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);
const resolveCname = promisify(dns.resolveCname);

const DOMAIN = 'flashfusion.co';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;

// Check DNS records
async function checkDNS() {
  console.log('🔍 Checking DNS Records for flashfusion.co...\n');

  try {
    // Check A records
    console.log('📍 A Records:');
    try {
      const aRecords = await resolve4(DOMAIN);
      aRecords.forEach(ip => console.log(`   ${ip}`));
    } catch (e) {
      console.log('   ❌ No A records found');
    }

    // Check CNAME records
    console.log('\n📍 CNAME Records:');
    try {
      const cnameRecords = await resolveCname(DOMAIN);
      cnameRecords.forEach(cname => console.log(`   ${cname}`));
    } catch (e) {
      console.log('   ❌ No CNAME records found');
    }

    // Check TXT records
    console.log('\n📍 TXT Records:');
    try {
      const txtRecords = await resolveTxt(DOMAIN);
      txtRecords.forEach(txt => console.log(`   ${txt.join('')}`));
    } catch (e) {
      console.log('   ❌ No TXT records found');
    }

    // Check www subdomain
    console.log('\n📍 WWW Subdomain:');
    try {
      const wwwRecords = await resolveCname(`www.${DOMAIN}`);
      wwwRecords.forEach(cname => console.log(`   www -> ${cname}`));
    } catch (e) {
      console.log('   ❌ No www CNAME found');
    }

  } catch (error) {
    console.error('❌ DNS check failed:', error.message);
  }
}

// Vercel API request
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

// Check Vercel domain status
async function checkVercelDomain() {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    console.log('⚠️  Vercel credentials not configured - skipping Vercel check');
    return;
  }

  console.log('\n🔍 Checking Vercel Domain Configuration...\n');

  try {
    const teamParam = VERCEL_ORG_ID ? `?teamId=${VERCEL_ORG_ID}` : '';
    
    // Get project domains
    const project = await vercelRequest(`/v9/projects/${VERCEL_PROJECT_ID}${teamParam}`);
    
    console.log('📋 Project Domains:');
    if (project.alias && project.alias.length > 0) {
      project.alias.forEach(domain => {
        console.log(`   • ${domain}`);
      });
    } else {
      console.log('   ❌ No custom domains configured');
    }

    // Check if flashfusion.co is added
    const hasFlashFusion = project.alias?.includes('flashfusion.co') || 
                          project.alias?.includes('www.flashfusion.co');
    
    if (!hasFlashFusion) {
      console.log('\n⚠️  flashfusion.co not found in project domains');
      console.log('   Need to add domain to Vercel project');
    }

    // Get domain details
    try {
      const domains = await vercelRequest(`/v6/domains${teamParam}`);
      const flashfusionDomain = domains.domains?.find(d => 
        d.name === 'flashfusion.co' || d.name === 'www.flashfusion.co'
      );

      if (flashfusionDomain) {
        console.log('\n📋 Domain Status:');
        console.log(`   • Name: ${flashfusionDomain.name}`);
        console.log(`   • Verified: ${flashfusionDomain.verified ? '✅' : '❌'}`);
        console.log(`   • Created: ${new Date(flashfusionDomain.createdAt).toLocaleString()}`);
      }
    } catch (e) {
      console.log('\n⚠️  Could not fetch domain details');
    }

  } catch (error) {
    console.error('❌ Vercel check failed:', error.message);
  }
}

// Add domain to Vercel
async function addDomainToVercel() {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    console.log('❌ Missing Vercel credentials');
    return;
  }

  console.log('\n🚀 Adding flashfusion.co to Vercel project...\n');

  try {
    const teamParam = VERCEL_ORG_ID ? `?teamId=${VERCEL_ORG_ID}` : '';
    
    // Add apex domain
    const apexDomain = await vercelRequest(
      `/v10/projects/${VERCEL_PROJECT_ID}/domains${teamParam}`,
      'POST',
      { name: 'flashfusion.co' }
    );

    console.log('✅ Added flashfusion.co');

    // Add www subdomain
    const wwwDomain = await vercelRequest(
      `/v10/projects/${VERCEL_PROJECT_ID}/domains${teamParam}`,
      'POST',
      { name: 'www.flashfusion.co' }
    );

    console.log('✅ Added www.flashfusion.co');

    console.log('\n📋 Next Steps:');
    console.log('1. Configure DNS records at your domain registrar');
    console.log('2. Wait for DNS propagation (up to 48 hours)');
    console.log('3. Verify domain in Vercel dashboard');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Domain already added to Vercel');
    } else {
      console.error('❌ Failed to add domain:', error.message);
    }
  }
}

// Show DNS configuration instructions
function showDNSInstructions() {
  console.log('\n📋 Required DNS Configuration');
  console.log('═══════════════════════════════════════\n');

  console.log('🏷️  **At your domain registrar (GoDaddy, etc.):**\n');

  console.log('**A Records:**');
  console.log('   Type: A');
  console.log('   Name: @ (or flashfusion.co)');
  console.log('   Value: 76.76.19.61\n');

  console.log('**CNAME Records:**');
  console.log('   Type: CNAME');
  console.log('   Name: www');
  console.log('   Value: cname.vercel-dns.com\n');

  console.log('**Alternative CNAME Setup:**');
  console.log('   Type: CNAME');
  console.log('   Name: @ (or flashfusion.co)');
  console.log('   Value: cname.vercel-dns.com\n');

  console.log('🔗 **Vercel Dashboard Links:**');
  console.log(`   • Project: https://vercel.com/dashboard`);
  console.log(`   • Domains: https://vercel.com/dashboard/domains`);
  console.log('\n⏱️  **DNS Propagation:** Can take up to 48 hours');
}

async function main() {
  console.log('🌐 FlashFusion.co Domain Configuration\n');

  await checkDNS();
  await checkVercelDomain();

  const command = process.argv[2];
  
  if (command === 'add') {
    await addDomainToVercel();
  }

  showDNSInstructions();
}

main().catch(console.error);