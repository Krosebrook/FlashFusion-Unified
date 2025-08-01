import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

/**
 * FlashFusion Agent Orchestrator
 * Manages multiple AI agents with autonomous capabilities
 */
class AgentOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.agents = new Map();
        this.taskQueue = [];
        this.activeJobs = new Map();
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/orchestrator.log' }),
                new winston.transports.Console()
            ]
        });
        
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageResponseTime: 0,
            activeAgents: 0
        };
    }

    /**
     * Register a new agent with the orchestrator
     */
    registerAgent(agentConfig) {
        const agent = {
            id: agentConfig.id || uuidv4(),
            name: agentConfig.name,
            type: agentConfig.type,
            capabilities: agentConfig.capabilities || [],
            status: 'idle',
            lastActivity: new Date(),
            config: agentConfig,
            instance: null,
            healthCheck: agentConfig.healthCheck || (() => true)
        };

        this.agents.set(agent.id, agent);
        this.metrics.activeAgents++;
        
        this.logger.info(`Agent registered: ${agent.name} (${agent.type})`);
        this.emit('agent:registered', agent);
        
        return agent.id;
    }

    /**
     * Create and manage different types of agents
     */
    async createAgent(type, config = {}) {
        const agentFactories = {
            'ui-agent': () => this.createUIAgent(config),
            'figma-agent': () => this.createFigmaAgent(config),
            'workflow-agent': () => this.createWorkflowAgent(config),
            'llm-agent': () => this.createLLMAgent(config),
            'scraper-agent': () => this.createScraperAgent(config),
            'database-agent': () => this.createDatabaseAgent(config),
            'auth-agent': () => this.createAuthAgent(config),
            'monitoring-agent': () => this.createMonitoringAgent(config)
        };

        const factory = agentFactories[type];
        if (!factory) {
            throw new Error(`Unknown agent type: ${type}`);
        }

        const agent = await factory();
        return this.registerAgent(agent);
    }

    /**
     * UI Agent for real-time interface updates
     */
    createUIAgent(config) {
        return {
            name: 'UI Development Agent',
            type: 'ui-agent',
            capabilities: [
                'real-time-updates',
                'component-generation',
                'style-optimization',
                'responsive-design',
                'accessibility-checks'
            ],
            config: {
                frameworks: ['react', 'angular', 'vue'],
                realTimeSocket: config.socketUrl || 'ws://localhost:3001',
                updateFrequency: config.updateFrequency || 100,
                ...config
            },
            async execute(task) {
                switch (task.action) {
                    case 'update-component':
                        return await this.updateComponent(task.data);
                    case 'generate-styles':
                        return await this.generateStyles(task.data);
                    case 'optimize-performance':
                        return await this.optimizePerformance(task.data);
                    default:
                        throw new Error(`Unknown UI action: ${task.action}`);
                }
            }
        };
    }

    /**
     * Figma Integration Agent
     */
    createFigmaAgent(config) {
        return {
            name: 'Figma Integration Agent',
            type: 'figma-agent',
            capabilities: [
                'design-sync',
                'component-extraction',
                'asset-generation',
                'design-tokens',
                'prototype-conversion'
            ],
            config: {
                apiKey: config.figmaApiKey || process.env.FIGMA_API_KEY,
                projectId: config.projectId,
                syncInterval: config.syncInterval || 5000,
                ...config
            },
            async execute(task) {
                switch (task.action) {
                    case 'sync-designs':
                        return await this.syncDesigns(task.data);
                    case 'extract-components':
                        return await this.extractComponents(task.data);
                    case 'generate-code':
                        return await this.generateCodeFromDesign(task.data);
                    default:
                        throw new Error(`Unknown Figma action: ${task.action}`);
                }
            }
        };
    }

    /**
     * Multi-LLM Agent (Claude, GPT, Gemini)
     */
    createLLMAgent(config) {
        return {
            name: 'Multi-LLM Agent',
            type: 'llm-agent', 
            capabilities: [
                'code-generation',
                'problem-solving',
                'documentation',
                'testing',
                'refactoring'
            ],
            config: {
                models: {
                    claude: config.anthropicKey || process.env.ANTHROPIC_API_KEY,
                    gpt: config.openaiKey || process.env.OPENAI_API_KEY,
                    gemini: config.geminiKey || process.env.GEMINI_API_KEY
                },
                defaultModel: config.defaultModel || 'claude',
                maxTokens: config.maxTokens || 4000,
                ...config
            },
            async execute(task) {
                const model = task.model || this.config.defaultModel;
                switch (task.action) {
                    case 'generate-code':
                        return await this.generateCode(task.data, model);
                    case 'analyze-code':
                        return await this.analyzeCode(task.data, model);
                    case 'create-tests':
                        return await this.createTests(task.data, model);
                    default:
                        throw new Error(`Unknown LLM action: ${task.action}`);
                }
            }
        };
    }

    /**
     * Web Scraping Agent
     */
    createScraperAgent(config) {
        return {
            name: 'Web Scraping Agent',
            type: 'scraper-agent',
            capabilities: [
                'data-extraction',
                'site-monitoring',
                'api-discovery',
                'content-analysis',
                'competitive-intelligence'
            ],
            config: {
                userAgent: config.userAgent || 'FlashFusion-Bot/1.0',
                maxConcurrency: config.maxConcurrency || 5,
                timeout: config.timeout || 30000,
                ...config
            },
            async execute(task) {
                switch (task.action) {
                    case 'scrape-url':
                        return await this.scrapeUrl(task.data);
                    case 'monitor-changes':
                        return await this.monitorChanges(task.data);
                    case 'extract-apis':
                        return await this.extractApis(task.data);
                    default:
                        throw new Error(`Unknown scraper action: ${task.action}`);
                }
            }
        };
    }

    /**
     * Workflow Automation Agent
     */
    createWorkflowAgent(config) {
        return {
            name: 'Workflow Automation Agent',
            type: 'workflow-agent',
            capabilities: [
                'task-orchestration',
                'dependency-management',
                'error-recovery',
                'parallel-execution',
                'conditional-logic'
            ],
            config: {
                maxRetries: config.maxRetries || 3,
                retryDelay: config.retryDelay || 1000,
                parallelLimit: config.parallelLimit || 10,
                ...config
            },
            async execute(task) {
                switch (task.action) {
                    case 'run-workflow':
                        return await this.runWorkflow(task.data);
                    case 'create-pipeline':
                        return await this.createPipeline(task.data);
                    case 'manage-dependencies':
                        return await this.manageDependencies(task.data);
                    default:
                        throw new Error(`Unknown workflow action: ${task.action}`);
                }
            }
        };
    }

    /**
     * Database Management Agent
     */
    createDatabaseAgent(config) {
        return {
            name: 'Database Management Agent',
            type: 'database-agent',
            capabilities: [
                'schema-migration',
                'data-optimization',
                'backup-management',
                'query-optimization',
                'security-auditing'
            ],
            config: {
                connectionString: config.connectionString || process.env.DATABASE_URL,
                backupSchedule: config.backupSchedule || '0 2 * * *',
                ...config
            }
        };
    }

    /**
     * Authentication & Security Agent
     */
    createAuthAgent(config) {
        return {
            name: 'Authentication & Security Agent',
            type: 'auth-agent',
            capabilities: [
                'user-management',
                'permission-control',
                'security-monitoring',
                'oauth-integration',
                'audit-logging'
            ],
            config: {
                jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
                sessionTimeout: config.sessionTimeout || 3600000,
                ...config
            }
        };
    }

    /**
     * Monitoring & Analytics Agent
     */
    createMonitoringAgent(config) {
        return {
            name: 'Monitoring & Analytics Agent',
            type: 'monitoring-agent',
            capabilities: [
                'performance-tracking',
                'error-detection',
                'usage-analytics',
                'alerting',
                'reporting'
            ],
            config: {
                metricsInterval: config.metricsInterval || 60000,
                alertThresholds: config.alertThresholds || {},
                ...config
            }
        };
    }

    /**
     * Execute a task with the most suitable agent
     */
    async executeTask(task) {
        const taskId = uuidv4();
        task.id = taskId;
        task.createdAt = new Date();
        
        this.metrics.totalTasks++;
        
        try {
            const suitableAgent = this.findSuitableAgent(task);
            if (!suitableAgent) {
                throw new Error(`No suitable agent found for task: ${task.type}`);
            }

            this.logger.info(`Executing task ${taskId} with agent ${suitableAgent.name}`);
            
            suitableAgent.status = 'busy';
            this.activeJobs.set(taskId, {
                task,
                agent: suitableAgent,
                startTime: Date.now()
            });

            const result = await suitableAgent.instance.execute(task);
            
            const endTime = Date.now();
            const executionTime = endTime - this.activeJobs.get(taskId).startTime;
            
            this.updateMetrics(executionTime);
            this.activeJobs.delete(taskId);
            suitableAgent.status = 'idle';
            suitableAgent.lastActivity = new Date();
            
            this.metrics.completedTasks++;
            this.logger.info(`Task ${taskId} completed in ${executionTime}ms`);
            
            this.emit('task:completed', { taskId, result, executionTime });
            
            return {
                taskId,
                result,
                executionTime,
                agent: suitableAgent.name
            };
            
        } catch (error) {
            this.metrics.failedTasks++;
            this.logger.error(`Task ${taskId} failed:`, error);
            this.emit('task:failed', { taskId, error });
            throw error;
        }
    }

    /**
     * Find the most suitable agent for a task
     */
    findSuitableAgent(task) {
        const availableAgents = Array.from(this.agents.values())
            .filter(agent => agent.status === 'idle')
            .filter(agent => this.agentCanHandleTask(agent, task));

        if (availableAgents.length === 0) {
            return null;
        }

        // Select agent with most relevant capabilities
        return availableAgents.sort((a, b) => {
            const aScore = this.calculateAgentScore(a, task);
            const bScore = this.calculateAgentScore(b, task);
            return bScore - aScore;
        })[0];
    }

    /**
     * Check if agent can handle a specific task
     */
    agentCanHandleTask(agent, task) {
        if (task.requiredCapabilities) {
            return task.requiredCapabilities.every(cap => 
                agent.capabilities.includes(cap)
            );
        }
        
        // Default mapping based on task type
        const taskTypeMapping = {
            'ui-update': ['ui-agent'],
            'design-sync': ['figma-agent'],
            'code-generation': ['llm-agent'],
            'data-scraping': ['scraper-agent'],
            'workflow-execution': ['workflow-agent'],
            'database-operation': ['database-agent'],
            'auth-management': ['auth-agent'],
            'monitoring': ['monitoring-agent']
        };
        
        const compatibleTypes = taskTypeMapping[task.type] || [];
        return compatibleTypes.includes(agent.type);
    }

    /**
     * Calculate agent suitability score for a task
     */
    calculateAgentScore(agent, task) {
        let score = 0;
        
        // Capability match
        if (task.requiredCapabilities) {
            const matchingCapabilities = task.requiredCapabilities.filter(cap =>
                agent.capabilities.includes(cap)
            );
            score += matchingCapabilities.length * 10;
        }
        
        // Recency bonus (prefer recently active agents)
        const timeSinceActivity = Date.now() - agent.lastActivity.getTime();
        score += Math.max(0, 100 - timeSinceActivity / 60000); // Decay over minutes
        
        return score;
    }

    /**
     * Update performance metrics
     */
    updateMetrics(executionTime) {
        const totalExecutions = this.metrics.completedTasks + this.metrics.failedTasks;
        this.metrics.averageResponseTime = 
            (this.metrics.averageResponseTime * (totalExecutions - 1) + executionTime) / totalExecutions;
    }

    /**
     * Get orchestrator status and metrics
     */
    getStatus() {
        return {
            agents: Array.from(this.agents.values()).map(agent => ({
                id: agent.id,
                name: agent.name,
                type: agent.type,
                status: agent.status,
                capabilities: agent.capabilities,
                lastActivity: agent.lastActivity
            })),
            metrics: this.metrics,
            activeJobs: this.activeJobs.size,
            queuedTasks: this.taskQueue.length
        };
    }

    /**
     * Perform health checks on all agents
     */
    async performHealthChecks() {
        const healthResults = [];
        
        for (const [id, agent] of this.agents) {
            try {
                const isHealthy = await agent.healthCheck();
                healthResults.push({
                    agentId: id,
                    name: agent.name,
                    healthy: isHealthy,
                    lastCheck: new Date()
                });
            } catch (error) {
                healthResults.push({
                    agentId: id,
                    name: agent.name,
                    healthy: false,
                    error: error.message,
                    lastCheck: new Date()
                });
            }
        }
        
        return healthResults;
    }

    /**
     * Shutdown orchestrator and all agents
     */
    async shutdown() {
        this.logger.info('Shutting down orchestrator...');
        
        // Cancel active jobs
        for (const [taskId, job] of this.activeJobs) {
            this.logger.warn(`Cancelling active job: ${taskId}`);
            job.agent.status = 'idle';
        }
        
        this.activeJobs.clear();
        
        // Clean up agents
        for (const [id, agent] of this.agents) {
            if (agent.instance && agent.instance.cleanup) {
                await agent.instance.cleanup();
            }
        }
        
        this.agents.clear();
        this.emit('orchestrator:shutdown');
    }
}

export default AgentOrchestrator;