/**
 * FlashFusion Agents API - Vercel Function
 * Connects to FlashFusion Core agent system
 */

const { FlashFusionCore } = require('../src/core/FlashFusionCore');
const { AgentPersonalitySystem } = require('../src/server/services/AgentPersonalitySystem');

// Initialize systems
let flashFusionCore;
let personalitySystem;

async function initializeSystems() {
    if (!flashFusionCore) {
        flashFusionCore = new FlashFusionCore();
        await flashFusionCore.initialize();
        personalitySystem = new AgentPersonalitySystem();
    }
}

module.exports = async (req, res) => {
    try {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        await initializeSystems();

        const { method, url } = req;
        const path = url.replace('/api/agents', '');

        // GET /api/agents - List all agents
        if (method === 'GET' && path === '') {
            const agents = flashFusionCore.getUniversalAgents();
            return res.status(200).json({
                success: true,
                agents: agents.map(agent => ({
                    id: agent.id,
                    name: agent.name,
                    description: agent.description,
                    capabilities: agent.capabilities,
                    status: agent.status,
                    workflows: agent.workflows
                }))
            });
        }

        // GET /api/agents/status - System status
        if (method === 'GET' && path === '/status') {
            return res.status(200).json({
                success: true,
                status: 'healthy',
                system: 'FlashFusion Universal Agents',
                agentCount: flashFusionCore.universalAgents.size,
                isHealthy: flashFusionCore.isHealthy(),
                workflowTypes: flashFusionCore.getWorkflowTypes().map(wf => wf.id)
            });
        }

        // POST /api/agents/chat - Chat with agents
        if (method === 'POST' && path === '/chat') {
            const { taskType, input, agentPersonality, context = {} } = req.body;

            if (!taskType || !input) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: taskType and input'
                });
            }

            // Map taskType to agent
            const agentMap = {
                'research_request': 'researcher',
                'content_request': 'creator', 
                'optimization_request': 'optimizer',
                'automation_request': 'automator',
                'analysis_request': 'analyzer',
                'coordination_request': 'coordinator'
            };

            const agentId = agentMap[taskType];
            if (!agentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid taskType. Valid types: ' + Object.keys(agentMap).join(', ')
                });
            }

            const agent = flashFusionCore.universalAgents.get(agentId);
            if (!agent) {
                return res.status(404).json({
                    success: false,
                    error: `Agent ${agentId} not found`
                });
            }

            // Generate personalized response if personality specified
            let response = `Processing ${taskType} with ${agent.name}...

Request: ${input}

${agent.name} Analysis:
- Capability Match: ${agent.capabilities.join(', ')}
- Workflow Support: ${agent.workflows.join(', ')}
- Current Status: ${agent.status}

This would normally connect to AI services (OpenAI/Anthropic) for actual processing.
For demo purposes, showing agent system integration is working.`;

            if (agentPersonality) {
                response = personalitySystem.generateAgentResponse(
                    agentPersonality, 
                    response, 
                    context
                );
            }

            // Update agent metrics
            agent.performanceMetrics.tasksCompleted++;
            agent.performanceMetrics.lastUsed = new Date();

            return res.status(200).json({
                success: true,
                agent: agent.name,
                agentId,
                personality: agentPersonality || 'none',
                taskType,
                response,
                timestamp: new Date().toISOString()
            });
        }

        // GET /api/agents/:agentId - Get specific agent info
        if (method === 'GET' && path.startsWith('/')) {
            const agentId = path.substring(1);
            const agent = flashFusionCore.universalAgents.get(agentId);
            
            if (!agent) {
                return res.status(404).json({
                    success: false,
                    error: `Agent ${agentId} not found`
                });
            }

            return res.status(200).json({
                success: true,
                agent: {
                    id: agentId,
                    ...agent
                }
            });
        }

        // Default 404
        return res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            availableEndpoints: [
                'GET /api/agents - List all agents',
                'GET /api/agents/status - System status',
                'POST /api/agents/chat - Chat with agents',
                'GET /api/agents/:agentId - Get specific agent'
            ]
        });

    } catch (error) {
        console.error('Agents API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};