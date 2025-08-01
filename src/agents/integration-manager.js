import EnhancedAgentOrchestrator from './enhanced-orchestrator.js';
import RealtimeUIAgent from './realtime-ui-agent.js';
import winston from 'winston';

/**
 * Integration Manager for FlashFusion + Digital Product Orchestration
 * Manages the complete integration of all 7 features with existing system
 */
class IntegrationManager {
    constructor() {
        this.orchestrator = new EnhancedAgentOrchestrator();
        this.uiAgent = new RealtimeUIAgent();
        this.isInitialized = false;
        
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/integration-manager.log' }),
                new winston.transports.Console()
            ]
        });

        this.integrationFeatures = {
            communication: false,
            roleSelection: false,
            monitoring: false,
            credentials: false,
            context: false,
            resilience: false,
            workflow: false
        };
    }

    /**
     * Initialize all integrated systems
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            this.logger.info('🚀 Starting FlashFusion Integration Manager...');

            // Initialize enhanced orchestrator
            await this.orchestrator.initialize();
            this.integrationFeatures.communication = true;
            this.integrationFeatures.roleSelection = true;
            this.integrationFeatures.workflow = true;
            
            // Initialize UI agent
            await this.uiAgent.start();
            
            // Register core agents
            await this.registerCoreAgents();
            
            // Setup integration event handlers
            this.setupIntegrationEventHandlers();
            
            this.isInitialized = true;
            this.logger.info('✅ FlashFusion Integration Manager initialized successfully');
            
            return true;
        } catch (error) {
            this.logger.error('❌ Failed to initialize Integration Manager:', error);
            throw error;
        }
    }

    /**
     * Register all core agents with enhanced capabilities
     */
    async registerCoreAgents() {
        const coreAgents = [
            {
                name: 'Real-time UI Agent',
                type: 'ui-agent',
                capabilities: ['real-time-updates', 'component-generation', 'figma-sync'],
                instance: this.uiAgent
            },
            {
                name: 'Multi-LLM Agent',
                type: 'llm-agent',
                capabilities: ['code-generation', 'analysis', 'testing'],
                aiProviders: ['claude', 'gpt', 'gemini']
            },
            {
                name: 'Figma Integration Agent',
                type: 'figma-agent',
                capabilities: ['design-sync', 'component-extraction', 'asset-generation']
            },
            {
                name: 'Web Scraping Agent',
                type: 'scraper-agent',
                capabilities: ['data-extraction', 'monitoring', 'api-discovery']
            },
            {
                name: 'Workflow Automation Agent',
                type: 'workflow-agent',
                capabilities: ['orchestration', 'dependency-management', 'parallel-execution']
            },
            {
                name: 'Database Management Agent',
                type: 'database-agent',
                capabilities: ['schema-migration', 'optimization', 'backup-management']
            },
            {
                name: 'Security Guardian Agent',
                type: 'auth-agent',
                capabilities: ['authentication', 'authorization', 'security-monitoring']
            },
            {
                name: 'Performance Monitoring Agent',
                type: 'monitoring-agent',
                capabilities: ['metrics-collection', 'alerting', 'performance-analysis']
            }
        ];

        for (const agentConfig of coreAgents) {
            try {
                const agentId = await this.orchestrator.registerEnhancedAgent(agentConfig);
                this.logger.info(`✅ Registered: ${agentConfig.name} (${agentId})`);
            } catch (error) {
                this.logger.error(`❌ Failed to register ${agentConfig.name}:`, error);
            }
        }
    }

    /**
     * Setup integration event handlers
     */
    setupIntegrationEventHandlers() {
        // Enhanced orchestrator events
        this.orchestrator.on('enhanced:handoff:completed', (data) => {
            this.logger.info(`🔄 Handoff completed: ${data.from} -> ${data.to}`);
            this.broadcastEvent('handoff:completed', data);
        });

        this.orchestrator.on('enhanced:handoff:timeout', (data) => {
            this.logger.warn(`⏰ Handoff timeout: ${data.from} -> ${data.to}`);
            this.broadcastEvent('handoff:timeout', data);
        });

        // UI agent events
        if (this.uiAgent.io) {
            this.uiAgent.io.on('connection', (socket) => {
                socket.on('request:product:development', async (data) => {
                    await this.handleProductDevelopmentRequest(data, socket);
                });

                socket.on('request:agent:status', async (data) => {
                    const status = await this.getIntegratedStatus();
                    socket.emit('agent:status:update', status);
                });
            });
        }
    }

    /**
     * Handle product development requests from UI
     */
    async handleProductDevelopmentRequest(data, socket) {
        try {
            this.logger.info('🎯 Processing product development request:', data.description);

            const task = {
                id: data.id,
                projectId: data.projectId,
                description: data.description,
                priority: data.priority || 5,
                context: data.context || {},
                type: 'product_development'
            };

            // Execute with enhanced orchestrator
            const result = await this.orchestrator.executeEnhancedTask(task);

            // Send real-time updates to UI
            socket.emit('product:development:progress', {
                taskId: task.id,
                projectId: result.projectId,
                status: 'completed',
                results: result.results,
                timestamp: Date.now()
            });

            // Store context for future reference
            await this.orchestrator.storeContext(result.projectId, {
                originalRequest: data,
                results: result.results,
                completedAt: Date.now()
            }, 'ui_request');

            this.logger.info(`✅ Product development request completed: ${task.id}`);

        } catch (error) {
            this.logger.error('❌ Product development request failed:', error);
            socket.emit('product:development:error', {
                taskId: data.id,
                error: error.message,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Get integrated status from all systems
     */
    async getIntegratedStatus() {
        try {
            const orchestratorStatus = await this.orchestrator.getEnhancedStatus();
            const uiAgentStatus = this.uiAgent.healthCheck();

            return {
                integration: {
                    initialized: this.isInitialized,
                    features: this.integrationFeatures,
                    uptime: process.uptime()
                },
                orchestrator: orchestratorStatus,
                uiAgent: uiAgentStatus,
                system: {
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage(),
                    version: process.version
                }
            };
        } catch (error) {
            this.logger.error('Error getting integrated status:', error);
            return {
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Broadcast events to all connected systems
     */
    broadcastEvent(eventType, data) {
        // Broadcast to UI clients
        if (this.uiAgent.io) {
            this.uiAgent.io.emit(eventType, data);
        }

        // Broadcast to other systems
        this.orchestrator.emit(`integration:${eventType}`, data);
    }

    /**
     * Execute complex multi-agent workflows
     */
    async executeComplexWorkflow(workflowDefinition) {
        try {
            this.logger.info('🔄 Starting complex workflow:', workflowDefinition.name);

            const workflowId = workflowDefinition.id || `workflow_${Date.now()}`;
            const results = [];

            // Process workflow phases
            for (const phase of workflowDefinition.phases) {
                this.logger.info(`📋 Processing phase: ${phase.name}`);

                const phaseResults = [];
                
                // Execute tasks in parallel if specified
                if (phase.parallel) {
                    const promises = phase.tasks.map(task => 
                        this.orchestrator.executeEnhancedTask({
                            ...task,
                            workflowId,
                            phase: phase.name
                        })
                    );
                    
                    const parallelResults = await Promise.all(promises);
                    phaseResults.push(...parallelResults);
                } else {
                    // Execute tasks sequentially
                    for (const task of phase.tasks) {
                        const result = await this.orchestrator.executeEnhancedTask({
                            ...task,
                            workflowId,
                            phase: phase.name
                        });
                        phaseResults.push(result);
                    }
                }

                results.push({
                    phase: phase.name,
                    results: phaseResults,
                    completedAt: Date.now()
                });

                // Broadcast phase completion
                this.broadcastEvent('workflow:phase:completed', {
                    workflowId,
                    phase: phase.name,
                    results: phaseResults
                });
            }

            this.logger.info(`✅ Complex workflow completed: ${workflowDefinition.name}`);

            return {
                workflowId,
                name: workflowDefinition.name,
                results,
                completedAt: Date.now()
            };

        } catch (error) {
            this.logger.error('❌ Complex workflow failed:', error);
            throw error;
        }
    }

    /**
     * Get workflow visualization data
     */
    async getWorkflowVisualization(projectId) {
        try {
            const visualization = await this.orchestrator.getWorkflowVisualization(projectId);
            const context = await this.orchestrator.getContext(projectId);

            return {
                ...visualization,
                context,
                timestamp: Date.now()
            };
        } catch (error) {
            this.logger.error('Error getting workflow visualization:', error);
            throw error;
        }
    }

    /**
     * Initiate agent handoff with UI feedback
     */
    async initiateHandoffWithUI(fromAgent, toAgent, deliverables, projectId) {
        try {
            const handoffId = await this.orchestrator.initiateAgentHandoff(
                fromAgent, 
                toAgent, 
                deliverables
            );

            // Broadcast handoff initiation to UI
            this.broadcastEvent('handoff:initiated', {
                handoffId,
                fromAgent,
                toAgent,
                deliverables,
                projectId,
                timestamp: Date.now()
            });

            return handoffId;
        } catch (error) {
            this.logger.error('Error initiating handoff:', error);
            throw error;
        }
    }

    /**
     * Get real-time dashboard data
     */
    async getRealTimeDashboard() {
        const status = await this.getIntegratedStatus();
        
        return {
            timestamp: Date.now(),
            features: {
                totalFeatures: 7,
                activeFeatures: Object.values(this.integrationFeatures).filter(Boolean).length,
                featureStatus: this.integrationFeatures
            },
            performance: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            },
            agents: status.orchestrator?.agents || [],
            workflows: status.orchestrator?.digital?.workflows || [],
            uiConnections: this.uiAgent.connectedClients?.size || 0
        };
    }

    /**
     * Shutdown all integrated systems
     */
    async shutdown() {
        this.logger.info('🔄 Shutting down Integration Manager...');

        try {
            await this.uiAgent.stop();
            await this.orchestrator.shutdown();
            
            this.isInitialized = false;
            
            // Reset feature flags
            Object.keys(this.integrationFeatures).forEach(key => {
                this.integrationFeatures[key] = false;
            });

            this.logger.info('✅ Integration Manager shut down successfully');
        } catch (error) {
            this.logger.error('❌ Error during shutdown:', error);
            throw error;
        }
    }
}

export default IntegrationManager;