import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { smsService } from "./smsService";
import { insertMessageSchema, insertChatSchema, insertSmsMessageSchema, insertChatParticipantSchema } from "../shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

// WebSocket connections map
const wsConnections = new Map<string, WebSocket>();

function parsePositiveInt(value: any, fallback: number, max: number): number {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function assertBodySize(req: any, maxBytes = 1024 * 1024) {
  const length = Number(req.headers['content-length'] || 0);
  if (length > maxBytes) {
    const err: any = new Error('Payload too large');
    err.status = 413;
    throw err;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      assertBodySize(req, 256 * 1024);
      const amountNumber = Number(req.body?.amount);
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amountNumber * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      assertBodySize(req, 256 * 1024);
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
          expand: ['payment_intent']
        });

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (invoice as any).payment_intent?.client_secret,
        });
        return;
      }

      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });
      }

      const priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId || !priceId.startsWith('price_')) {
        return res.status(500).json({ message: 'Stripe price ID not configured' });
      }

      const subscription = await stripe.subscriptions.create({
        customer: (customer as any).id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, (customer as any).id, subscription.id);

      const invoice = subscription.latest_invoice as any;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice.payment_intent?.client_secret,
      });
    } catch (error: any) {
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Chat routes
  app.post('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      assertBodySize(req, 256 * 1024);
      const userId = req.user.claims.sub;
      const chatData = insertChatSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const chat = await storage.createChat(chatData);
      
      // Add creator as participant
      await storage.addChatParticipant({
        chatId: chat.id,
        userId: userId,
        isAdmin: true,
      });
      
      res.json(chat);
    } catch (error: any) {
      console.error("Error creating chat:", error);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.get('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getUserChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get('/api/chats/:chatId', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      res.json(chat);
    } catch (error) {
      console.error("Error fetching chat:", error);
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.post('/api/chats/:chatId/participants', isAuthenticated, async (req: any, res) => {
    try {
      assertBodySize(req, 128 * 1024);
      const { chatId } = req.params;
      const participantData = insertChatParticipantSchema.parse({
        chatId,
        ...req.body,
      });
      
      const participant = await storage.addChatParticipant(participantData);
      res.json(participant);
    } catch (error: any) {
      console.error("Error adding participant:", error);
      res.status(500).json({ message: "Failed to add participant" });
    }
  });

  app.get('/api/chats/:chatId/participants', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const participants = await storage.getChatParticipants(chatId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Message routes
  app.post('/api/chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      assertBodySize(req, 256 * 1024);
      const userId = req.user.claims.sub;
      const { chatId } = req.params;
      
      const messageData = insertMessageSchema.parse({
        chatId,
        senderId: userId,
        ...req.body,
      });
      
      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket connections
      const user = await storage.getUser(userId);
      const messageWithSender = { ...message, sender: user };
      
      // Notify all participants via WebSocket
      const participants = await storage.getChatParticipants(chatId);
      participants.forEach(participant => {
        const ws = wsConnections.get(participant.userId || '');
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'new_message',
            data: messageWithSender
          }));
        }
      });
      
      res.json(messageWithSender);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const limit = parsePositiveInt(req.query.limit, 50, 200);
      
      const messages = await storage.getChatMessages(chatId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // SMS routes
  app.post('/api/sms/send', isAuthenticated, async (req: any, res) => {
    try {
      assertBodySize(req, 64 * 1024);
      const userId = req.user.claims.sub;
      const smsData = insertSmsMessageSchema.parse({
        fromUserId: userId,
        ...req.body,
      });
      
      const result = await smsService.sendSms(
        smsData.fromUserId || '',
        smsData.toPhoneNumber,
        smsData.content
      );
      
      if (result.success) {
        res.json({ success: true, messageId: result.messageId });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ message: "Failed to send SMS" });
    }
  });

  app.get('/api/sms/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await smsService.getUserSmsHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching SMS history:", error);
      res.status(500).json({ message: "Failed to fetch SMS history" });
    }
  });

  // Twilio webhook for SMS status updates
  app.post('/api/sms/webhook', async (req, res) => {
    try {
      const result = await smsService.handleTwilioWebhook(req.body);
      res.json(result);
    } catch (error) {
      console.error("Error handling Twilio webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    // Extract user ID from query params or headers
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      wsConnections.set(userId, ws);
      console.log(`User ${userId} connected via WebSocket`);
    }
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);
        
        // Handle different message types
        switch (message.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          case 'join_chat':
            // Handle joining a chat room
            break;
          case 'leave_chat':
            // Handle leaving a chat room
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        wsConnections.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}