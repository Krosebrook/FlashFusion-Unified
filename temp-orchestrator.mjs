
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
    
    console.log(`✅ Agent registered: ${name} (${type})`);
    res.json({ success: true, message: 'Agent registered successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 FlashFusion Agent Orchestrator running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 Agents status: http://localhost:${PORT}/agents`);
});
