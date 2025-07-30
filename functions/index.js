const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' })); // Reduced payload limit

// Simple rate limiting store
const rateLimitStore = new Map();

// Rate limiting middleware
function rateLimiter(req, res, next) {
  const userId = req.body.userId || req.query.userId || 'anonymous';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per minute per user
  
  if (!rateLimitStore.has(userId)) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  const userLimit = rateLimitStore.get(userId);
  
  if (now > userLimit.resetTime) {
    // Reset window
    rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  if (userLimit.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait before making more requests.',
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    });
  }
  
  userLimit.count++;
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FlashFusion Firebase Functions',
    version: '1.0.0'
  });
});

// AI Orchestration endpoints
app.post('/api/agents/chat', rateLimiter, async (req, res) => {
  try {
    const { message, agentType = 'coordinator', userId = 'anonymous' } = req.body;
    
    // Basic validation
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Initialize OpenAI or Anthropic based on availability
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    let aiResponse = '';
    
    if (openaiKey) {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: openaiKey });
      
      const agentPersonality = getAgentPersonality(agentType);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // More cost-effective than GPT-4
        messages: [
          { role: "system", content: agentPersonality },
          { role: "user", content: message }
        ],
        max_tokens: 150, // Reduced from 500 to minimize costs
        temperature: 0.7
      });
      
      aiResponse = completion.choices[0].message.content;
    } else if (anthropicKey) {
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      
      const agentPersonality = getAgentPersonality(agentType);
      
      const completion = await anthropic.messages.create({
        model: "claude-3-haiku-20240307", // More cost-effective than Sonnet
        max_tokens: 150, // Reduced from 500 to minimize costs
        messages: [
          { role: "user", content: `${agentPersonality}\n\nUser: ${message}` }
        ]
      });
      
      aiResponse = completion.content[0].text;
    } else {
      aiResponse = `Hello! I'm the ${agentType} agent. I'm currently in demo mode. To enable full AI functionality, please add your OPENAI_API_KEY or ANTHROPIC_API_KEY to your environment variables.`;
    }

    // Store conversation in Firestore
    const db = admin.firestore();
    await db.collection('conversations').add({
      userId,
      agentType,
      message,
      response: aiResponse,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    const response = {
      success: true,
      data: {
        agent: agentType,
        response: aiResponse,
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Agent chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Agent personality definitions
function getAgentPersonality(agentType) {
  const personalities = {
    coordinator: "You are the Coordinator Agent for FlashFusion. You orchestrate workflows, manage agent collaboration, and provide strategic oversight. You're analytical, organized, and focused on optimizing business operations across development, commerce, and content workflows.",
    
    creator: "You are the Creator Agent for FlashFusion. You specialize in content generation, product development, and creative solutions. You're innovative, artistic, and skilled at transforming ideas into compelling content and products.",
    
    researcher: "You are the Researcher Agent for FlashFusion. You excel at market research, competitor analysis, trend identification, and data gathering. You're thorough, analytical, and provide evidence-based insights.",
    
    automator: "You are the Automator Agent for FlashFusion. You focus on task automation, integration management, and workflow optimization. You're technical, efficient, and skilled at streamlining processes.",
    
    analyzer: "You are the Analyzer Agent for FlashFusion. You specialize in performance analytics, predictive modeling, and business intelligence. You're data-driven, insightful, and excel at turning metrics into actionable strategies.",
    
    optimizer: "You are the Optimizer Agent for FlashFusion. You focus on conversion optimization, SEO, performance tuning, and efficiency improvements. You're results-oriented, technical, and constantly seek to improve outcomes."
  };
  
  return personalities[agentType] || personalities.coordinator;
}

// Workflow management
app.get('/api/workflows', async (req, res) => {
  try {
    const { userId = 'anonymous' } = req.query;
    const db = admin.firestore();
    const workflowsSnapshot = await db.collection('workflows')
      .where('userId', '==', userId)
      .get();
    
    const workflows = [];
    workflowsSnapshot.forEach(doc => {
      workflows.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    console.error('Workflows fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflows'
    });
  }
});

// Create workflow
app.post('/api/workflows', async (req, res) => {
  try {
    const { name, type, description, config = {}, userId = 'anonymous' } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }
    
    const db = admin.firestore();
    const workflowData = {
      name,
      type,
      description: description || '',
      config,
      userId,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('workflows').add(workflowData);
    
    res.json({
      success: true,
      data: {
        id: docRef.id,
        ...workflowData
      }
    });
  } catch (error) {
    console.error('Workflow creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workflow'
    });
  }
});

// Get conversation history
app.get('/api/conversations', async (req, res) => {
  try {
    const { userId = 'anonymous', agentType, limit = 50 } = req.query;
    const db = admin.firestore();
    
    let query = db.collection('conversations')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));
    
    if (agentType) {
      query = query.where('agentType', '==', agentType);
    }
    
    const conversationsSnapshot = await query.get();
    
    const conversations = [];
    conversationsSnapshot.forEach(doc => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Agent status endpoint
app.get('/api/agents', async (req, res) => {
  try {
    const agents = [
      { id: 'coordinator', name: 'Coordinator', status: 'active', description: 'Orchestrates workflows and manages agent collaboration' },
      { id: 'creator', name: 'Creator', status: 'active', description: 'Specializes in content generation and creative solutions' },
      { id: 'researcher', name: 'Researcher', status: 'active', description: 'Excels at market research and data analysis' },
      { id: 'automator', name: 'Automator', status: 'active', description: 'Focuses on task automation and workflow optimization' },
      { id: 'analyzer', name: 'Analyzer', status: 'active', description: 'Specializes in performance analytics and insights' },
      { id: 'optimizer', name: 'Optimizer', status: 'active', description: 'Focuses on conversion optimization and performance tuning' }
    ];
    
    res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('Agents fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents'
    });
  }
});

// Export the Express app as a Firebase Function
exports.flashfusionApi = functions.https.onRequest(app);