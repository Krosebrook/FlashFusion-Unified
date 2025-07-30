/**
 * Platform Webhook Router
 * Intelligent routing system for all platform webhooks
 */

const express = require('express');
const crypto = require('crypto');
const { PlatformIntegrationService } = require('../../src/services/platformIntegrationService');
const logger = require('../../src/utils/logger');

const router = express.Router();
const platformService = new PlatformIntegrationService();

// Middleware for webhook signature verification
const verifyWebhookSignature = (req, res, next) => {
    const signature = req.headers['x-hub-signature-256'] || req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);
    const secret = process.env.WEBHOOK_SECRET;

    if (!signature || !secret) {
        return next(); // Skip verification if no signature/secret
    }

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    if (signature !== `sha256=${expectedSignature}`) {
        logger.warn('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
};

// Main webhook receiver - handles all platform webhooks
router.post('/webhook/:platform?', verifyWebhookSignature, async (req, res) => {
    const platform = req.params.platform || detectPlatform(req);
    const payload = req.body;
    const headers = req.headers;

    logger.info(`Received webhook from ${platform}:`, {
        event: payload.event || payload.type || 'unknown',
        timestamp: new Date().toISOString()
    });

    try {
        // Route to appropriate handler based on platform
        const result = await routeWebhook(platform, payload, headers);
        
        if (result.success) {
            res.status(200).json({ 
                status: 'success', 
                message: 'Webhook processed successfully',
                processed_events: result.events || 1
            });
        } else {
            res.status(400).json({ 
                status: 'error', 
                message: result.error || 'Failed to process webhook'
            });
        }
    } catch (error) {
        logger.error(`Webhook processing error for ${platform}:`, error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error' 
        });
    }
});

// Platform-specific webhook handlers
router.post('/chatgpt', verifyWebhookSignature, async (req, res) => {
    await handleChatGPTWebhook(req, res);
});

router.post('/claude', verifyWebhookSignature, async (req, res) => {
    await handleClaudeWebhook(req, res);
});

router.post('/cursor', verifyWebhookSignature, async (req, res) => {
    await handleCursorWebhook(req, res);
});

router.post('/notion', verifyWebhookSignature, async (req, res) => {
    await handleNotionWebhook(req, res);
});

router.post('/github', verifyWebhookSignature, async (req, res) => {
    await handleGitHubWebhook(req, res);
});

router.post('/zapier', verifyWebhookSignature, async (req, res) => {
    await handleZapierWebhook(req, res);
});

router.post('/vercel', verifyWebhookSignature, async (req, res) => {
    await handleVercelWebhook(req, res);
});

router.post('/docker', verifyWebhookSignature, async (req, res) => {
    await handleDockerWebhook(req, res);
});

router.post('/zendesk', verifyWebhookSignature, async (req, res) => {
    await handleZendeskWebhook(req, res);
});

router.post('/firebase', verifyWebhookSignature, async (req, res) => {
    await handleFirebaseWebhook(req, res);
});

router.post('/supabase', verifyWebhookSignature, async (req, res) => {
    await handleSupabaseWebhook(req, res);
});

router.post('/replit', verifyWebhookSignature, async (req, res) => {
    await handleReplitWebhook(req, res);
});

router.post('/loveable', verifyWebhookSignature, async (req, res) => {
    await handleLoveableWebhook(req, res);
});

router.post('/base44', verifyWebhookSignature, async (req, res) => {
    await handleBase44Webhook(req, res);
});

// Utility functions
function detectPlatform(req) {
    const userAgent = req.headers['user-agent'] || '';
    const contentType = req.headers['content-type'] || '';
    
    // Platform detection based on headers and payload structure
    if (userAgent.includes('GitHub-Hookshot')) return 'github';
    if (userAgent.includes('Zapier')) return 'zapier';
    if (req.headers['x-vercel-signature']) return 'vercel';
    if (req.headers['x-notion-signature']) return 'notion';
    if (req.headers['x-zendesk-webhook-signature']) return 'zendesk';
    if (req.headers['x-firebase-event-type']) return 'firebase';
    if (req.headers['x-supabase-signature']) return 'supabase';
    if (req.body && req.body.source === 'replit') return 'replit';
    if (req.body && req.body.platform === 'loveable') return 'loveable';
    if (req.body && req.body.origin === 'base44') return 'base44';
    
    return 'unknown';
}

