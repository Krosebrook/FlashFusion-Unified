#!/usr/bin/env node

/**
 * Test GitHub OAuth Configuration
 * Usage: node test-github-oauth.js
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_OAUTH_REDIRECT_URI;

function testGitHubOAuth() {
  console.log('🐙 Testing GitHub OAuth Configuration\n');

  // Check environment variables
  console.log('📋 Configuration Check:');
  console.log(`   Client ID: ${GITHUB_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Client Secret: ${GITHUB_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Redirect URI: ${REDIRECT_URI || '❌ Missing'}\n`);

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.log('❌ Missing GitHub OAuth credentials in .env file');
    return;
  }

  // Generate OAuth authorization URL
  const scope = 'user:email,repo,read:org';
  const state = Math.random().toString(36).substring(2, 15);
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${state}`;

  console.log('🔗 GitHub OAuth Authorization URL:');
  console.log(`   ${authUrl}\n`);

  console.log('🧪 Test Steps:');
  console.log('1. Click the URL above (or copy/paste to browser)');
  console.log('2. Authorize FlashFusion app');
  console.log('3. You should be redirected to your callback URL');
  console.log('4. Check that the callback URL works\n');

  console.log('📋 Expected Flow:');
  console.log('   User clicks → GitHub login → Authorize → Callback URL with code');
  console.log('   Your app exchanges code for access token');
  console.log('   Use access token to get user info from GitHub API\n');

  // Test GitHub API accessibility
  testGitHubAPI();
}

async function testGitHubAPI() {
  console.log('🔍 Testing GitHub API Access...');
  
  try {
    const response = await makeRequest({
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'User-Agent': 'FlashFusion-OAuth-Test',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.statusCode === 401) {
      console.log('✅ GitHub API accessible (401 expected without token)');
    } else {
      console.log(`✅ GitHub API response: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ GitHub API error: ${error.message}`);
  }
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Run test
testGitHubOAuth();