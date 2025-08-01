import express from 'express';
import AgentOrchestrator from './orchestrator.js';
import RealtimeUIAgent from './realtime-ui-agent.js';
import winston from 'winston';

/**
 * Agent Router - HTTP API for agent system
 */
class AgentRouter {
    constructor() {
        this.router = express.Router();
        this.orchestrator = new AgentOrchestrator();
        this.uiAgent = new RealtimeUIAgent();
        
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/agent-router.log' }),
                new winston.transports.Console()
            ]
        });

        this.setupRoutes();
        this.initializeAgents();
    }

    /**
     * Initialize default agents
     */
    async initializeAgents() {
        try {
            // Start UI agent
            await this.uiAgent.start();
            
            // Register default agents with orchestrator
            await this.orchestrator.createAgent('ui-agent', {
                socketUrl: 'ws://localhost:3001'
            });
            
            await this.orchestrator.createAgent('figma-agent', {
                figmaApiKey: process.env.FIGMA_API_KEY
            });
            
            await this.orchestrator.createAgent('llm-agent', {
                anthropicKey: process.env.ANTHROPIC_API_KEY,
                openaiKey: process.env.OPENAI_API_KEY,
                geminiKey: process.env.GEMINI_API_KEY
            });
            
            await this.orchestrator.createAgent('scraper-agent', {
                maxConcurrency: 3
            });
            
            await this.orchestrator.createAgent('workflow-agent');
            await this.orchestrator.createAgent('database-agent');
            await this.orchestrator.createAgent('auth-agent');
            await this.orchestrator.createAgent('monitoring-agent');
            
            this.logger.info('All agents initialized successfully');
            
        } catch (error) {
            this.logger.error('Failed to initialize agents:', error);
        }
    }

    /**
     * Setup API routes
     */
    setupRoutes() {
        // Get orchestrator status
        this.router.get('/status', (req, res) => {
            try {
                const status = this.orchestrator.getStatus();
                res.json(status);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Execute a task
        this.router.post('/execute', async (req, res) => {
            try {
                const task = req.body;
                const result = await this.orchestrator.executeTask(task);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Create a new agent
        this.router.post('/agents', async (req, res) => {
            try {
                const { type, config } = req.body;
                const agentId = await this.orchestrator.createAgent(type, config);
                res.json({ agentId, message: 'Agent created successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // UI-specific routes
        this.setupUIRoutes();
        
        // LLM-specific routes
        this.setupLLMRoutes();
        
        // Workflow routes
        this.setupWorkflowRoutes();
        
        // Figma integration routes
        this.setupFigmaRoutes();
        
        // Scraping routes
        this.setupScrapingRoutes();
    }

    /**
     * Setup UI-specific routes
     */
    setupUIRoutes() {
        // Real-time UI updates
        this.router.post('/ui/update', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'ui-update',
                    action: 'update-component',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Generate UI component
        this.router.post('/ui/generate-component', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'ui-update',
                    action: 'generate-component',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Update styles
        this.router.post('/ui/styles', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'ui-update',
                    action: 'update-styles',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    /**
     * Setup LLM-specific routes
     */
    setupLLMRoutes() {
        // Generate code with specific LLM
        this.router.post('/llm/generate-code', async (req, res) => {
            try {
                const { model = 'claude', prompt, language = 'javascript' } = req.body;
                
                const result = await this.orchestrator.executeTask({
                    type: 'code-generation',
                    action: 'generate-code',
                    model,
                    data: { prompt, language }
                });
                
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Analyze code
        this.router.post('/llm/analyze-code', async (req, res) => {
            try {
                const { model = 'claude', code, analysisType = 'general' } = req.body;
                
                const result = await this.orchestrator.executeTask({
                    type: 'code-generation',
                    action: 'analyze-code',
                    model,
                    data: { code, analysisType }
                });
                
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Create tests
        this.router.post('/llm/create-tests', async (req, res) => {
            try {
                const { model = 'claude', code, testFramework = 'jest' } = req.body;
                
                const result = await this.orchestrator.executeTask({
                    type: 'code-generation',
                    action: 'create-tests',
                    model,
                    data: { code, testFramework }
                });
                
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    /**
     * Setup workflow routes
     */
    setupWorkflowRoutes() {
        // Execute workflow
        this.router.post('/workflow/execute', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'workflow-execution',
                    action: 'run-workflow',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Create pipeline
        this.router.post('/workflow/pipeline', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'workflow-execution',
                    action: 'create-pipeline',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    /**
     * Setup Figma integration routes
     */
    setupFigmaRoutes() {
        // Sync with Figma
        this.router.post('/figma/sync', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'design-sync',
                    action: 'sync-designs',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Extract components from Figma
        this.router.post('/figma/extract-components', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'design-sync',
                    action: 'extract-components',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Generate code from Figma design
        this.router.post('/figma/generate-code', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'design-sync',
                    action: 'generate-code',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    /**
     * Setup web scraping routes
     */
    setupScrapingRoutes() {
        // Scrape URL
        this.router.post('/scraper/scrape', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'data-scraping',
                    action: 'scrape-url',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Monitor website changes
        this.router.post('/scraper/monitor', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'data-scraping',
                    action: 'monitor-changes',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Extract APIs from websites
        this.router.post('/scraper/extract-apis', async (req, res) => {
            try {
                const result = await this.orchestrator.executeTask({
                    type: 'data-scraping',
                    action: 'extract-apis',
                    data: req.body
                });
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    /**
     * Health check for all agents
     */
    async performHealthCheck() {
        try {
            const orchestratorHealth = await this.orchestrator.performHealthChecks();
            const uiAgentHealth = this.uiAgent.healthCheck();
            
            return {
                orchestrator: orchestratorHealth,
                uiAgent: uiAgentHealth,
                overall: 'healthy'
            };
        } catch (error) {
            return {
                overall: 'unhealthy',
                error: error.message
            };
        }
    }

    /**
     * Get the router instance
     */
    getRouter() {
        return this.router;
    }

    /**
     * Shutdown all agents
     */
    async shutdown() {
        try {
            await this.uiAgent.stop();
            await this.orchestrator.shutdown();
            this.logger.info('All agents shut down successfully');
        } catch (error) {
            this.logger.error('Error during agent shutdown:', error);
        }
    }
}

export default AgentRouter;