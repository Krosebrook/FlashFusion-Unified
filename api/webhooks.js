/**
 * FlashFusion Webhook Router
 * Central webhook handler that routes requests to specific webhook handlers
 */

const crypto = require('crypto');

// Import webhook handlers
const zapierHandler = require('./webhooks/zapier');
const stripeHandler = require('./webhooks/stripe');
const shopifyHandler = require('./webhooks/shopify');
const githubHandler = require('./webhooks/github');
const slackHandler = require('./webhooks/slack');
const discordHandler = require('./webhooks/discord');
const openaiHandler = require('./webhooks/openai');
const webhookManager = require('./webhooks/webhook-manager');

module.exports = async (req, res) => {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Zapier-Source, X-GitHub-Event, X-Shopify-Topic, X-Slack-Signature');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        const url = req.url || '/';
        const method = req.method;
        
        console.log('Webhook request:', {
            url,
            method,
            headers: Object.keys(req.headers),
            timestamp: new Date().toISOString()
        });

        // Route to webhook manager for management endpoints
        if (url === '/' || url.startsWith('/manage') || url.startsWith('/stats') || url.startsWith('/register')) {
            return webhookManager(req, res);\r
        }

        // Route to specific webhook handlers
        if (url.startsWith('/zapier')) {
            const zapierReq = { ...req, url: url.replace('/zapier', '') || '/' };
            return zapierHandler(zapierReq, res);
        }

        if (url.startsWith('/stripe')) {
            const stripeReq = { ...req, url: url.replace('/stripe', '') || '/' };
            return stripeHandler(stripeReq, res);
        }

        if (url.startsWith('/shopify')) {
            const shopifyReq = { ...req, url: url.replace('/shopify', '') || '/' };
            return shopifyHandler(shopifyReq, res);
        }

        if (url.startsWith('/github')) {
            const githubReq = { ...req, url: url.replace('/github', '') || '/' };
            return githubHandler(githubReq, res);
        }

        if (url.startsWith('/slack')) {
            const slackReq = { ...req, url: url.replace('/slack', '') || '/' };
            return slackHandler(slackReq, res);
        }

        if (url.startsWith('/discord')) {
            const discordReq = { ...req, url: url.replace('/discord', '') || '/' };
            return discordHandler(discordReq, res);
        }

        if (url.startsWith('/openai')) {
            const openaiReq = { ...req, url: url.replace('/openai', '') || '/' };
            return openaiHandler(openaiReq, res);
        }

        // Generic webhook endpoint for testing
        if (url === '/incoming' || url === '/test') {
            return handleGenericWebhook(req, res);
        }

        // Health check
        if (url === '/health') {
            return res.status(200).json({
                status: 'healthy',
                webhooks: ['zapier', 'stripe', 'shopify', 'github', 'slack', 'discord', 'openai'],
                timestamp: new Date().toISOString()
            });
        }

        // Default webhook list
        return res.status(200).json({
            message: 'FlashFusion Webhook Hub',
            available_webhooks: [
                '/zapier - Zapier automation webhooks',
                '/stripe - Stripe payment webhooks', 
                '/shopify - Shopify e-commerce webhooks',
                '/github - GitHub repository webhooks',
                '/slack - Slack workspace webhooks',
                '/discord - Discord bot webhooks',
                '/openai - OpenAI API webhooks',
                '/incoming - Generic incoming webhook',
                '/test - Test webhook endpoint'
            ],
            management: [
                '/ - Webhook dashboard',
                '/manage - Webhook management',
                '/stats - Webhook statistics',
                '/health - Health check'
            ],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Webhook router error:', error);
        return res.status(500).json({
            error: 'Webhook processing failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Generic webhook handler for testing
async function handleGenericWebhook(req, res) {
    try {
        const data = req.body || {};
        const headers = req.headers;
        
        console.log('Generic webhook received:', {
            method: req.method,
            data,
            headers: Object.keys(headers),
            timestamp: new Date().toISOString()
        });

        // Log webhook data for debugging
        logWebhookEvent('generic', {
            method: req.method,
            data,
            source: headers['user-agent'] || 'unknown',
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: 'Webhook received successfully',
            received_data: data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Generic webhook error:', error);
        return res.status(400).json({
            error: 'Webhook processing failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

// Webhook event logging
function logWebhookEvent(type, data) {
    try {
        const logEntry = {
            type,
            data,
            timestamp: new Date().toISOString()
        };
        
        // In production, this would write to a database or log service
        console.log('Webhook event logged:', JSON.stringify(logEntry, null, 2));
        
    } catch (error) {
        console.error('Failed to log webhook event:', error);
    }
}

// Webhook signature verification
function verifyWebhookSignature(payload, signature, secret) {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
            
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
}