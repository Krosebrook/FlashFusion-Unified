import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tone: text("tone"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
});

export const agentTasks = pgTable("agent_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: "cascade" }),
  agentId: varchar("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("queued"),
  input: jsonb("input").notNull(),
  output: jsonb("output"),
  feedback: text("feedback"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const queueStatus = pgTable("queue_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalTasks: integer("total_tasks").default(0),
  completedTasks: integer("completed_tasks").default(0),
  failedTasks: integer("failed_tasks").default(0),
  averageProcessingTime: integer("average_processing_time").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentTaskSchema = createInsertSchema(agentTasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  completedAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ideas: many(ideas),
  agentTasks: many(agentTasks),
}));

export const ideasRelations = relations(ideas, ({ one, many }) => ({
  user: one(users, {
    fields: [ideas.userId],
    references: [users.id],
  }),
  agentTasks: many(agentTasks),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  agentTasks: many(agentTasks),
}));

export const agentTasksRelations = relations(agentTasks, ({ one }) => ({
  user: one(users, {
    fields: [agentTasks.userId],
    references: [users.id],
  }),
  idea: one(ideas, {
    fields: [agentTasks.ideaId],
    references: [ideas.id],
  }),
  agent: one(agents, {
    fields: [agentTasks.agentId],
    references: [agents.id],
  }),
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;
export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;
export type AgentTask = typeof agentTasks.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type QueueStatus = typeof queueStatus.$inferSelect;
