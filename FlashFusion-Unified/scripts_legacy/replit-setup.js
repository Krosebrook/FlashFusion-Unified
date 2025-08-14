#!/usr/bin/env node

/**
 * FlashFusion Replit Frontend Development Setup
 * Connects FlashFusion to Replit for web-based frontend development
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

// Test Replit API connection
async function testReplitConnection(apiToken) {
  log('blue', '\n🔗 Testing Replit API Connection...');
  console.log('────────────────────────────────────────────────────');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'replit.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const query = JSON.stringify({
      query: `
        query {
          currentUser {
            id
            username
            displayName
          }
        }
      `
    });

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            if (response.data && response.data.currentUser) {
              log('green', '✅ Replit API connection successful!');
              log('cyan', `   User: ${response.data.currentUser.username}`);
              log('cyan', `   Display Name: ${response.data.currentUser.displayName}`);
              resolve({ success: true, user: response.data.currentUser });
            } else {
              log('red', '❌ Invalid API response');
              resolve({ success: false, error: 'Invalid response' });
            }
          } else {
            log('red', `❌ Replit API error: ${res.statusCode}`);
            log('yellow', `   Response: ${data.substring(0, 200)}`);
            resolve({ success: false, error: `HTTP ${res.statusCode}` });
          }
        } catch (error) {
          log('red', `❌ Failed to parse Replit response: ${error.message}`);
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ Replit connection error');
      log('red', `   Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(15000, () => {
      log('red', '❌ Replit request timeout');
      resolve({ success: false, error: 'timeout' });
    });

    req.write(query);
    req.end();
  });
}

// Get user's Repls
async function getUserRepls(apiToken) {
  log('blue', '\n📋 Fetching Your Replit Projects...');
  console.log('────────────────────────────────────────────────────');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'replit.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const query = JSON.stringify({
      query: `
        query {
          currentUser {
            publicRepls(count: 10) {
              items {
                id
                title
                description
                url
                language
                isPrivate
              }
            }
          }
        }
      `
    });

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            if (response.data && response.data.currentUser && response.data.currentUser.publicRepls) {
              const repls = response.data.currentUser.publicRepls.items;
              
              if (repls.length > 0) {
                log('green', `✅ Found ${repls.length} Repl(s):`);
                repls.forEach((repl, index) => {
                  log('cyan', `   ${index + 1}. ${repl.title}`);
                  log('yellow', `      Language: ${repl.language || 'Unknown'}`);
                  log('yellow', `      URL: ${repl.url}`);
                  if (repl.description) {
                    log('yellow', `      Description: ${repl.description}`);
                  }
                });
                resolve(repls);
              } else {
                log('yellow', '⚠️  No public Repls found');
                resolve([]);
              }
            } else {
              log('red', '❌ Failed to fetch Repls');
              resolve(null);
            }
          } else {
            log('red', `❌ Failed to fetch Repls: ${res.statusCode}`);
            resolve(null);
          }
        } catch (error) {
          log('red', `❌ Failed to parse Repls response: ${error.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ Error fetching Repls');
      resolve(null);
    });

    req.write(query);
    req.end();
  });
}

// Interactive setup for Replit token
async function interactiveReplitSetup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  log('cyan', '\n🔐 Replit API Token Setup');
  console.log('════════════════════════════════════════════════════');
  
  log('yellow', '📋 To get your Replit API token:');
  log('cyan', '   1. Go to https://replit.com/account');
  log('cyan', '   2. Scroll down to "API" section');
  log('cyan', '   3. Click "Generate API Token"');
  log('cyan', '   4. Copy the generated token');

  console.log('\n');
  const apiToken = await question('🔑 Enter your Replit API Token: ');

  rl.close();

  return apiToken.trim();
}

// Update .env file with Replit token
function updateEnvWithReplit(apiToken) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(
      /REPLIT_API_TOKEN=.*/,
      `REPLIT_API_TOKEN=${apiToken}`
    );
    
    fs.writeFileSync(envPath, envContent);
    log('green', '✅ .env file updated with Replit token');
    return true;
  } catch (error) {
    log('red', `❌ Failed to update .env file: ${error.message}`);
    return false;
  }
}

