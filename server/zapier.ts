import type { Request, Response } from 'express';

interface ZapierWebhook {
  url: string;
  event: string;
  active: boolean;
  createdAt: Date;
}

interface ZapierTriggerData {
  event: string;
  data: any;
  timestamp: string;
  userId?: number;
}

class ZapierService {
  private webhooks: Map<string, ZapierWebhook[]> = new Map();

  // Register a webhook for Zapier integration
  registerWebhook(userId: string, webhook: Omit<ZapierWebhook, 'createdAt'>) {
    if (!this.webhooks.has(userId)) {
      this.webhooks.set(userId, []);
    }
    
    const userWebhooks = this.webhooks.get(userId)!;
    const newWebhook: ZapierWebhook = {
      ...webhook,
      createdAt: new Date()
    };
    
    userWebhooks.push(newWebhook);
    return newWebhook;
  }

  // Send data to Zapier webhooks
  async triggerWebhooks(userId: string, event: string, data: any) {
    const userWebhooks = this.webhooks.get(userId) || [];
    const activeWebhooks = userWebhooks.filter(w => w.active && w.event === event);

    const triggerData: ZapierTriggerData = {
      event,
      data,
      timestamp: new Date().toISOString(),
      userId: parseInt(userId)
    };

    const promises = activeWebhooks.map(async (webhook) => {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'FlashFusion/1.0'
          },
          body: JSON.stringify(triggerData)
        });
        
        console.log(`Zapier webhook triggered: ${webhook.url} - Status: ${response.status}`);
        return { webhook: webhook.url, success: true, status: response.status };
      } catch (error) {
        console.error(`Failed to trigger Zapier webhook ${webhook.url}:`, error);
        return { webhook: webhook.url, success: false, error: String(error) };
      }
    });

    return Promise.all(promises);
  }

  // Get webhooks for a user
  getUserWebhooks(userId: string): ZapierWebhook[] {
    return this.webhooks.get(userId) || [];
  }

  // Remove a webhook
  removeWebhook(userId: string, webhookUrl: string): boolean {
    const userWebhooks = this.webhooks.get(userId);
    if (!userWebhooks) return false;

    const index = userWebhooks.findIndex(w => w.url === webhookUrl);
    if (index === -1) return false;

    userWebhooks.splice(index, 1);
    return true;
  }

  // Predefined trigger events for FlashFusion
  static EVENTS = {
    IDEA_CREATED: 'idea.created',
    IDEA_UPDATED: 'idea.updated',
    AGENT_TASK_COMPLETED: 'agent.task.completed',
    BRAND_KIT_GENERATED: 'brandkit.generated',
    CONTENT_KIT_GENERATED: 'contentkit.generated',
    SEO_SITE_GENERATED: 'seosite.generated',
    PRODUCT_MOCKUP_GENERATED: 'mockup.generated'
  } as const;
}

export const zapierService = new ZapierService();

// Zapier webhook management routes
export function setupZapierRoutes(app: any) {
  // Register a new webhook
  app.post('/api/zapier/webhooks', (req: Request, res: Response) => {
    try {
      const { url, event } = req.body;
      const userId = (req as any).session?.user?.id || 'anonymous';
      
      if (!url || !event) {
        return res.status(400).json({ error: 'URL and event are required' });
      }

      if (!Object.values(ZapierService.EVENTS).includes(event)) {
        return res.status(400).json({ 
          error: 'Invalid event type',
          validEvents: Object.values(ZapierService.EVENTS)
        });
      }

      const webhook = zapierService.registerWebhook(userId.toString(), {
        url,
        event,
        active: true
      });

      res.json({ success: true, webhook });
    } catch (error) {
      console.error('Error registering Zapier webhook:', error);
      res.status(500).json({ error: 'Failed to register webhook' });
    }
  });

  // Get user's webhooks
  app.get('/api/zapier/webhooks', (req: Request, res: Response) => {
    try {
      const userId = (req as any).session?.user?.id || 'anonymous';
      const webhooks = zapierService.getUserWebhooks(userId.toString());
      res.json({ webhooks });
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
  });

  // Remove a webhook
  app.delete('/api/zapier/webhooks', (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      const userId = (req as any).session?.user?.id || 'anonymous';
      
      if (!url) {
        return res.status(400).json({ error: 'Webhook URL is required' });
      }

      const removed = zapierService.removeWebhook(userId.toString(), url);
      
      if (removed) {
        res.json({ success: true, message: 'Webhook removed' });
      } else {
        res.status(404).json({ error: 'Webhook not found' });
      }
    } catch (error) {
      console.error('Error removing webhook:', error);
      res.status(500).json({ error: 'Failed to remove webhook' });
    }
  });

  // Get available events
  app.get('/api/zapier/events', (req: Request, res: Response) => {
    res.json({ 
      events: Object.values(ZapierService.EVENTS),
      descriptions: {
        [ZapierService.EVENTS.IDEA_CREATED]: 'Triggered when a new business idea is created',
        [ZapierService.EVENTS.IDEA_UPDATED]: 'Triggered when a business idea is updated',
        [ZapierService.EVENTS.AGENT_TASK_COMPLETED]: 'Triggered when any AI agent completes a task',
        [ZapierService.EVENTS.BRAND_KIT_GENERATED]: 'Triggered when a brand kit is generated',
        [ZapierService.EVENTS.CONTENT_KIT_GENERATED]: 'Triggered when a content kit is generated',
        [ZapierService.EVENTS.SEO_SITE_GENERATED]: 'Triggered when an SEO site is generated',
        [ZapierService.EVENTS.PRODUCT_MOCKUP_GENERATED]: 'Triggered when a product mockup is generated'
      }
    });
  });

  // Test webhook endpoint
  app.post('/api/zapier/test', async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'Webhook URL is required' });
      }

      const testData = {
        event: 'test',
        data: {
          message: 'Test webhook from FlashFusion',
          timestamp: new Date().toISOString(),
          app: 'FlashFusion'
        },
        timestamp: new Date().toISOString()
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FlashFusion/1.0'
        },
        body: JSON.stringify(testData)
      });

      res.json({ 
        success: true, 
        status: response.status,
        message: 'Test webhook sent successfully'
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      res.status(500).json({ 
        error: 'Failed to send test webhook',
        details: String(error)
      });
    }
  });
}

export { ZapierService };