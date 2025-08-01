/**
 * Enhanced FlashFusion AI Agent API
 * Integrates the advanced agent framework with Firebase Functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import the new agent framework (would need to be transpiled for Node.js)
// For now, we'll create a simplified version that implements the same concepts

class EnhancedAgentFramework {
  constructor() {
    this.agents = new Map();
    this.orchestrator = new AgentOrchestrator();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Initialize specialized agents with enhanced capabilities
    await this.createSpecializedAgents();
    this.initialized = true;
  }

  async createSpecializedAgents() {
    const agentConfigs = [
      {
        id: 'coordinator',
        name: 'Coordinator Agent',
        type: 'coordinator',
        capabilities: ['orchestration', 'planning', 'coordination', 'strategy'],
        personality: this.getEnhancedPersonality('coordinator'),
        memory: new AgentMemory('coordinator'),
        tools: ['workflow_manager', 'agent_communicator', 'analytics']
      },
      {
        id: 'researcher',
        name: 'Research Agent',
        type: 'researcher',
        capabilities: ['research', 'analysis', 'data_gathering', 'trend_identification'],
        personality: this.getEnhancedPersonality('researcher'),
        memory: new AgentMemory('researcher'),
        tools: ['web_search', 'database_query', 'market_analyzer', 'competitor_tracker']
      },
      {
        id: 'creator',
        name: 'Creator Agent',
        type: 'creator',
        capabilities: ['content_creation', 'design', 'ideation', 'storytelling'],
        personality: this.getEnhancedPersonality('creator'),
        memory: new AgentMemory('creator'),
        tools: ['content_generator', 'design_tool', 'media_creator', 'brand_manager']
      },
      {
        id: 'automator',
        name: 'Automator Agent',
        type: 'automator',
        capabilities: ['automation', 'integration', 'workflow_optimization', 'process_improvement'],
        personality: this.getEnhancedPersonality('automator'),
        memory: new AgentMemory('automator'),
        tools: ['api_integrator', 'workflow_builder', 'process_optimizer', 'task_scheduler']
      },
      {
        id: 'analyzer',
        name: 'Analyzer Agent',
        type: 'analyzer',
        capabilities: ['data_analysis', 'performance_monitoring', 'predictive_modeling', 'insights'],
        personality: this.getEnhancedPersonality('analyzer'),
        memory: new AgentMemory('analyzer'),
        tools: ['analytics_engine', 'data_visualizer', 'ml_predictor', 'report_generator']
      },
      {
        id: 'optimizer',
        name: 'Optimizer Agent',
        type: 'optimizer',
        capabilities: ['optimization', 'performance_tuning', 'conversion_improvement', 'efficiency'],
        personality: this.getEnhancedPersonality('optimizer'),
        memory: new AgentMemory('optimizer'),
        tools: ['performance_analyzer', 'a_b_tester', 'conversion_optimizer', 'efficiency_tracker']
      }
    ];

    for (const config of agentConfigs) {
      const agent = new EnhancedAgent(config);
      await agent.initialize();
      this.agents.set(config.id, agent);
      this.orchestrator.registerAgent(agent);
    }
  }

  getEnhancedPersonality(agentType) {
    const personalities = {
      coordinator: {
        role: "Strategic Orchestrator and Workflow Coordinator",
        traits: ["analytical", "organized", "strategic", "collaborative"],
        expertise: ["workflow optimization", "agent coordination", "strategic planning", "resource allocation"],
        communication_style: "clear, structured, goal-oriented",
        decision_making: "data-driven with strategic oversight",
        learning_focus: "cross-workflow optimization patterns",
        memory_priorities: ["successful coordination strategies", "agent performance patterns", "workflow bottlenecks"]
      },
      researcher: {
        role: "Market Intelligence and Data Research Specialist",
        traits: ["thorough", "analytical", "curious", "methodical"],
        expertise: ["market analysis", "competitive intelligence", "trend identification", "data synthesis"],
        communication_style: "evidence-based, detailed, insightful",
        decision_making: "hypothesis-driven with rigorous validation",
        learning_focus: "research methodology improvement and source reliability",
        memory_priorities: ["successful research strategies", "reliable data sources", "market patterns"]
      },
      creator: {
        role: "Creative Content and Product Development Specialist",
        traits: ["innovative", "artistic", "adaptive", "user-focused"],
        expertise: ["content strategy", "brand development", "creative ideation", "user experience"],
        communication_style: "engaging, creative, user-centric",
        decision_making: "intuitive with user feedback integration",
        learning_focus: "creative effectiveness and audience engagement",
        memory_priorities: ["successful creative campaigns", "audience preferences", "brand guidelines"]
      },
      automator: {
        role: "Process Automation and Integration Specialist",
        traits: ["systematic", "efficient", "technical", "solution-oriented"],
        expertise: ["workflow automation", "system integration", "process optimization", "technical implementation"],
        communication_style: "technical, precise, solution-focused",
        decision_making: "efficiency-optimized with technical feasibility assessment",
        learning_focus: "automation patterns and integration best practices",
        memory_priorities: ["successful automations", "integration patterns", "performance optimizations"]
      },
      analyzer: {
        role: "Data Analytics and Business Intelligence Specialist",
        traits: ["logical", "detail-oriented", "predictive", "insight-driven"],
        expertise: ["data analysis", "performance metrics", "predictive modeling", "business intelligence"],
        communication_style: "data-driven, precise, actionable",
        decision_making: "statistical evidence-based with predictive modeling",
        learning_focus: "analytical accuracy and predictive model improvement",
        memory_priorities: ["analytical patterns", "prediction accuracy", "key performance indicators"]
      },
      optimizer: {
        role: "Performance and Conversion Optimization Specialist",
        traits: ["results-focused", "experimental", "iterative", "performance-driven"],
        expertise: ["conversion optimization", "A/B testing", "performance tuning", "efficiency improvement"],
        communication_style: "results-oriented, experimental, improvement-focused",
        decision_making: "test-driven with continuous optimization",
        learning_focus: "optimization strategies and performance improvement techniques",
        memory_priorities: ["successful optimizations", "test results", "performance benchmarks"]
      }
    };

    return personalities[agentType] || personalities.coordinator;
  }

  async processTask(task, agentType = 'coordinator') {
    await this.initialize();
    
    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent type '${agentType}' not found`);
    }

    return await agent.execute(task);
  }

  async orchestrateWorkflow(workflow) {
    await this.initialize();
    return await this.orchestrator.executeWorkflow(workflow);
  }

  getAgentStatus() {
    const status = {};
    for (const [id, agent] of this.agents) {
      status[id] = {
        status: agent.status,
        performance: agent.performance,
        capabilities: agent.capabilities,
        memory_size: agent.memory.getSize(),
        last_activity: agent.lastActivity
      };
    }
    return status;
  }
}

class EnhancedAgent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.capabilities = config.capabilities;
    this.personality = config.personality;
    this.memory = config.memory;
    this.tools = config.tools;
    this.status = 'idle';
    this.performance = {
      tasksCompleted: 0,
      successRate: 0,
      averageResponseTime: 0,
      learningProgress: 0
    };
    this.lastActivity = null;
  }

  async initialize() {
    await this.memory.initialize();
    this.status = 'ready';
  }

  async execute(task) {
    this.status = 'active';
    this.lastActivity = new Date();
    const startTime = Date.now();

    try {
      // Enhanced task processing with memory and learning
      const context = await this.gatherContext(task);
      const plan = await this.createPlan(task, context);
      const result = await this.executeWithTools(plan);
      
      // Store experience and learn
      await this.memory.store({
        task,
        context,
        plan,
        result,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      });

      this.updatePerformance(result, Date.now() - startTime);
      this.status = 'ready';

      return {
        success: true,
        result: result.content,
        agent: this.name,
        executionTime: Date.now() - startTime,
        confidence: result.confidence || 0.8,
        reasoning: result.reasoning,
        tools_used: result.tools_used || [],
        memory_context: context.relevant_memories?.length || 0
      };
    } catch (error) {
      this.status = 'error';
      await this.handleError(error, task);
      
      return {
        success: false,
        error: error.message,
        agent: this.name,
        executionTime: Date.now() - startTime
      };
    }
  }

  async gatherContext(task) {
    // Retrieve relevant memories
    const relevantMemories = await this.memory.recall(task);
    
    // Analyze task requirements
    const requirements = this.analyzeRequirements(task);
    
    // Assess available tools
    const availableTools = this.assessTools(requirements);

    return {
      relevant_memories: relevantMemories,
      requirements,
      available_tools: availableTools,
      agent_state: {
        performance: this.performance,
        capabilities: this.capabilities,
        personality: this.personality
      }
    };
  }

  async createPlan(task, context) {
    // Create execution plan based on task, context, and capabilities
    const strategy = this.selectStrategy(task, context);
    const steps = this.generateSteps(strategy, context);
    
    return {
      strategy,
      steps,
      estimated_time: this.estimateTime(steps),
      confidence: this.calculateConfidence(task, context),
      fallback_options: this.generateFallbacks(steps)
    };
  }

  async executeWithTools(plan) {
    const results = [];
    const toolsUsed = [];

    for (const step of plan.steps) {
      const tool = this.selectTool(step.action);
      if (tool) {
        const stepResult = await this.executeTool(tool, step.parameters);
        results.push(stepResult);
        toolsUsed.push(tool);
      } else {
        // Fall back to AI generation if no specific tool available
        const aiResult = await this.generateWithAI(step);
        results.push(aiResult);
        toolsUsed.push('ai_generator');
      }
    }

    // Synthesize results
    const finalResult = this.synthesizeResults(results, plan);
    
    return {
      content: finalResult,
      confidence: this.calculateResultConfidence(results),
      reasoning: this.generateReasoning(plan, results),
      tools_used: toolsUsed,
      intermediate_results: results
    };
  }

  analyzeRequirements(task) {
    const requirements = {
      type: task.type || 'general',
      complexity: this.assessComplexity(task),
      data_needs: this.identifyDataNeeds(task),
      output_format: task.output_format || 'text',
      constraints: task.constraints || [],
      success_criteria: task.success_criteria || []
    };

    return requirements;
  }

  selectStrategy(task, context) {
    // Select strategy based on agent personality and task requirements
    const strategies = this.getAvailableStrategies(task.type);
    const bestStrategy = strategies.find(s => 
      this.matchesCapabilities(s.requirements) && 
      this.meetsConstraints(s, task.constraints)
    ) || strategies[0];

    return bestStrategy;
  }

  generateSteps(strategy, context) {
    const baseSteps = strategy.steps || [];
    const enhancedSteps = baseSteps.map(step => ({
      ...step,
      id: this.generateStepId(),
      estimated_time: this.estimateStepTime(step),
      required_tools: this.identifyRequiredTools(step),
      success_criteria: this.defineStepCriteria(step)
    }));

    return enhancedSteps;
  }

  async generateWithAI(step) {
    // Enhanced AI generation with personality and context
    const prompt = this.buildEnhancedPrompt(step);
    
    // Use OpenAI or Anthropic based on availability
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    let aiResponse = '';
    
    if (openaiKey) {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: openaiKey });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4", // Upgraded for better quality
        messages: [
          { role: "system", content: this.buildSystemPrompt() },
          { role: "user", content: prompt }
        ],
        max_tokens: 500, // Increased for better responses
        temperature: 0.7
      });
      
      aiResponse = completion.choices[0].message.content;
    } else if (anthropicKey) {
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      
      const completion = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229", // Upgraded for better quality
        max_tokens: 500,
        messages: [
          { role: "user", content: `${this.buildSystemPrompt()}\n\n${prompt}` }
        ]
      });
      
      aiResponse = completion.content[0].text;
    } else {
      aiResponse = `I'm ${this.name} in demo mode. To enable full AI functionality, please add your API keys.`;
    }

    return {
      content: aiResponse,
      confidence: 0.8,
      source: 'ai_generation'
    };
  }

  buildSystemPrompt() {
    const personality = this.personality;
    return `You are ${this.name}, a ${personality.role}.

Your key traits: ${personality.traits.join(', ')}
Your expertise: ${personality.expertise.join(', ')}
Communication style: ${personality.communication_style}
Decision making approach: ${personality.decision_making}

Current performance metrics:
- Tasks completed: ${this.performance.tasksCompleted}
- Success rate: ${(this.performance.successRate * 100).toFixed(1)}%
- Learning progress: ${(this.performance.learningProgress * 100).toFixed(1)}%

Respond in character, leveraging your expertise and maintaining your communication style.`;
  }

  buildEnhancedPrompt(step) {
    return `Task: ${step.action}
Parameters: ${JSON.stringify(step.parameters)}
Context: ${step.context || 'General business context'}
Expected outcome: ${step.expected_outcome || 'High-quality result that meets user needs'}

Please provide a comprehensive response that demonstrates your expertise in ${this.personality.expertise.join(' and ')}.`;
  }

  synthesizeResults(results, plan) {
    // Combine individual step results into cohesive final output
    const contents = results.map(r => r.content).filter(c => c);
    
    if (contents.length === 1) {
      return contents[0];
    }
    
    // Multi-step synthesis based on agent type
    switch (this.type) {
      case 'researcher':
        return this.synthesizeResearch(contents);
      case 'creator':
        return this.synthesizeCreative(contents);
      case 'analyzer':
        return this.synthesizeAnalysis(contents);
      default:
        return contents.join('\n\n');
    }
  }

  synthesizeResearch(contents) {
    return `# Research Summary

## Key Findings
${contents.join('\n\n## Additional Insights\n')}

## Recommendations
Based on the research above, I recommend focusing on the most promising opportunities while monitoring emerging trends.`;
  }

  synthesizeCreative(contents) {
    return `# Creative Output

${contents.join('\n\n---\n\n')}

*This content has been crafted to align with your brand voice and engage your target audience effectively.*`;
  }

  synthesizeAnalysis(contents) {
    return `# Analysis Report

## Executive Summary
${contents[0] || 'Analysis completed successfully.'}

## Detailed Findings
${contents.slice(1).join('\n\n')}

## Next Steps
Monitor key metrics and implement recommended optimizations for continued improvement.`;
  }

  updatePerformance(result, responseTime) {
    this.performance.tasksCompleted++;
    this.performance.averageResponseTime = 
      (this.performance.averageResponseTime + responseTime) / 2;
    
    if (result.success !== false) {
      this.performance.successRate = 
        (this.performance.successRate * (this.performance.tasksCompleted - 1) + 1) / 
        this.performance.tasksCompleted;
    }
    
    this.performance.learningProgress += 0.01;
  }

  async handleError(error, task) {
    await this.memory.storeError({
      error: error.message,
      task,
      timestamp: new Date(),
      agent: this.id
    });
  }

  // Simplified implementations for demo
  assessComplexity(task) { return 3; }
  identifyDataNeeds(task) { return []; }
  getAvailableStrategies(type) { 
    return [{ 
      name: 'standard', 
      steps: [{ action: 'process', parameters: {} }],
      requirements: []
    }]; 
  }
  matchesCapabilities(requirements) { return true; }
  meetsConstraints(strategy, constraints) { return true; }
  generateStepId() { return Date.now().toString(); }
  estimateStepTime(step) { return 5000; }
  identifyRequiredTools(step) { return []; }
  defineStepCriteria(step) { return []; }
  estimateTime(steps) { return steps.length * 5000; }
  calculateConfidence(task, context) { return 0.8; }
  generateFallbacks(steps) { return []; }
  selectTool(action) { return null; }
  executeTool(tool, params) { return { content: 'Tool result', confidence: 0.9 }; }
  calculateResultConfidence(results) { return 0.8; }
  generateReasoning(plan, results) { return 'Applied systematic approach based on agent expertise.'; }
}

class AgentMemory {
  constructor(agentId) {
    this.agentId = agentId;
    this.shortTerm = [];
    this.longTerm = new Map();
    this.patterns = new Map();
  }

  async initialize() {
    // Load persistent memory from Firestore
    try {
      const db = admin.firestore();
      const memoryDoc = await db.collection('agent_memory').doc(this.agentId).get();
      
      if (memoryDoc.exists) {
        const data = memoryDoc.data();
        this.longTerm = new Map(data.longTerm || []);
        this.patterns = new Map(data.patterns || []);
      }
    } catch (error) {
      console.log(`Memory initialization failed for ${this.agentId}:`, error.message);
    }
  }

  async store(experience) {
    // Store in short-term memory
    this.shortTerm.push({
      ...experience,
      id: Date.now().toString()
    });

    // Move to long-term if significant
    if (this.isSignificant(experience)) {
      await this.moveToLongTerm(experience);
    }

    // Manage memory size
    if (this.shortTerm.length > 100) {
      this.shortTerm = this.shortTerm.slice(-50);
    }

    // Persist to Firestore
    await this.persist();
  }

  async recall(task) {
    const relevantMemories = [];
    
    // Search short-term memory
    const recentRelevant = this.shortTerm.filter(memory => 
      this.calculateRelevance(memory, task) > 0.3
    );
    relevantMemories.push(...recentRelevant);

    // Search long-term memory
    for (const [key, memory] of this.longTerm) {
      if (this.calculateRelevance(memory, task) > 0.5) {
        relevantMemories.push(memory);
      }
    }

    return relevantMemories.sort((a, b) => 
      this.calculateRelevance(b, task) - this.calculateRelevance(a, task)
    ).slice(0, 5);
  }

  async storeError(errorInfo) {
    await this.store({
      type: 'error',
      ...errorInfo
    });
  }

  calculateRelevance(memory, task) {
    let relevance = 0;
    
    // Task type matching
    if (memory.task?.type === task.type) {
      relevance += 0.4;
    }
    
    // Content similarity (simplified)
    if (memory.task?.message && task.message) {
      const memoryWords = memory.task.message.toLowerCase().split(' ');
      const taskWords = task.message.toLowerCase().split(' ');
      const commonWords = memoryWords.filter(word => taskWords.includes(word));
      relevance += (commonWords.length / Math.max(memoryWords.length, taskWords.length)) * 0.4;
    }
    
    // Recency bonus
    if (memory.timestamp) {
      const daysSince = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      relevance += Math.max(0, (7 - daysSince) / 7) * 0.2;
    }
    
    return Math.min(relevance, 1);
  }

  isSignificant(experience) {
    return experience.result?.success !== false && 
           experience.executionTime > 10000; // Longer tasks are more significant
  }

  async moveToLongTerm(experience) {
    const key = `${experience.task.type}_${Date.now()}`;
    this.longTerm.set(key, experience);
    
    // Limit long-term memory size
    if (this.longTerm.size > 500) {
      const oldestKey = Array.from(this.longTerm.keys())[0];
      this.longTerm.delete(oldestKey);
    }
  }

  async persist() {
    try {
      const db = admin.firestore();
      await db.collection('agent_memory').doc(this.agentId).set({
        longTerm: Array.from(this.longTerm.entries()),
        patterns: Array.from(this.patterns.entries()),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.log(`Memory persistence failed for ${this.agentId}:`, error.message);
    }
  }

  getSize() {
    return {
      shortTerm: this.shortTerm.length,
      longTerm: this.longTerm.size,
      patterns: this.patterns.size
    };
  }
}

class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.workflows = new Map();
  }

  registerAgent(agent) {
    this.agents.set(agent.id, agent);
  }

  async executeWorkflow(workflow) {
    const results = [];
    
    for (const task of workflow.tasks) {
      const agent = this.selectBestAgent(task);
      if (agent) {
        const result = await agent.execute(task);
        results.push(result);
      }
    }
    
    return {
      success: true,
      results,
      workflow: workflow.name || 'unnamed',
      totalTime: results.reduce((sum, r) => sum + (r.executionTime || 0), 0)
    };
  }

  selectBestAgent(task) {
    let bestAgent = null;
    let bestScore = 0;
    
    for (const [id, agent] of this.agents) {
      const score = this.scoreAgentForTask(agent, task);
      if (score > bestScore && agent.status === 'ready') {
        bestScore = score;
        bestAgent = agent;
      }
    }
    
    return bestAgent;
  }

  scoreAgentForTask(agent, task) {
    let score = 0;
    
    // Capability matching
    if (agent.capabilities.includes(task.type)) {
      score += 0.5;
    }
    
    // Performance history
    score += agent.performance.successRate * 0.3;
    
    // Availability
    if (agent.status === 'ready') {
      score += 0.2;
    }
    
    return score;
  }
}

// Initialize the enhanced framework
const enhancedFramework = new EnhancedAgentFramework();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

// Rate limiting (enhanced)
const rateLimitStore = new Map();
function enhancedRateLimiter(req, res, next) {
  const userId = req.body.userId || req.query.userId || req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 20; // Increased for enhanced functionality
  
  if (!rateLimitStore.has(userId)) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  const userLimit = rateLimitStore.get(userId);
  
  if (now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  if (userLimit.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Enhanced agents require reasonable usage.',
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    });
  }
  
  userLimit.count++;
  next();
}

// Enhanced health check
app.get('/health', (req, res) => {
  const agentStatus = enhancedFramework.getAgentStatus();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FlashFusion Enhanced AI Agents',
    version: '2.0.0',
    agents: agentStatus,
    features: [
      'Advanced Agent Framework',
      'Memory Management',
      'Learning Capabilities',
      'Multi-Agent Orchestration',
      'Enhanced Personalities'
    ]
  });
});

// Enhanced agent chat endpoint
app.post('/api/agents/chat', enhancedRateLimiter, async (req, res) => {
  try {
    const { 
      message, 
      agentType = 'coordinator', 
      userId = 'anonymous',
      context = {},
      requirements = {}
    } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Create enhanced task object
    const task = {
      type: agentType,
      message,
      description: message,
      context,
      requirements,
      constraints: requirements.constraints || [],
      success_criteria: requirements.success_criteria || [],
      userId,
      timestamp: new Date()
    };

    // Process with enhanced framework
    const result = await enhancedFramework.processTask(task, agentType);

    // Store conversation in Firestore with enhanced data
    const db = admin.firestore();
    await db.collection('conversations').add({
      userId,
      agentType,
      message,
      response: result.result,
      executionTime: result.executionTime,
      confidence: result.confidence,
      memoryContext: result.memory_context,
      toolsUsed: result.tools_used,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      data: {
        agent: result.agent,
        response: result.result,
        confidence: result.confidence,
        executionTime: result.executionTime,
        reasoning: result.reasoning,
        toolsUsed: result.tools_used,
        memoryContext: result.memory_context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Enhanced agent chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Multi-agent workflow endpoint
app.post('/api/workflows/execute', enhancedRateLimiter, async (req, res) => {
  try {
    const { workflow, userId = 'anonymous' } = req.body;
    
    if (!workflow || !workflow.tasks) {
      return res.status(400).json({
        success: false,
        error: 'Workflow with tasks is required'
      });
    }

    // Execute workflow with orchestrator
    const result = await enhancedFramework.orchestrateWorkflow(workflow);

    // Store workflow execution
    const db = admin.firestore();
    await db.collection('workflow_executions').add({
      userId,
      workflow: workflow.name || 'unnamed',
      tasks: workflow.tasks.length,
      results: result.results.length,
      totalTime: result.totalTime,
      success: result.success,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Workflow execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Workflow execution failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Agent status endpoint
app.get('/api/agents/status', (req, res) => {
  try {
    const status = enhancedFramework.getAgentStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get agent status'
    });
  }
});

// Agent memory insights endpoint
app.get('/api/agents/:agentId/memory', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = enhancedFramework.agents.get(agentId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    const memorySize = agent.memory.getSize();
    
    res.json({
      success: true,
      data: {
        agent: agentId,
        memory: memorySize,
        performance: agent.performance,
        lastActivity: agent.lastActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get memory insights'
    });
  }
});

// Export the enhanced API
exports.enhancedFlashfusionApi = functions.https.onRequest(app);