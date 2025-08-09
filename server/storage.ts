import {
  users,
  chats,
  messages,
  smsMessages,
  chatParticipants,
  type User,
  type UpsertUser,
  type InsertUser,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage,
  type SmsMessage,
  type InsertSmsMessage,
  type ChatParticipant,
  type InsertChatParticipant,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(chatId: string): Promise<Chat | undefined>;
  getUserChats(userId: string): Promise<Chat[]>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  removeChatParticipant(chatId: string, userId: string): Promise<void>;
  getChatParticipants(chatId: string): Promise<(ChatParticipant & { user: User })[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getChatMessages(chatId: string, limit?: number): Promise<(Message & { sender: User })[]>;
  updateMessage(messageId: string, content: string): Promise<Message>;
  deleteMessage(messageId: string): Promise<void>;
  
  // SMS operations
  createSmsMessage(smsMessage: InsertSmsMessage): Promise<SmsMessage>;
  updateSmsMessageStatus(messageId: string, status: string, twilioSid?: string): Promise<SmsMessage>;
  getUserSmsMessages(userId: string): Promise<SmsMessage[]>;
  findSmsMessageByTwilioSid(twilioSid: string): Promise<SmsMessage | undefined>; // NEW
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Chat operations
  async createChat(chatData: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values(chatData).returning();
    return chat;
  }

  async getChat(chatId: string): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
    return chat;
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    const userChats = await db
      .select({
        id: chats.id,
        name: chats.name,
        isGroup: chats.isGroup,
        createdBy: chats.createdBy,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
      })
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .where(eq(chatParticipants.userId, userId))
      .orderBy(desc(chats.updatedAt));
    
    return userChats;
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    const [chatParticipant] = await db
      .insert(chatParticipants)
      .values(participant)
      .returning();
    return chatParticipant;
  }

  async removeChatParticipant(chatId: string, userId: string): Promise<void> {
    await db
      .delete(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatId, chatId),
          eq(chatParticipants.userId, userId)
        )
      );
  }

  async getChatParticipants(chatId: string): Promise<(ChatParticipant & { user: User })[]> {
    const participants = await db
      .select({
        id: chatParticipants.id,
        chatId: chatParticipants.chatId,
        userId: chatParticipants.userId,
        joinedAt: chatParticipants.joinedAt,
        isAdmin: chatParticipants.isAdmin,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          phoneNumber: users.phoneNumber,
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId,
          subscriptionStatus: users.subscriptionStatus,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(chatParticipants)
      .innerJoin(users, eq(chatParticipants.userId, users.id))
      .where(eq(chatParticipants.chatId, chatId));

    return participants;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getChatMessages(chatId: string, limit = 50): Promise<(Message & { sender: User })[]> {
    const chatMessages = await db
      .select({
        id: messages.id,
        chatId: messages.chatId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        metadata: messages.metadata,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          phoneNumber: users.phoneNumber,
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId,
          subscriptionStatus: users.subscriptionStatus,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return chatMessages.reverse(); // Return in chronological order
  }

  async updateMessage(messageId: string, content: string): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ content, updatedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();
    return message;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await db.delete(messages).where(eq(messages.id, messageId));
  }

  // SMS operations
  async createSmsMessage(smsData: InsertSmsMessage): Promise<SmsMessage> {
    const [smsMessage] = await db.insert(smsMessages).values(smsData).returning();
    return smsMessage;
  }

  async updateSmsMessageStatus(messageId: string, status: string, twilioSid?: string): Promise<SmsMessage> {
    const updateData: any = { status, updatedAt: new Date() };
    if (twilioSid) {
      updateData.twilioMessageSid = twilioSid;
    }

    const [smsMessage] = await db
      .update(smsMessages)
      .set(updateData)
      .where(eq(smsMessages.id, messageId))
      .returning();
    return smsMessage;
  }

  async getUserSmsMessages(userId: string): Promise<SmsMessage[]> {
    const userSmsMessages = await db
      .select()
      .from(smsMessages)
      .where(eq(smsMessages.fromUserId, userId))
      .orderBy(desc(smsMessages.createdAt));
    
    return userSmsMessages;
  }

  async findSmsMessageByTwilioSid(twilioSid: string): Promise<SmsMessage | undefined> {
    const [row] = await db
      .select()
      .from(smsMessages)
      .where(eq(smsMessages.twilioMessageSid, twilioSid));
    return row as SmsMessage | undefined;
  }
}

export const storage = new DatabaseStorage();