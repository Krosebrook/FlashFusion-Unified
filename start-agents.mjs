#!/usr/bin/env node

// FlashFusion Agents Startup Script
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting FlashFusion Agents System...');

// Agent status tracking
const agents = {
    orchestrator: { status: 'stopped', process: null },
    integration: { status: 'stopped', process: null },
    ui: { status: 'stopped', process: null }
};

// Start individual agent
function startAgent(agentName, scriptPath, port) {
    return new Promise((resolve, reject) => {
        console.log(`🤖 Starting ${agentName} agent on port ${port}...`);
        
        const env = { ...process.env, PORT: port };
        const agentProcess = spawn('node', [scriptPath], { 
            env,
            cwd: __dirname,
            stdio: 'inherit'
        });
        
        agents[agentName].process = agentProcess;
        agents[agentName].status = 'starting';
        
        agentProcess.on('spawn', () => {
            agents[agentName].status = 'running';
            console.log(`✅ ${agentName} agent started successfully`);
            resolve();
        });
        
        agentProcess.on('error', (error) => {
            console.error(`❌ Failed to start ${agentName} agent:`, error.message);
            agents[agentName].status = 'error';
            reject(error);
        });
        
        agentProcess.on('exit', (code) => {
            console.log(`🔄 ${agentName} agent exited with code ${code}`);
            agents[agentName].status = 'stopped';
        });
    });
}

// Agent health check
async function healthCheck() {
    console.log('\n📊 Agent Health Status:');
    for (const [name, agent] of Object.entries(agents)) {
        const status = agent.status === 'running' ? '🟢' : '🔴';
        console.log(`   ${status} ${name}: ${agent.status}`);
    }
    console.log('');
}

// Graceful shutdown
function gracefulShutdown() {
    console.log('\n🛑 Shutting down agents...');
    
    for (const [name, agent] of Object.entries(agents)) {
        if (agent.process && agent.status === 'running') {
            console.log(`   Stopping ${name}...`);
            agent.process.kill('SIGTERM');
        }
    }
    
    setTimeout(() => {
        console.log('✅ All agents stopped');
        process.exit(0);
    }, 2000);
}

// Setup signal handlers
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Main startup sequence
async function startAgents() {
    try {
        // Create a simple agent orchestrator
        console.log('🔧 Initializing Agent System...');
        
        // Start basic orchestrator
        const orchestratorCode = `
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Agent registry
const agentRegistry = new Map();

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        agents: Array.from(agentRegistry.entries()),
        uptime: process.uptime()
    });
});

// Agent status endpoint
app.get('/agents', (req, res) => {
    res.json({
        agents: Array.from(agentRegistry.entries()).map(([id, agent]) => ({
            id,
            name: agent.name,
            type: agent.type,
            status: agent.status,
            capabilities: agent.capabilities
        }))
    });
});

// Register agent endpoint
app.post('/agents/register', (req, res) => {
    const { id, name, type, capabilities } = req.body;
    agentRegistry.set(id, {
        id, name, type, capabilities,
        status: 'active',
        registeredAt: new Date().toISOString()
    });
    
    console.log(\`✅ Agent registered: \${name} (\${type})\`);
    res.json({ success: true, message: 'Agent registered successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(\`🚀 FlashFusion Agent Orchestrator running on port \${PORT}\`);
    console.log(\`📊 Health check: http://localhost:\${PORT}/health\`);
    console.log(\`🤖 Agents status: http://localhost:\${PORT}/agents\`);
});
`;

        // Write temporary orchestrator file
        fs.writeFileSync(join(__dirname, 'temp-orchestrator.mjs'), orchestratorCode);
        
        // Start the orchestrator
        await startAgent('orchestrator', 'temp-orchestrator.mjs', 3001);
        
        // Wait a moment for startup
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Initial health check
        await healthCheck();
        
        console.log('🎉 FlashFusion Agents System is running!');
        console.log('📊 Dashboard: http://localhost:3001/health');
        console.log('🤖 Agents API: http://localhost:3001/agents');
        console.log('\nPress Ctrl+C to stop all agents\n');
        
        // Periodic health checks
        setInterval(healthCheck, 30000);
        
    } catch (error) {
        console.error('❌ Failed to start agents:', error.message);
        process.exit(1);
    }
}

// Start the system
startAgents();