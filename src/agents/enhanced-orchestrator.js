import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import { DigitalProductOrchestrator } from './orchestration-system.js';

/**
 * Enhanced FlashFusion Agent Orchestrator
 * Integrates the 7-feature Digital Product Orchestration System
 */
class EnhancedAgentOrchestrator extends EventEmitter {
    constructor() {
        super();
        
        // Initialize core orchestrator
        this.digitalOrchestrator = new DigitalProductOrchestrator();
        
        // Original FlashFusion components
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
                new winston.transports.File({ filename: 'logs/enhanced-orchestrator.log' }),
                new winston.transports.Console()
            ]
        });
        
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageResponseTime: 0,
            activeAgents: 0,
            handoffSuccess: 0,
            workflowProgress: {}
        };

        // Enhanced capabilities
        this.roleMapping = this.initializeRoleMapping();
        this.workflowStates = new Map();
        this.contextMemory = new Map();
    }

    /**
     * Initialize the enhanced orchestrator with all 7 features
     */
    async initialize() {
        await this.digitalOrchestrator.initialize();
        this.setupEnhancedEventHandlers();
        this.logger.info('Enhanced Agent Orchestrator initialized with 7-feature system');
    }

    /**
     * Map FlashFusion agents to Digital Product roles
     */
    initializeRoleMapping() {
        return {
            'ui-agent': 'ui_designer',
            'figma-agent': 'ui_designer',
            'llm-agent': 'backend_developer',
            'scraper-agent': 'backend_developer',
            'workflow-agent': 'devops',
            'database-agent': 'backend_developer',
            'auth-agent': 'security_analyst',
            'monitoring-agent': 'devops'
        };
    }

    /**
     * Setup enhanced event handlers
     */
    setupEnhancedEventHandlers() {
        // Digital orchestrator events
        this.digitalOrchestrator.communication.on('handoff:completed', (data) => {
            this.metrics.handoffSuccess++;
            this.emit('enhanced:handoff:completed', data);
        });

        this.digitalOrchestrator.communication.on('handoff:timeout', (data) => {
            this.emit('enhanced:handoff:timeout', data);
        });
    }

    /**
     * Enhanced agent registration with role mapping
     */
    async registerEnhancedAgent(agentConfig) {
        // Register with original system
        const agentId = await this.registerAgent(agentConfig);
        
        // Map to digital product role
        const digitalRole = this.roleMapping[agentConfig.type] || agentConfig.type;
        
        // Enhanced agent data
        const enhancedAgent = {
            ...this.agents.get(agentId),
            digitalRole,
            capabilities: this.getDigitalCapabilities(digitalRole),
            workloadCapacity: this.getWorkloadCapacity(digitalRole),
            currentWorkload: 0
        };

        this.agents.set(agentId, enhancedAgent);
        
        this.logger.info(`Enhanced agent registered: ${agentConfig.name} -> ${digitalRole}`);
        return agentId;
    }

    /**
     * Get digital capabilities for a role
     */
    getDigitalCapabilities(role) {
        const roleCapabilities = this.digitalOrchestrator.roleSelector.roleCapabilities;
        return roleCapabilities[role]?.capabilities || [];
    }

    /**
     * Get workload capacity for a role
     */
    getWorkloadCapacity(role) {
        const roleCapabilities = this.digitalOrchestrator.roleSelector.roleCapabilities;
        return roleCapabilities[role]?.maxConcurrent || 1;
    }

    /**
     * Enhanced task execution with digital orchestration
     */
    async executeEnhancedTask(task) {
        const taskId = uuidv4();
        task.id = taskId;
        task.createdAt = new Date();
        
        this.metrics.totalTasks++;
        
        try {
            // Check if this is a complex product development request
            if (this.isProductDevelopmentTask(task)) {
                return await this.executeProductDevelopmentWorkflow(task);
            } else {
                // Use original FlashFusion orchestration
                return await this.executeTask(task);
            }
        } catch (error) {
            this.metrics.failedTasks++;
            this.logger.error(`Enhanced task ${taskId} failed:`, error);
            throw error;
        }
    }

    /**
     * Determine if task requires product development workflow
     */
    isProductDevelopmentTask(task) {
        const productKeywords = [
            'app', 'platform', 'system', 'product', 'website', 'service',
            'build', 'create', 'develop', 'design', 'launch', 'deploy'
        ];
        
        const description = task.description?.toLowerCase() || '';
        return productKeywords.some(keyword => description.includes(keyword));
    }

    /**
     * Execute product development workflow using digital orchestrator
     */
    async executeProductDevelopmentWorkflow(task) {
        const projectId = task.projectId || uuidv4();
        
        // Create product development request
        const productRequest = {
            projectId,
            description: task.description,
            priority: task.priority || 5,
            context: task.context || {}
        };

        // Execute with digital orchestrator
        const results = await this.digitalOrchestrator.processRequest(productRequest);
        
        // Store workflow state
        this.workflowStates.set(projectId, {
            taskId: task.id,
            status: 'in_progress',
            results,
            startedAt: Date.now()
        });

        // Update metrics
        this.metrics.completedTasks++;
        
        return {
            taskId: task.id,
            projectId,
            results,
            workflowType: 'product_development',
            timestamp: Date.now()
        };
    }

    /**
     * Enhanced agent communication with handoff support
     */
    async sendAgentMessage(fromAgentId, toAgentId, message, priority = 'normal') {
        const fromAgent = this.agents.get(fromAgentId);
        const toAgent = this.agents.get(toAgentId);
        
        if (!fromAgent || !toAgent) {
            throw new Error('Invalid agent IDs for message');
        }

        // Use digital orchestrator communication system
        const messageId = await this.digitalOrchestrator.communication.sendMessage(
            fromAgent.digitalRole,
            toAgent.digitalRole,
            message,
            priority
        );

        this.logger.info(`Message sent: ${fromAgent.name} -> ${toAgent.name} (${messageId})`);
        return messageId;
    }

    /**
     * Initiate agent handoff with validation
     */
    async initiateAgentHandoff(fromAgentId, toAgentId, deliverables, timeout = 300000) {
        const fromAgent = this.agents.get(fromAgentId);
        const toAgent = this.agents.get(toAgentId);
        
        if (!fromAgent || !toAgent) {
            throw new Error('Invalid agent IDs for handoff');
        }

        // Use digital orchestrator handoff system
        const handoffId = await this.digitalOrchestrator.communication.initiateHandoff(
            fromAgent.digitalRole,
            toAgent.digitalRole,
            deliverables,
            timeout
        );

        this.logger.info(`Handoff initiated: ${fromAgent.name} -> ${toAgent.name} (${handoffId})`);
        return handoffId;
    }

    /**
     * Get enhanced status with digital orchestrator data
     */
    async getEnhancedStatus() {
        const baseStatus = this.getStatus();
        const digitalStatus = await this.digitalOrchestrator.getDashboard();
        
        return {
            ...baseStatus,
            digital: digitalStatus,
            enhanced: {
                productWorkflows: this.workflowStates.size,
                roleMapping: this.roleMapping,
                handoffSuccess: this.metrics.handoffSuccess,
                contextMemory: this.contextMemory.size
            }
        };
    }

    /**
     * Get workflow visualization data
     */
    async getWorkflowVisualization(projectId) {
        const workflowState = this.workflowStates.get(projectId);
        if (!workflowState) {
            throw new Error(`Workflow not found: ${projectId}`);
        }

        return {
            projectId,
            taskId: workflowState.taskId,
            status: workflowState.status,
            results: workflowState.results,
            startedAt: workflowState.startedAt,
            duration: Date.now() - workflowState.startedAt,
            phases: this.getWorkflowPhases(workflowState.results)
        };
    }

    /**
     * Extract workflow phases from results
     */
    getWorkflowPhases(results) {
        const phases = {
            discovery: { completed: false, agents: [] },
            design: { completed: false, agents: [] },
            build: { completed: false, agents: [] },
            release: { completed: false, agents: [] },
            growth: { completed: false, agents: [] },
            maintenance: { completed: false, agents: [] }
        };

        // Analyze results to determine phase completion
        results.forEach(result => {
            if (result.agent) {
                const phase = this.mapAgentToPhase(result.agent);
                if (phases[phase]) {
                    phases[phase].agents.push(result.agent);
                    if (!result.error) {
                        phases[phase].completed = true;
                    }
                }
            }
        });

        return phases;
    }

    /**
     * Map agent role to workflow phase
     */
    mapAgentToPhase(agentRole) {
        const phaseMapping = {
            'visionary': 'discovery',
            'business_analyst': 'discovery',
            'ux_designer': 'design',
            'ui_designer': 'design',
            'mobile_developer': 'build',
            'backend_developer': 'build',
            'qa_engineer': 'build',
            'devops': 'release',
            'security_analyst': 'release',
            'marketing': 'growth'
        };
        
        return phaseMapping[agentRole] || 'build';
    }

    /**
     * Store context in memory with persistence
     */
    async storeContext(projectId, context, source) {
        const contextData = {
            projectId,
            context,
            source,
            timestamp: Date.now()
        };

        this.contextMemory.set(projectId, contextData);
        
        // Log context storage
        this.logger.info(`Context stored for project: ${projectId} from ${source}`);
        
        return contextData;
    }

    /**
     * Retrieve context from memory
     */
    async getContext(projectId) {
        const contextData = this.contextMemory.get(projectId);
        if (contextData) {
            this.logger.info(`Context retrieved for project: ${projectId}`);
        }
        return contextData;
    }

    /**
     * Original FlashFusion methods (preserved for compatibility)
     */
    async registerAgent(agentConfig) {
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

    async executeTask(task) {
        const taskId = task.id || uuidv4();
        task.id = taskId;
        task.createdAt = new Date();
        
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

            // Mock execution - replace with actual agent execution
            const result = await this.mockAgentExecution(suitableAgent, task);
            
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

    findSuitableAgent(task) {
        // Implementation for finding suitable agents
        const availableAgents = Array.from(this.agents.values())
            .filter(agent => agent.status === 'idle');
        
        return availableAgents[0] || null;
    }

    async mockAgentExecution(agent, task) {
        // Mock execution - replace with actual agent execution
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `Mock result from ${agent.name} for task: ${task.description}`;
    }

    updateMetrics(executionTime) {
        const totalExecutions = this.metrics.completedTasks + this.metrics.failedTasks;
        this.metrics.averageResponseTime = 
            (this.metrics.averageResponseTime * (totalExecutions - 1) + executionTime) / totalExecutions;
    }

    getStatus() {
        return {
            agents: Array.from(this.agents.values()).map(agent => ({
                id: agent.id,
                name: agent.name,
                type: agent.type,
                status: agent.status,
                capabilities: agent.capabilities,
                lastActivity: agent.lastActivity,
                digitalRole: agent.digitalRole
            })),
            metrics: this.metrics,
            activeJobs: this.activeJobs.size,
            queuedTasks: this.taskQueue.length
        };
    }

    async shutdown() {
        this.logger.info('Shutting down enhanced orchestrator...');
        
        // Cancel active jobs
        for (const [taskId, job] of this.activeJobs) {
            this.logger.warn(`Cancelling active job: ${taskId}`);
            job.agent.status = 'idle';
        }
        
        this.activeJobs.clear();
        this.agents.clear();
        this.workflowStates.clear();
        this.contextMemory.clear();
        
        this.emit('orchestrator:shutdown');
    }
}

export default EnhancedAgentOrchestrator;