async function routeWebhook(platform, payload, headers) {
    try {
        switch (platform) {
            case 'chatgpt':
                return await processChatGPTEvent(payload);
            case 'claude':
                return await processClaudeEvent(payload);
            case 'cursor':
                return await processCursorEvent(payload);
            case 'notion':
                return await processNotionEvent(payload);
            case 'github':
                return await processGitHubEvent(payload);
            case 'zapier':
                return await processZapierEvent(payload);
            case 'vercel':
                return await processVercelEvent(payload);
            case 'docker':
                return await processDockerEvent(payload);
            case 'zendesk':
                return await processZendeskEvent(payload);
            case 'firebase':
                return await processFirebaseEvent(payload);
            case 'supabase':
                return await processSupabaseEvent(payload);
            case 'replit':
                return await processReplitEvent(payload);
            case 'loveable':
                return await processLoveableEvent(payload);
            case 'base44':
                return await processBase44Event(payload);
            default:
                return await processGenericEvent(platform, payload);
        }
    } catch (error) {
        logger.error(`Error routing webhook for ${platform}:`, error);
        return { success: false, error: error.message };
    }
}

// Platform-specific event processors
async function processChatGPTEvent(payload) {
    const eventData = {
        conversation_id: payload.conversation_id,
        message: payload.message,
        user_id: payload.user_id,
        timestamp: payload.timestamp || new Date().toISOString(),
        model: payload.model || 'gpt-4'
    };

    await platformService.handleChatGPTInteraction(eventData);
    
    // Trigger cross-platform events
    await platformService.queueEvent('ai_conversation_event', {
        platform: 'chatgpt',
        ...eventData
    }, ['notion', 'firebase', 'zapier']);

    return { success: true, events: 1 };
}

async function processClaudeEvent(payload) {
    const eventData = {
        conversation_id: payload.conversation_id,
        message: payload.message,
        user_id: payload.user_id,
        timestamp: payload.timestamp || new Date().toISOString(),
        model: payload.model || 'claude-3'
    };

    await platformService.handleClaudeInteraction(eventData);
    
    // Trigger cross-platform events
    await platformService.queueEvent('ai_conversation_event', {
        platform: 'claude',
        ...eventData
    }, ['notion', 'firebase', 'zapier']);

    return { success: true, events: 1 };
}

