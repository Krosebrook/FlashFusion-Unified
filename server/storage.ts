import { type User, type InsertUser, type Idea, type InsertIdea, type Agent, type AgentTask, type InsertAgentTask, type QueueStatus, users, ideas, agents, agentTasks, queueStatus } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
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

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeAgents();
      this.initialized = true;
    }
  }

  private async initializeAgents() {
    // Check if agents already exist
    const existingAgents = await db.select().from(agents);
    if (existingAgents.length > 0) return;

    const defaultAgents = [
      {
        name: "Brand Kit Generator",
        type: "brandKit",
        description: "Create comprehensive brand identities with logos, colors, and guidelines",
        icon: "fas fa-palette",
        isActive: true,
        usageCount: 23,
      },
      {
        name: "Content Generator",
        type: "contentKit",
        description: "Generate social media captions, hashtags, and marketing copy",
        icon: "fas fa-pen-fancy",
        isActive: true,
        usageCount: 15,
      },
      {
        name: "SEO Site Generator",
        type: "seoSiteGen",
        description: "Build optimized landing pages with SEO best practices",
        icon: "fas fa-search",
        isActive: true,
        usageCount: 8,
      },
      {
        name: "Product Mockup",
        type: "productMockup",
        description: "Create professional product mockups and visualizations",
        icon: "fas fa-box",
        isActive: true,
        usageCount: 12,
      },
    ];

    await db.insert(agents).values(defaultAgents);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId, 
        stripeSubscriptionId: subscriptionId 
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) throw new Error("User not found");
    return user;
  }

  async getIdeas(userId: string): Promise<Idea[]> {
    return await db.select().from(ideas).where(eq(ideas.userId, userId));
  }

  async getIdea(id: string): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea || undefined;
  }

  async createIdea(ideaData: InsertIdea & { userId: string }): Promise<Idea> {
    const [idea] = await db
      .insert(ideas)
      .values(ideaData)
      .returning();
    return idea;
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | undefined> {
    const [idea] = await db
      .update(ideas)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ideas.id, id))
      .returning();
    return idea || undefined;
  }

  async deleteIdea(id: string): Promise<boolean> {
    const result = await db.delete(ideas).where(eq(ideas.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAgents(): Promise<Agent[]> {
    await this.ensureInitialized();
    return await db.select().from(agents);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async incrementAgentUsage(id: string): Promise<void> {
    await db
      .update(agents)
      .set({ usageCount: sql`${agents.usageCount} + 1` })
      .where(eq(agents.id, id));
  }

  async getAgentTasks(userId: string): Promise<AgentTask[]> {
    return await db.select().from(agentTasks).where(eq(agentTasks.userId, userId));
  }

  async getAgentTask(id: string): Promise<AgentTask | undefined> {
    const [task] = await db.select().from(agentTasks).where(eq(agentTasks.id, id));
    return task || undefined;
  }

  async createAgentTask(taskData: InsertAgentTask & { userId: string }): Promise<AgentTask> {
    const [task] = await db
      .insert(agentTasks)
      .values(taskData)
      .returning();
    
    // Update queue status
    await this.updateQueueStats('totalTasks', 1);
    
    return task;
  }

  async updateAgentTask(id: string, updates: Partial<AgentTask>): Promise<AgentTask | undefined> {
    const updateData = { ...updates };
    if (updates.status === "completed") {
      updateData.completedAt = new Date();
      await this.updateQueueStats('completedTasks', 1);
    } else if (updates.status === "failed") {
      await this.updateQueueStats('failedTasks', 1);
    }
    
    const [task] = await db
      .update(agentTasks)
      .set(updateData)
      .where(eq(agentTasks.id, id))
      .returning();
    
    return task || undefined;
  }

  async getQueuedTasks(): Promise<AgentTask[]> {
    return await db.select().from(agentTasks).where(eq(agentTasks.status, "queued"));
  }

  async getQueueStatus(): Promise<QueueStatus | undefined> {
    const [status] = await db.select().from(queueStatus).limit(1);
    return status || undefined;
  }

  async updateQueueStatus(updates: Partial<QueueStatus>): Promise<QueueStatus> {
    const updateData = { ...updates, lastUpdated: new Date() };
    
    // Try to update existing record first
    const [updated] = await db
      .update(queueStatus)
      .set(updateData)
      .returning();
    
    if (updated) {
      return updated;
    }
    
    // If no record exists, create one
    const [created] = await db
      .insert(queueStatus)
      .values({
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageProcessingTime: 0,
        ...updateData,
      })
      .returning();
    
    return created;
  }

  private async updateQueueStats(field: 'totalTasks' | 'completedTasks' | 'failedTasks', increment: number): Promise<void> {
    // Get current status or create if doesn't exist
    const currentStatus = await this.getQueueStatus();
    if (currentStatus) {
      await db
        .update(queueStatus)
        .set({ 
          [field]: sql`${queueStatus[field]} + ${increment}`,
          lastUpdated: new Date() 
        })
        .where(eq(queueStatus.id, currentStatus.id));
    } else {
      await db
        .insert(queueStatus)
        .values({
          totalTasks: field === 'totalTasks' ? increment : 0,
          completedTasks: field === 'completedTasks' ? increment : 0,
          failedTasks: field === 'failedTasks' ? increment : 0,
          averageProcessingTime: 0,
        });
    }
  }
}

export const storage = new DatabaseStorage();
