import { type User, type InsertUser, type Idea, type InsertIdea, type Agent, type AgentTask, type InsertAgentTask, type QueueStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User>;

  // Idea operations
  getIdeas(userId: string): Promise<Idea[]>;
  getIdea(id: string): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea & { userId: string }): Promise<Idea>;
  updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | undefined>;
  deleteIdea(id: string): Promise<boolean>;

  // Agent operations
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  incrementAgentUsage(id: string): Promise<void>;

  // Agent task operations
  getAgentTasks(userId: string): Promise<AgentTask[]>;
  getAgentTask(id: string): Promise<AgentTask | undefined>;
  createAgentTask(task: InsertAgentTask & { userId: string }): Promise<AgentTask>;
  updateAgentTask(id: string, updates: Partial<AgentTask>): Promise<AgentTask | undefined>;
  getQueuedTasks(): Promise<AgentTask[]>;

  // Queue status operations
  getQueueStatus(): Promise<QueueStatus | undefined>;
  updateQueueStatus(updates: Partial<QueueStatus>): Promise<QueueStatus>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private ideas: Map<string, Idea>;
  private agents: Map<string, Agent>;
  private agentTasks: Map<string, AgentTask>;
  private queueStatus: QueueStatus;

  constructor() {
    this.users = new Map();
    this.ideas = new Map();
    this.agents = new Map();
    this.agentTasks = new Map();
    this.queueStatus = {
      id: randomUUID(),
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageProcessingTime: 0,
      lastUpdated: new Date(),
    };

    // Initialize default agents
    this.initializeAgents();
  }

  private initializeAgents() {
    const defaultAgents: Agent[] = [
      {
        id: randomUUID(),
        name: "Brand Kit Generator",
        type: "brandKit",
        description: "Create comprehensive brand identities with logos, colors, and guidelines",
        icon: "fas fa-palette",
        isActive: true,
        usageCount: 23,
      },
      {
        id: randomUUID(),
        name: "Content Generator",
        type: "contentKit",
        description: "Generate social media captions, hashtags, and marketing copy",
        icon: "fas fa-pen-fancy",
        isActive: true,
        usageCount: 15,
      },
      {
        id: randomUUID(),
        name: "SEO Site Generator",
        type: "seoSiteGen",
        description: "Build optimized landing pages with SEO best practices",
        icon: "fas fa-search",
        isActive: true,
        usageCount: 8,
      },
      {
        id: randomUUID(),
        name: "Product Mockup",
        type: "productMockup",
        description: "Create professional product mockups and visualizations",
        icon: "fas fa-box",
        isActive: true,
        usageCount: 12,
      },
    ];

    defaultAgents.forEach(agent => this.agents.set(agent.id, agent));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      plan: insertUser.plan || "free",
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: customerId, 
      stripeSubscriptionId: subscriptionId 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getIdeas(userId: string): Promise<Idea[]> {
    return Array.from(this.ideas.values()).filter(idea => idea.userId === userId);
  }

  async getIdea(id: string): Promise<Idea | undefined> {
    return this.ideas.get(id);
  }

  async createIdea(ideaData: InsertIdea & { userId: string }): Promise<Idea> {
    const id = randomUUID();
    const idea: Idea = {
      ...ideaData,
      id,
      status: ideaData.status || "draft",
      tone: ideaData.tone || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.ideas.set(id, idea);
    return idea;
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | undefined> {
    const idea = this.ideas.get(id);
    if (!idea) return undefined;
    
    const updatedIdea = { ...idea, ...updates, updatedAt: new Date() };
    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }

  async deleteIdea(id: string): Promise<boolean> {
    return this.ideas.delete(id);
  }

  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async incrementAgentUsage(id: string): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      agent.usageCount = (agent.usageCount || 0) + 1;
      this.agents.set(id, agent);
    }
  }

  async getAgentTasks(userId: string): Promise<AgentTask[]> {
    return Array.from(this.agentTasks.values()).filter(task => task.userId === userId);
  }

  async getAgentTask(id: string): Promise<AgentTask | undefined> {
    return this.agentTasks.get(id);
  }

  async createAgentTask(taskData: InsertAgentTask & { userId: string }): Promise<AgentTask> {
    const id = randomUUID();
    const task: AgentTask = {
      ...taskData,
      id,
      status: taskData.status || "queued",
      output: taskData.output || null,
      feedback: taskData.feedback || null,
      rating: taskData.rating || null,
      ideaId: taskData.ideaId || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.agentTasks.set(id, task);
    
    // Update queue status
    if (this.queueStatus) {
      this.queueStatus.totalTasks++;
      this.queueStatus.lastUpdated = new Date();
    }
    
    return task;
  }

  async updateAgentTask(id: string, updates: Partial<AgentTask>): Promise<AgentTask | undefined> {
    const task = this.agentTasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    if (updates.status === "completed") {
      updatedTask.completedAt = new Date();
      if (this.queueStatus) {
        this.queueStatus.completedTasks++;
      }
    } else if (updates.status === "failed") {
      if (this.queueStatus) {
        this.queueStatus.failedTasks++;
      }
    }
    
    this.agentTasks.set(id, updatedTask);
    if (this.queueStatus) {
      this.queueStatus.lastUpdated = new Date();
    }
    return updatedTask;
  }

  async getQueuedTasks(): Promise<AgentTask[]> {
    return Array.from(this.agentTasks.values()).filter(task => task.status === "queued");
  }

  async getQueueStatus(): Promise<QueueStatus | undefined> {
    return this.queueStatus;
  }

  async updateQueueStatus(updates: Partial<QueueStatus>): Promise<QueueStatus> {
    this.queueStatus = { ...this.queueStatus, ...updates, lastUpdated: new Date() };
    return this.queueStatus;
  }
}

export const storage = new MemStorage();