async function processCursorEvent(payload) {
    const eventData = {
        file_path: payload.file_path,
        changes: payload.changes,
        user_id: payload.user_id,
        project_id: payload.project_id,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    await platformService.handleCursorInteraction(eventData);
    
    // Trigger development workflow events
    await platformService.queueEvent('code_development_event', {
        platform: 'cursor',
        ...eventData
    }, ['github', 'notion', 'zapier']);

    return { success: true, events: 1 };
}

async function processNotionEvent(payload) {
    const eventData = {
        page_id: payload.page_id,
        database_id: payload.database_id,
        action: payload.action,
        properties: payload.properties,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    await platformService.handleNotionInteraction(eventData);
    
    // Trigger productivity workflow events
    await platformService.queueEvent('productivity_event', {
        platform: 'notion',
        ...eventData
    }, ['zapier', 'firebase', 'github']);

    return { success: true, events: 1 };
}

async function processGitHubEvent(payload) {
    const eventData = {
        repository: payload.repository?.name,
        action: payload.action,
        commits: payload.commits,
        pull_request: payload.pull_request,
        issue: payload.issue,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    await platformService.handleGitHubInteraction(eventData);
    
    // Trigger development workflow events
    await platformService.queueEvent('repository_event', {
        platform: 'github',
        ...eventData
    }, ['notion', 'zapier', 'vercel']);

    return { success: true, events: 1 };
}

async function processZapierEvent(payload) {
    // Zapier events are usually triggers for other automations
    const eventData = {
        zap_id: payload.zap_id,
        trigger_data: payload.trigger_data,
        action: payload.action,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    // Distribute to relevant platforms based on the trigger
    const targetPlatforms = determineTargetPlatforms(payload.trigger_data);
    
    await platformService.queueEvent('automation_trigger', {
        platform: 'zapier',
        ...eventData
    }, targetPlatforms);

    return { success: true, events: 1 };
}

async function processVercelEvent(payload) {
    const eventData = {
        deployment_id: payload.deploymentId,
        project_id: payload.projectId,
        state: payload.state,
        url: payload.url,
        timestamp: payload.createdAt || new Date().toISOString()
    };

    // Trigger deployment workflow events
    await platformService.queueEvent('deployment_event', {
        platform: 'vercel',
        ...eventData
    }, ['github', 'notion', 'zapier']);

    return { success: true, events: 1 };
}

async function processDockerEvent(payload) {
    const eventData = {
        repository: payload.repository,
        tag: payload.tag,
        action: payload.action,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    // Trigger container workflow events
    await platformService.queueEvent('container_event', {
        platform: 'docker',
        ...eventData
    }, ['github', 'notion', 'zapier']);

    return { success: true, events: 1 };
}

async function processZendeskEvent(payload) {
    const eventData = {
        ticket_id: payload.ticket?.id,
        user_id: payload.ticket?.requester_id,
        status: payload.ticket?.status,
        priority: payload.ticket?.priority,
        subject: payload.ticket?.subject,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    // Trigger support workflow events
    await platformService.queueEvent('support_event', {
        platform: 'zendesk',
        ...eventData
    }, ['zapier', 'notion', 'firebase']);

    return { success: true, events: 1 };
}

async function processFirebaseEvent(payload) {
    const eventData = {
        project_id: payload.project_id,
        event_type: payload.event_type,
        resource: payload.resource,
        data: payload.data,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    // Trigger backend workflow events
    await platformService.queueEvent('backend_event', {
        platform: 'firebase',
        ...eventData
    }, ['notion', 'zapier', 'supabase']);

    return { success: true, events: 1 };
}

async function processSupabaseEvent(payload) {
    const eventData = {
        table: payload.table,
        record: payload.record,
        type: payload.type,
        schema: payload.schema,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    // Trigger database workflow events
    await platformService.queueEvent('database_event', {
        platform: 'supabase',
        ...eventData
    }, ['notion', 'zapier', 'firebase']);

    return { success: true, events: 1 };
}

async function processReplitEvent(payload) {
    const eventData = {
        repl_id: payload.repl_id,
        action: payload.action,
        user_id: payload.user_id,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    // Trigger development workflow events
    await platformService.queueEvent('repl_event', {
        platform: 'replit',
        ...eventData
    }, ['github', 'notion', 'zapier']);

    return { success: true, events: 1 };
}

async function processLoveableEvent(payload) {
    const eventData = {
        project_id: payload.project_id,
        action: payload.action,
        changes: payload.changes,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    // Trigger AI development workflow events
    await platformService.queueEvent('ai_development_event', {
        platform: 'loveable',
        ...eventData
    }, ['github', 'notion', 'zapier']);

    return { success: true, events: 1 };
}

async function processBase44Event(payload) {
    const eventData = {
        app_id: payload.app_id,
        action: payload.action,
        data: payload.data,
        timestamp: payload.timestamp || new Date().toISOString()
    };

    // Trigger platform workflow events
    await platformService.queueEvent('platform_event', {
        platform: 'base44',
        ...eventData
    }, ['notion', 'zapier', 'firebase']);

    return { success: true, events: 1 };
}

async function processGenericEvent(platform, payload) {
    const eventData = {
        platform,
        payload,
        timestamp: new Date().toISOString()
    };

    // Generic event processing
    await platformService.queueEvent('generic_event', eventData, ['notion', 'zapier']);

    return { success: true, events: 1 };
}

function determineTargetPlatforms(triggerData) {
    const platforms = [];
    
    // Analyze trigger data to determine which platforms should receive the event
    if (triggerData.source === 'github') platforms.push('notion', 'vercel');
    if (triggerData.source === 'notion') platforms.push('github', 'firebase');
    if (triggerData.type === 'ai_conversation') platforms.push('notion', 'firebase');
    if (triggerData.type === 'deployment') platforms.push('github', 'notion');
    
    return platforms.length > 0 ? platforms : ['notion']; // Default to Notion
}

// Webhook status and testing endpoints
router.get('/status', (req, res) => {
    const status = platformService.getPlatformStatus();
    res.json({
        status: 'active',
        platforms: status,
        timestamp: new Date().toISOString()
    });
});

router.get('/platforms', (req, res) => {
    const platforms = platformService.getEnabledPlatforms();
    res.json({
        enabled_platforms: platforms,
        total_platforms: platformService.platforms.size,
        timestamp: new Date().toISOString()
    });
});

router.post('/test/:platform', async (req, res) => {
    const platform = req.params.platform;
    const result = await platformService.testPlatformConnection(platform);
    
    res.json({
        platform,
        ...result,
        timestamp: new Date().toISOString()
    });
});

// Individual webhook handlers (for backward compatibility)
async function handleChatGPTWebhook(req, res) {
    try {
        const result = await processChatGPTEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleClaudeWebhook(req, res) {
    try {
        const result = await processClaudeEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleCursorWebhook(req, res) {
    try {
        const result = await processCursorEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleNotionWebhook(req, res) {
    try {
        const result = await processNotionEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleGitHubWebhook(req, res) {
    try {
        const result = await processGitHubEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleZapierWebhook(req, res) {
    try {
        const result = await processZapierEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleVercelWebhook(req, res) {
    try {
        const result = await processVercelEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleDockerWebhook(req, res) {
    try {
        const result = await processDockerEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleZendeskWebhook(req, res) {
    try {
        const result = await processZendeskEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleFirebaseWebhook(req, res) {
    try {
        const result = await processFirebaseEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleSupabaseWebhook(req, res) {
    try {
        const result = await processSupabaseEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleReplitWebhook(req, res) {
    try {
        const result = await processReplitEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleLoveableWebhook(req, res) {
    try {
        const result = await processLoveableEvent(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function handleBase44Webhook(req, res) {
    try {
        const result = await processBase44Event(req.body);
        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = router;