// Create frontend development template
function createFrontendTemplate() {
  log('blue', '\n🎨 Creating Frontend Development Template...');
  console.log('────────────────────────────────────────────────────');

  // Create frontend directory structure
  const frontendDir = path.join(process.cwd(), 'frontend');
  
  try {
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir);
      log('green', '✅ Created frontend directory');
    }

    // Create package.json for React frontend
    const packageJson = {
      "name": "flashfusion-frontend",
      "version": "1.0.0",
      "description": "FlashFusion React Frontend Dashboard",
      "main": "src/index.js",
      "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1",
        "axios": "^1.6.0",
        "socket.io-client": "^4.7.0",
        "@mui/material": "^5.14.0",
        "@mui/icons-material": "^5.14.0",
        "@emotion/react": "^11.11.0",
        "@emotion/styled": "^11.11.0",
        "recharts": "^2.8.0",
        "react-router-dom": "^6.8.0"
      },
      "browserslist": {
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      }
    };

    fs.writeFileSync(
      path.join(frontendDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    log('green', '✅ Created package.json');

    // Create basic React app structure
    const srcDir = path.join(frontendDir, 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }

    // Create main App.js
    const appJs = `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

const FLASHFUSION_API = 'http://localhost:3001';

function App() {
  const [systemHealth, setSystemHealth] = useState(null);
  const [agents, setAgents] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to FlashFusion WebSocket
    const socket = io(FLASHFUSION_API);
    
    socket.on('connect', () => {
      console.log('Connected to FlashFusion');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Fetch initial data
    fetchSystemHealth();
    fetchAgents();

    return () => socket.disconnect();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await axios.get(\`\${FLASHFUSION_API}/health\`);
      setSystemHealth(response.data);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get(\`\${FLASHFUSION_API}/api/orchestration/status\`);
      if (response.data.success) {
        setAgents(response.data.data.agents.roles || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 FlashFusion Dashboard</h1>
        <div className="connection-status">
          Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </header>

      <main className="App-main">
        <section className="system-health">
          <h2>System Health</h2>
          {systemHealth ? (
            <div className="health-card">
              <p><strong>Status:</strong> {systemHealth.status}</p>
              <p><strong>Uptime:</strong> {Math.floor(systemHealth.uptime / 60)} minutes</p>
              <p><strong>Version:</strong> {systemHealth.version}</p>
            </div>
          ) : (
            <p>Loading system health...</p>
          )}
        </section>

        <section className="agents-grid">
          <h2>AI Agents ({agents.length})</h2>
          <div className="agents-container">
            {agents.map((agent, index) => (
              <div key={index} className="agent-card">
                <h3>{agent.name.replace(/_/g, ' ').toUpperCase()}</h3>
                <p><strong>Priority:</strong> {agent.priority}</p>
                <p><strong>Status:</strong> {agent.status}</p>
                <div className="capabilities">
                  <strong>Capabilities:</strong>
                  <ul>
                    {agent.capabilities?.slice(0, 3).map((cap, i) => (
                      <li key={i}>{cap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;`;

    fs.writeFileSync(path.join(srcDir, 'App.js'), appJs);
    log('green', '✅ Created App.js');

    // Create App.css
    const appCss = `.App {
  text-align: center;
  background-color: #1a1a1a;
  color: white;
  min-height: 100vh;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  border-bottom: 2px solid #61dafb;
}

.App-header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.connection-status {
  margin-top: 10px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: rgba(97, 218, 251, 0.1);
  display: inline-block;
}

.App-main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.system-health {
  margin-bottom: 40px;
}

.health-card {
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  max-width: 400px;
  border: 1px solid #61dafb;
}

.agents-grid h2 {
  margin-bottom: 30px;
  color: #61dafb;
}

.agents-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.agent-card {
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #444;
  transition: transform 0.2s, border-color 0.2s;
}

.agent-card:hover {
  transform: translateY(-5px);
  border-color: #61dafb;
}

.agent-card h3 {
  color: #61dafb;
  margin-top: 0;
  font-size: 1.2rem;
}

.capabilities {
  margin-top: 15px;
  text-align: left;
}

.capabilities ul {
  margin: 5px 0;
  padding-left: 20px;
}

.capabilities li {
  margin: 5px 0;
  color: #ccc;
}`;

    fs.writeFileSync(path.join(srcDir, 'App.css'), appCss);
    log('green', '✅ Created App.css');

    // Create index.js
    const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    fs.writeFileSync(path.join(srcDir, 'index.js'), indexJs);
    log('green', '✅ Created index.js');

    // Create index.css
    const indexCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #1a1a1a;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}`;

    fs.writeFileSync(path.join(srcDir, 'index.css'), indexCss);
    log('green', '✅ Created index.css');

    // Create public directory and index.html
    const publicDir = path.join(frontendDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="FlashFusion AI Orchestration Dashboard" />
    <title>FlashFusion Dashboard</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;

    fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
    log('green', '✅ Created index.html');

    return true;
  } catch (error) {
    log('red', `❌ Failed to create frontend template: ${error.message}`);
    return false;
  }
}

// Create Replit configuration files
function createReplitConfig() {
  log('blue', '\n⚙️ Creating Replit Configuration...');
  console.log('────────────────────────────────────────────────────');

  try {
    // Create .replit file
    const replitConfig = `modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[deployment]
run = ["npm", "start"]
deploymentTarget = "cloudrun"
ignorePorts = false

[[ports]]
localPort = 3000
externalPort = 80

[env]
REACT_APP_FLASHFUSION_API = "http://localhost:3001"`;

    fs.writeFileSync(path.join(process.cwd(), 'frontend', '.replit'), replitConfig);
    log('green', '✅ Created .replit configuration');

    // Create replit.nix
    const replitNix = `{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.npm-9_x
  ];
}`;

    fs.writeFileSync(path.join(process.cwd(), 'frontend', 'replit.nix'), replitNix);
    log('green', '✅ Created replit.nix');

    return true;
  } catch (error) {
    log('red', `❌ Failed to create Replit config: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log('bold', '\n🚀 FlashFusion Replit Frontend Development Setup');
  console.log('═══════════════════════════════════════════════════════════════');

  // Check if Replit token is configured
  const currentToken = process.env.REPLIT_API_TOKEN;
  const hasValidToken = currentToken && !currentToken.includes('your_new');

  let apiToken = currentToken;

  if (!hasValidToken) {
    log('yellow', '⚠️  Replit API token not configured');
    apiToken = await interactiveReplitSetup();
    
    if (apiToken) {
      updateEnvWithReplit(apiToken);
    } else {
      log('red', '❌ Setup cancelled - no token provided');
      process.exit(1);
    }
  } else {
    log('green', '✅ Replit token found in .env file');
  }

  // Test Replit connection
  const connection = await testReplitConnection(apiToken);
  
  if (!connection.success) {
    log('red', '\n❌ Failed to connect to Replit API');
    log('yellow', '💡 Please check your API token');
    // Continue with template creation even if API fails
  }

  // Get user's Repls
  if (connection.success) {
    await getUserRepls(apiToken);
  }

  // Create frontend template
  const templateCreated = createFrontendTemplate();
  const configCreated = createReplitConfig();

  // Summary
  log('green', '\n🎉 Replit Frontend Setup Complete!');
  log('cyan', '\n📊 Setup Summary:');
  console.log('────────────────────────────────────────────────────');
  log(connection.success ? 'green' : 'yellow', `${connection.success ? '✅' : '⚠️'} Replit API: ${connection.success ? 'Connected' : 'Token configured'}`);
  log(templateCreated ? 'green' : 'red', `${templateCreated ? '✅' : '❌'} Frontend Template`);
  log(configCreated ? 'green' : 'red', `${configCreated ? '✅' : '❌'} Replit Configuration`);
  
  if (connection.success) {
    log('cyan', `User: ${connection.user.username}`);
  }
  
  log('blue', '\n🚀 Next Steps:');
  log('cyan', '   1. Upload frontend folder to new Replit');
  log('cyan', '   2. Run: npm install');
  log('cyan', '   3. Run: npm start');
  log('cyan', '   4. Connect to FlashFusion backend at localhost:3001');
  
  log('blue', '\n🎨 Frontend Features:');
  log('yellow', '   • Real-time FlashFusion dashboard');
  log('yellow', '   • WebSocket connection to backend');
  log('yellow', '   • AI Agents visualization');
  log('yellow', '   • System health monitoring');
  log('yellow', '   • Material-UI components');
  
  log('green', '\n✨ FlashFusion frontend development environment ready! ✨');
}

main().catch(console.error);