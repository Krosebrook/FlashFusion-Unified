import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIdeaSchema, insertAgentTaskSchema } from "@shared/schema";
import Anthropic from '@anthropic-ai/sdk';
import { setupZapierRoutes, zapierService, ZapierService } from "./zapier";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

// Queue processing
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    const queuedTasks = await storage.getQueuedTasks();
    
    for (const task of queuedTasks) {
      try {
        await storage.updateAgentTask(task.id, { status: "processing" });
        
        // Generate prompt based on agent type
        const prompt = generatePromptForAgent(task.agentId, task.input);
        
        // Call Claude API
        const response = await anthropic.messages.create({
          model: DEFAULT_MODEL_STR,
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        });

        const output = response.content[0].type === 'text' ? response.content[0].text : '';
        
        await storage.updateAgentTask(task.id, { 
          status: "completed", 
          output: { result: output, timestamp: Date.now() }
        });
        
        // Trigger Zapier webhooks for completed tasks
        const agent = await storage.getAgent(task.agentId);
        if (agent) {
          const userId = task.userId?.toString() || 'anonymous';
          
          // General agent task completion event
          await zapierService.triggerWebhooks(userId, ZapierService.EVENTS.AGENT_TASK_COMPLETED, {
            taskId: task.id,
            agentName: agent.name,
            agentType: agent.type,
            input: task.input,
            output: output,
            completedAt: new Date().toISOString()
          });
          
          // Specific agent type events
          const agentTypeEvents = {
            'Brand Kit Agent': ZapierService.EVENTS.BRAND_KIT_GENERATED,
            'Content Kit Agent': ZapierService.EVENTS.CONTENT_KIT_GENERATED,
            'SEO Site Generator': ZapierService.EVENTS.SEO_SITE_GENERATED,
            'Product Mockup Agent': ZapierService.EVENTS.PRODUCT_MOCKUP_GENERATED
          };
          
          const specificEvent = agentTypeEvents[agent.name as keyof typeof agentTypeEvents];
          if (specificEvent) {
            await zapierService.triggerWebhooks(userId, specificEvent, {
              taskId: task.id,
              agentName: agent.name,
              content: output,
              generatedAt: new Date().toISOString(),
              metadata: task.input
            });
          }
        }
        
        // Increment agent usage
        await storage.incrementAgentUsage(task.agentId);
        
      } catch (error) {
        console.error('Task processing failed:', error);
        await storage.updateAgentTask(task.id, { 
          status: "failed", 
          output: { error: (error as Error).message, timestamp: Date.now() }
        });
      }
      
      // Rate limiting - wait 2 seconds between tasks
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } finally {
    isProcessingQueue = false;
  }
}

function generatePromptForAgent(agentId: string, input: any): string {
  const { idea, tone, requirements } = input;
  
  switch (input.agentType) {
    case 'brandKit':
      return `Create a comprehensive brand identity kit for the following business idea: "${idea}"
      
Tone and style: ${tone || 'professional'}
Additional requirements: ${requirements || 'None'}

Please provide:
1. Brand name suggestions
2. Color palette with hex codes
3. Typography recommendations
4. Logo concepts and descriptions
5. Brand voice and messaging guidelines
6. Visual style recommendations

Format the response as a structured brand kit with clear sections.`;

    case 'contentKit':
      return `Generate social media content for the following business idea: "${idea}"
      
Tone and style: ${tone || 'engaging'}
Additional requirements: ${requirements || 'None'}

Please provide:
1. 5 Instagram captions with relevant hashtags
2. 3 Twitter/X posts
3. 1 LinkedIn post for professional audience
4. Content calendar suggestions for the first week
5. Hashtag strategy with trending and niche tags

Make sure all content aligns with the specified tone and business concept.`;

    case 'seoSiteGen':
      return `Create an SEO-optimized landing page structure for: "${idea}"
      
Tone and style: ${tone || 'professional'}
Additional requirements: ${requirements || 'None'}

Please provide:
1. Page title and meta description
2. H1 and H2 headings structure
3. Key sections and content outline
4. Primary and secondary keywords to target
5. Call-to-action suggestions
6. FAQ section ideas
7. Technical SEO recommendations

Structure this as a complete landing page blueprint with SEO best practices.`;

    case 'productMockup':
      return `Design product mockup concepts for: "${idea}"
      
Tone and style: ${tone || 'modern'}
Additional requirements: ${requirements || 'None'}

Please provide:
1. Product visualization descriptions
2. Packaging design concepts
3. Product photography style guidelines
4. Digital mockup suggestions
5. Product presentation ideas for marketing
6. Color schemes and visual elements

Describe each mockup concept in detail for implementation.`;

    default:
      return `Analyze and provide insights for the business idea: "${idea}"
      
Tone and style: ${tone || 'analytical'}
Requirements: ${requirements || 'None'}

Please provide relevant business insights and recommendations.`;
  }
}

