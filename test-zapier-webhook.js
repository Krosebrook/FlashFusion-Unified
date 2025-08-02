#!/usr/bin/env node

/**
 * Test Zapier Webhook
 * Usage: node test-zapier-webhook.js [webhook-url]
 */

import https from 'https';

const webhookUrl = process.argv[2] || process.env.ZAPIER_WEBHOOK_URL;

if (!webhookUrl) {
  console.error('❌ Please provide webhook URL:');
  console.error('   node test-zapier-webhook.js https://hooks.zapier.com/hooks/catch/...');
  console.error('   Or set ZAPIER_WEBHOOK_URL in .env');
  process.exit(1);
}

// Test data to send
const testData = {
  event: 'test',
  timestamp: new Date().toISOString(),
  user: 'FlashFusion Test',
  message: 'Hello from FlashFusion!',
  data: {
    project: 'flashfusion-unified',
    status: 'testing',
    environment: 'development'
  }
};

function sendWebhook(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlashFusion/1.0'
      }
    };

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
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function testWebhook() {
  console.log('🚀 Testing Zapier Webhook...\n');
  console.log(`📡 URL: ${webhookUrl}`);
  console.log(`📦 Data:`, JSON.stringify(testData, null, 2));
  console.log('\n⏳ Sending...');

  try {
    const response = await sendWebhook(webhookUrl, testData);
    
    console.log(`\n✅ Response: ${response.statusCode}`);
    console.log(`📄 Body: ${response.body}`);
    
    if (response.statusCode === 200) {
      console.log('\n🎉 Webhook test successful!');
      console.log('   Check your Zapier dashboard for the received data.');
    } else {
      console.log('\n⚠️  Unexpected response code');
    }
    
  } catch (error) {
    console.error('\n❌ Webhook test failed:', error.message);
  }
}

testWebhook();