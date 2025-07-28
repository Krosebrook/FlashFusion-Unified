#!/usr/bin/env node

/**
 * Zapier Automation Manager
 * Manages all Zapier integrations and webhooks for the FlashFusion ecosystem
 */

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

class ZapierAutomationManager {
  constructor() {
    this.app = express();
    this.webhooks = new Map();
    this.automations = new Map();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.loadAutomations();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Security middleware
    this.app.use((req, res, next) => {
      // Verify webhook signatures
      const signature = req.headers['x-zapier-signature'];
      if (signature && !this.verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
      next();
    });
  }

  setupRoutes() {
    // Main webhook endpoint for Zapier
    this.app.post('/api/zapier/incoming-webhook', (req, res) => {
      this.handleIncomingWebhook(req, res);
    });

    // GitHub webhook endpoint
    this.app.post('/api/zapier/github-webhook', (req, res) => {
      this.handleGitHubWebhook(req, res);
    });

    // Notion webhook endpoint
    this.app.post('/api/zapier/notion-webhook', (req, res) => {
      this.handleNotionWebhook(req, res);
    });

    // Automation management endpoints
    this.app.get('/api/zapier/automations', (req, res) => {
      this.listAutomations(req, res);
    });

    this.app.post('/api/zapier/automations/:id/trigger', (req, res) => {
      this.triggerAutomation(req, res);
    });

    // Health check
    this.app.get('/api/zapier/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        automations: this.automations.size,
        webhooks: this.webhooks.size
      });
    });
  }

  loadAutomations() {
    // Define core automations
    this.automations.set('github-commit-sync', {
      id: 'github-commit-sync',
      name: 'GitHub Commit → Notion Sync',
      description: 'Sync Git commits to Notion project updates',
      zapierWebhookUrl: process.env.ZAPIER_GITHUB_WEBHOOK_URL,
      enabled: true,
      triggers: ['git-commit', 'git-push'],
      actions: ['notion-create-page', 'slack-notification']
    });

    this.automations.set('project-checkpoint', {
      id: 'project-checkpoint',
      name: 'Automated Project Checkpoint',
      description: 'Create regular project checkpoints',
      zapierWebhookUrl: process.env.ZAPIER_CHECKPOINT_WEBHOOK_URL,
      enabled: true,
      triggers: ['scheduled', 'manual'],
      actions: ['notion-create-checkpoint', 'github-commit', 'email-report']
    });

    this.automations.set('agent-status-update', {
      id: 'agent-status-update',
      name: 'AI Agent Status Updates',
      description: 'Track and report AI agent performance',
      zapierWebhookUrl: process.env.ZAPIER_AGENT_WEBHOOK_URL,
      enabled: true,
      triggers: ['agent-action-completed', 'agent-error'],
      actions: ['notion-update-status', 'dashboard-update']
    });

    this.automations.set('deployment-notification', {
      id: 'deployment-notification',
      name: 'Deployment Notifications',
      description: 'Notify team of deployments and updates',
      zapierWebhookUrl: process.env.ZAPIER_DEPLOY_WEBHOOK_URL,
      enabled: true,
      triggers: ['vercel-deploy', 'firebase-deploy'],
      actions: ['slack-notify', 'email-team', 'notion-log']
    });

    console.log(`✅ Loaded ${this.automations.size} automations`);
  }

  async handleIncomingWebhook(req, res) {
    try {
      const { event, data, source } = req.body;
      
      console.log(`📥 Webhook received: ${event} from ${source}`);
      
      // Process based on event type
      switch (event) {
        case 'github_commit':
          await this.processGitHubCommit(data);
          break;
        case 'notion_update':
          await this.processNotionUpdate(data);
          break;
        case 'agent_action_completed':
          await this.processAgentAction(data);
          break;
        case 'checkpoint_requested':
          await this.processCheckpointRequest(data);
          break;
        default:
          console.log(`⚠️ Unknown event type: ${event}`);
      }

      // Send to relevant Zapier automations
      await this.routeToZapier(event, data, source);
      
      res.json({ 
        success: true, 
        processed: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Webhook processing failed:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async processGitHubCommit(data) {
    console.log('🔄 Processing GitHub commit...');
    
    // Create structured data for Zapier
    const zapierPayload = {
      event: 'github_commit_processed',
      timestamp: new Date().toISOString(),
      data: {
        repository: data.repository,
        commit_sha: data.commit_sha,
        branch: data.branch,
        message: data.message,
        changes: data.changes,
        author: data.author || 'GitHub Action',
        url: `https://github.com/${data.repository}/commit/${data.commit_sha}`
      },
      actions: [
        {
          type: 'notion_update',
          target: 'project_database',
          data: {
            title: `Git: ${data.message}`,
            type: 'Git Commit',
            status: 'Completed',
            commit_hash: data.commit_sha
          }
        },
        {
          type: 'slack_notification',
          target: 'dev_channel',
          message: `🚀 New commit pushed to ${data.branch}: ${data.message}`
        }
      ]
    };

    // Send to Zapier GitHub automation
    await this.sendToZapier('github-commit-sync', zapierPayload);
  }

  async processAgentAction(data) {
    console.log('🤖 Processing agent action...');
    
    const zapierPayload = {
      event: 'agent_action_processed',
      timestamp: new Date().toISOString(),
      data: {
        agent_id: data.agentId,
        agent_name: data.agentName,
        action: data.action,
        result: data.result,
        metadata: data.metadata
      },
      actions: [
        {
          type: 'notion_update',
          target: 'agents_database',
          data: {
            agent_name: data.agentName,
            last_action: data.action,
            status: 'Active',
            last_updated: new Date().toISOString()
          }
        }
      ]
    };

    await this.sendToZapier('agent-status-update', zapierPayload);
  }

  async processCheckpointRequest(data) {
    console.log('💾 Processing checkpoint request...');
    
    // Gather checkpoint data
    const checkpointData = {
      timestamp: new Date().toISOString(),
      type: data.type || 'manual',
      trigger: data.trigger || 'api',
      project_status: {
        backend: 95,
        frontend: 15,
        mobile: 0,
        overall: 90
      },
      recent_changes: await this.getRecentChanges(),
      system_health: await this.getSystemHealth(),
      metrics: await this.getCurrentMetrics()
    };

    const zapierPayload = {
      event: 'checkpoint_created',
      timestamp: new Date().toISOString(),
      data: checkpointData,
      actions: [
        {
          type: 'notion_create_page',
          target: 'knowledge_database',
          data: {
            title: `Checkpoint: ${checkpointData.timestamp}`,
            category: 'Checkpoint',
            content: JSON.stringify(checkpointData, null, 2)
          }
        },
        {
          type: 'github_commit',
          message: `📋 Checkpoint: ${new Date().toLocaleDateString()}`
        }
      ]
    };

    await this.sendToZapier('project-checkpoint', zapierPayload);
  }

  async routeToZapier(event, data, source) {
    // Route events to appropriate Zapier automations
    const relevantAutomations = Array.from(this.automations.values())
      .filter(automation => 
        automation.enabled && 
        automation.triggers.some(trigger => event.includes(trigger))
      );

    for (const automation of relevantAutomations) {
      try {
        await this.sendToZapier(automation.id, { event, data, source });
        console.log(`✅ Sent to ${automation.name}`);
      } catch (error) {
        console.error(`❌ Failed to send to ${automation.name}:`, error.message);
      }
    }
  }

  async sendToZapier(automationId, payload) {
    const automation = this.automations.get(automationId);
    if (!automation || !automation.zapierWebhookUrl) {
      console.log(`⚠️ No webhook URL for automation: ${automationId}`);
      return;
    }

    try {
      const response = await axios.post(automation.zapierWebhookUrl, {
        ...payload,
        automation_id: automationId,
        automation_name: automation.name
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FlashFusion-AutoSync/1.0'
        }
      });

      console.log(`📤 Sent to Zapier ${automationId}: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Zapier send failed for ${automationId}:`, error.message);
      throw error;
    }
  }

  async triggerManualCheckpoint() {
    console.log('🎯 Triggering manual checkpoint...');
    
    await this.processCheckpointRequest({
      type: 'manual',
      trigger: 'user_request',
      timestamp: new Date().toISOString()
    });
  }

  async getRecentChanges() {
    // Mock implementation - replace with actual git log parsing
    return [
      'Updated README with Inner Odyssey Kids project',
      'Added automated GitHub Actions workflow',
      'Created Notion sync automation system'
    ];
  }

  async getSystemHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      automations_active: Array.from(this.automations.values())
        .filter(a => a.enabled).length
    };
  }

  async getCurrentMetrics() {
    return {
      api_response_time: 1.8,
      backend_completion: 95,
      frontend_completion: 15,
      active_agents: 6,
      cost_per_request: 0.001
    };
  }

  verifySignature(payload, signature) {
    // Implement webhook signature verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ZAPIER_WEBHOOK_SECRET || 'default-secret')
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === `sha256=${expectedSignature}`;
  }

  listAutomations(req, res) {
    const automationsList = Array.from(this.automations.values()).map(automation => ({
      id: automation.id,
      name: automation.name,
      description: automation.description,
      enabled: automation.enabled,
      triggers: automation.triggers,
      actions: automation.actions
    }));

    res.json({
      automations: automationsList,
      total: automationsList.length,
      enabled: automationsList.filter(a => a.enabled).length
    });
  }

  triggerAutomation(req, res) {
    const { id } = req.params;
    const automation = this.automations.get(id);
    
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    // Trigger the automation with custom data
    this.sendToZapier(id, {
      event: 'manual_trigger',
      timestamp: new Date().toISOString(),
      data: req.body,
      source: 'manual'
    });

    res.json({
      success: true,
      automation: automation.name,
      triggered_at: new Date().toISOString()
    });
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`🚀 Zapier Automation Manager running on port ${port}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   POST /api/zapier/incoming-webhook`);
      console.log(`   GET  /api/zapier/automations`);
      console.log(`   POST /api/zapier/automations/:id/trigger`);
      console.log(`   GET  /api/zapier/health`);
      
      // Trigger initial checkpoint
      setTimeout(() => {
        this.triggerManualCheckpoint();
      }, 5000);
    });
  }
}

// Start the automation manager
if (require.main === module) {
  const manager = new ZapierAutomationManager();
  manager.start(process.env.PORT || 3001);
}

module.exports = ZapierAutomationManager;