// Start queue processing
setInterval(processQueue, 5000); // Check queue every 5 seconds

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Ideas routes
  app.get("/api/ideas", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const ideas = await storage.getIdeas(userId);
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ideas" });
    }
  });

  app.post("/api/ideas", async (req, res) => {
    try {
      const { userId, ...ideaData } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      const validatedData = insertIdeaSchema.parse(ideaData);
      const idea = await storage.createIdea({ ...validatedData, userId });
      
      // Trigger Zapier webhook for idea creation
      await zapierService.triggerWebhooks(userId, ZapierService.EVENTS.IDEA_CREATED, {
        ideaId: idea.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        tone: idea.tone,
        createdAt: new Date().toISOString(),
        userId: userId
      });
      
      res.status(201).json(idea);
    } catch (error) {
      res.status(400).json({ error: "Invalid idea data", details: (error as Error).message });
    }
  });

  app.put("/api/ideas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedIdea = await storage.updateIdea(id, updates);
      if (!updatedIdea) {
        return res.status(404).json({ error: "Idea not found" });
      }
      
      // Trigger Zapier webhook for idea update
      await zapierService.triggerWebhooks(updatedIdea.userId.toString(), ZapierService.EVENTS.IDEA_UPDATED, {
        ideaId: updatedIdea.id,
        title: updatedIdea.title,
        description: updatedIdea.description,
        category: updatedIdea.category,
        tone: updatedIdea.tone,
        updatedAt: new Date().toISOString(),
        changes: updates
      });
      
      res.json(updatedIdea);
    } catch (error) {
      res.status(500).json({ error: "Failed to update idea" });
    }
  });

  app.delete("/api/ideas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteIdea(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Idea not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete idea" });
    }
  });

  // Agents routes
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  // Agent tasks routes
  app.get("/api/agent-tasks", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const tasks = await storage.getAgentTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent tasks" });
    }
  });

  app.post("/api/agent-tasks", async (req, res) => {
    try {
      const { userId, ...taskData } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      const validatedData = insertAgentTaskSchema.parse(taskData);
      const task = await storage.createAgentTask({ ...validatedData, userId });
      
      // Trigger queue processing
      processQueue();
      
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data", details: (error as Error).message });
    }
  });

  app.post("/api/agent-tasks/:id/feedback", async (req, res) => {
    try {
      const { id } = req.params;
      const { feedback, rating } = req.body;
      
      const updatedTask = await storage.updateAgentTask(id, { feedback, rating });
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: "Failed to update feedback" });
    }
  });

  // Queue status route
  app.get("/api/queue-status", async (req, res) => {
    try {
      const status = await storage.getQueueStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue status" });
    }
  });

  // Users routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to create user", details: (error as Error).message });
    }
  });

  app.get("/api/users/firebase/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await storage.getUserByFirebaseUid(uid);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Setup Zapier webhook routes
  setupZapierRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
