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
app.use(express.json({ limit: '10mb' }));

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
app.post('/api/agents/chat', async (req, res) => {
  try {
    const { message, agentType = 'universal' } = req.body;
    
    // Basic validation
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // TODO: Integrate with FlashFusion AI agents
    const response = {
      success: true,
      data: {
        agent: agentType,
        response: `Echo from Firebase Functions: ${message}`,
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

// Workflow management
app.get('/api/workflows', async (req, res) => {
  try {
    const db = admin.firestore();
    const workflowsSnapshot = await db.collection('workflows').get();
    
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

// Export the Express app as a Firebase Function
exports.flashfusionApi = functions.https.onRequest(app);