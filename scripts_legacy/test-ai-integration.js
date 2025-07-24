#!/usr/bin/env node

/**
 * FlashFusion AI Integration Test
 * Tests OpenAI API connection and AI-powered responses
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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Test OpenAI API connection
async function testOpenAIConnection() {
  log('blue', '\n🤖 Testing OpenAI API Connection...');
  console.log('────────────────────────────────────────────────────');
  
  const requestData = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "Test FlashFusion AI integration. Respond with: 'FlashFusion AI integration successful!'"
      }
    ],
    max_tokens: 50,
    temperature: 0.7
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.choices && response.choices[0]) {
            log('green', '✅ OpenAI API connection successful!');
            log('cyan', `   Model: ${response.model}`);
            log('cyan', `   Response: ${response.choices[0].message.content}`);
            log('cyan', `   Tokens used: ${response.usage.total_tokens}`);
            resolve(true);
          } else {
            log('red', `❌ OpenAI API error: ${res.statusCode}`);
            log('yellow', `   Response: ${data.substring(0, 200)}`);
            resolve(false);
          }
        } catch (error) {
          log('red', `❌ Failed to parse OpenAI response: ${error.message}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ OpenAI connection error');
      log('red', `   Error: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(15000, () => {
      log('red', '❌ OpenAI request timeout');
      resolve(false);
    });

    req.write(requestData);
    req.end();
  });
}

// Test FlashFusion AI Service
async function testFlashFusionAI() {
  log('blue', '\n🎭 Testing FlashFusion AI Service...');
  console.log('────────────────────────────────────────────────────');
  
  try {
    // Try to test the FlashFusion server's AI endpoint
    const response = await makeFlashFusionRequest('/api/v1/ai/test', {
      prompt: 'Generate a brief project analysis for a mobile e-commerce app',
      maxTokens: 100
    });
    
    if (response) {
      log('green', '✅ FlashFusion AI Service working!');
      return true;
    } else {
      log('yellow', '⚠️  FlashFusion AI Service not yet configured');
      return false;
    }
  } catch (error) {
    log('yellow', `⚠️  FlashFusion AI Service: ${error.message}`);
    return false;
  }
}

// Test Agent Intelligence
async function testAgentIntelligence() {
  log('blue', '\n🧠 Testing AI Agent Intelligence...');
  console.log('────────────────────────────────────────────────────');
  
  try {
    // Test orchestration with real AI
    const response = await makeFlashFusionRequest('/api/orchestration/quick-analysis', {
      request: {
        description: 'Build a social media mobile app with AI content recommendations',
        type: 'mobile',
        priority: 8
      }
    });
    
    if (response) {
      log('green', '✅ AI Agent intelligence active!');
      log('cyan', '   Agents can now provide real AI-powered insights');
      return true;
    } else {
      log('yellow', '⚠️  Agent intelligence using mock responses');
      return false;
    }
  } catch (error) {
    log('yellow', `⚠️  Agent intelligence: ${error.message}`);
    return false;
  }
}

// Helper function to make FlashFusion requests
async function makeFlashFusionRequest(path, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(res.statusCode >= 200 && res.statusCode < 300 ? parsed : null);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}

// Main execution
async function main() {
  log('bold', '\n🚀 FlashFusion AI Integration Test');
  console.log('═══════════════════════════════════════════════════════════════');

  // Validate OpenAI API key
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('your_new')) {
    log('red', '❌ OpenAI API key not configured');
    log('yellow', '   Please check your .env file');
    process.exit(1);
  }

  log('cyan', '\nConfiguration:');
  log('cyan', `  OpenAI Key: ${OPENAI_API_KEY.substring(0, 20)}...`);
  log('cyan', `  Key Format: ${OPENAI_API_KEY.startsWith('sk-proj') ? 'Project Key ✅' : 'Standard Key'}`);

  // Test OpenAI connection
  const openaiWorking = await testOpenAIConnection();
  
  if (!openaiWorking) {
    log('red', '\n❌ OpenAI API connection failed');
    log('yellow', '💡 Please check your API key and network connection');
    process.exit(1);
  }

  // Test FlashFusion AI integration
  const aiServiceWorking = await testFlashFusionAI();
  
  // Test Agent intelligence
  const agentIntelligence = await testAgentIntelligence();

  // Summary
  log('green', '\n🎉 AI Integration Test Complete!');
  log('cyan', '\n📊 Results Summary:');
  console.log('────────────────────────────────────────────────────');
  log(openaiWorking ? 'green' : 'red', `${openaiWorking ? '✅' : '❌'} OpenAI API Connection`);
  log(aiServiceWorking ? 'green' : 'yellow', `${aiServiceWorking ? '✅' : '⚠️'} FlashFusion AI Service`);
  log(agentIntelligence ? 'green' : 'yellow', `${agentIntelligence ? '✅' : '⚠️'} Agent Intelligence`);
  
  if (openaiWorking) {
    log('blue', '\n🚀 Next Steps:');
    log('cyan', '   • Test agent responses: npm run cli quickstart');
    log('cyan', '   • Create AI-powered project: POST /api/v1/projects');
    log('cyan', '   • Monitor AI usage: http://localhost:3001/docs');
    log('green', '\n✨ FlashFusion is now AI-powered! ✨');
  }
}

// Run the test
main().catch(console.error);