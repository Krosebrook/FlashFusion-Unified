/**
 * Platform Integration Service
 * Unified service for connecting and managing all platform integrations
 */

const axios = require('axios');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const logger = require('../utils/logger');

class PlatformIntegrationService extends EventEmitter {
    constructor() {
        super();
        this.platforms = new Map();
        this.webhookSecret = process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');
        this.eventQueue = [];
        this.isProcessing = false;
        
        this.initializePlatforms();
        this.startEventProcessor();
    }

    initializePlatforms() {
        // AI Platforms
        this.platforms.set('chatgpt', {
            name: 'ChatGPT',
            type: 'ai',
            endpoints: {
                api: 'https://api.openai.com/v1',
                webhook: process.env.CHATGPT_WEBHOOK_URL
            },
            auth: {
                type: 'bearer',
                token: process.env.OPENAI_API_KEY
            },
            enabled: !!process.env.OPENAI_API_KEY
        });

        this.platforms.set('claude', {
            name: 'Claude AI',
            type: 'ai',
            endpoints: {
                api: 'https://api.anthropic.com/v1',
                webhook: process.env.CLAUDE_WEBHOOK_URL
            },
            auth: {
                type: 'bearer',
                token: process.env.ANTHROPIC_API_KEY
            },
            enabled: !!process.env.ANTHROPIC_API_KEY
        });

        this.platforms.set('cursor', {
            name: 'Cursor IDE',
            type: 'development',
            endpoints: {
                api: 'https://cursor.sh/api/v1',
                webhook: process.env.CURSOR_WEBHOOK_URL
            },
            auth: {
                type: 'api_key',
                key: process.env.CURSOR_API_KEY
            },
            enabled: !!process.env.CURSOR_API_KEY
        });

        // Productivity Platforms
        this.platforms.set('notion', {
            name: 'Notion',
            type: 'productivity',
            endpoints: {
                api: 'https://api.notion.com/v1',
                webhook: process.env.NOTION_WEBHOOK_URL
            },
            auth: {
                type: 'bearer',
                token: process.env.NOTION_TOKEN
            },
            enabled: !!process.env.NOTION_TOKEN
        });

        // Development Platforms
        this.platforms.set('github', {
            name: 'GitHub',
            type: 'development',
            endpoints: {
                api: 'https://api.github.com',
                webhook: process.env.GITHUB_WEBHOOK_URL
            },
            auth: {
                type: 'token',
                token: process.env.GITHUB_TOKEN
            },
            enabled: !!process.env.GITHUB_TOKEN
        });

        this.platforms.set('vercel', {
            name: 'Vercel',
            type: 'deployment',
            endpoints: {
                api: 'https://api.vercel.com',
                webhook: process.env.VERCEL_WEBHOOK_URL
            },
            auth: {
                type: 'bearer',
                token: process.env.VERCEL_TOKEN
            },
            enabled: !!process.env.VERCEL_TOKEN
        });

        this.platforms.set('docker', {
            name: 'Docker Hub',
            type: 'deployment',
            endpoints: {
                api: 'https://hub.docker.com/v2',
                webhook: process.env.DOCKER_WEBHOOK_URL
            },
            auth: {
                type: 'basic',
                username: process.env.DOCKER_USERNAME,
                password: process.env.DOCKER_PASSWORD
            },
            enabled: !!(process.env.DOCKER_USERNAME && process.env.DOCKER_PASSWORD)
        });

        // Automation Platforms
        this.platforms.set('zapier', {
            name: 'Zapier',
            type: 'automation',
            endpoints: {
                api: 'https://api.zapier.com/v1',
                webhook: process.env.ZAPIER_WEBHOOK_URL
            },
            auth: {
                type: 'api_key',
                key: process.env.ZAPIER_API_KEY
            },
            enabled: !!process.env.ZAPIER_API_KEY
        });

        // Customer Support
        this.platforms.set('zendesk', {
            name: 'Zendesk',
            type: 'support',
            endpoints: {
                api: `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`,
                webhook: process.env.ZENDESK_WEBHOOK_URL
            },
            auth: {
                type: 'basic',
                username: `${process.env.ZENDESK_EMAIL}/token`,
                password: process.env.ZENDESK_TOKEN
            },
            enabled: !!(process.env.ZENDESK_SUBDOMAIN && process.env.ZENDESK_TOKEN)
        });

        // Backend Services
        this.platforms.set('firebase', {
            name: 'Firebase',
            type: 'backend',
            endpoints: {
                api: 'https://firebase.googleapis.com/v1beta1',
                webhook: process.env.FIREBASE_WEBHOOK_URL
            },
            auth: {
                type: 'service_account',
                credentials: process.env.FIREBASE_SERVICE_ACCOUNT
            },
            enabled: !!process.env.FIREBASE_PROJECT_ID
        });

        this.platforms.set('supabase', {
            name: 'Supabase',
            type: 'backend',
            endpoints: {
                api: process.env.SUPABASE_URL,
                webhook: process.env.SUPABASE_WEBHOOK_URL
            },
            auth: {
                type: 'bearer',
                token: process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            enabled: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
        });

        // Development Platforms
        this.platforms.set('replit', {
            name: 'Replit',
            type: 'development',
            endpoints: {
                api: 'https://replit.com/api/v1',
                webhook: process.env.REPLIT_WEBHOOK_URL
            },
            auth: {
                type: 'bearer',
                token: process.env.REPLIT_API_TOKEN
            },
            enabled: !!process.env.REPLIT_API_TOKEN
        });

        // AI Development Platforms
        this.platforms.set('loveable', {
            name: 'Loveable.dev',
            type: 'ai_development',
            endpoints: {
                api: 'https://loveable.dev/api/v1',
                webhook: process.env.LOVEABLE_WEBHOOK_URL
            },
            auth: {
                type: 'api_key',
                key: process.env.LOVEABLE_API_KEY
            },
            enabled: !!process.env.LOVEABLE_API_KEY
        });

        this.platforms.set('base44', {
            name: 'Base44',
            type: 'platform',
            endpoints: {
                api: 'https://app.base44.com/api/v1',
                webhook: process.env.BASE44_WEBHOOK_URL
            },
            auth: {
                type: 'api_key',
                key: process.env.BASE44_API_KEY
            },
            enabled: !!process.env.BASE44_API_KEY
        });

        // Additional Services
        this.platforms.set('trilio', {
            name: 'Trilio',
            type: 'backup',
            endpoints: {
                api: process.env.TRILIO_API_URL,
                webhook: process.env.TRILIO_WEBHOOK_URL
            },
            auth: {
                type: 'api_key',
                key: process.env.TRILIO_API_KEY
            },
            enabled: !!process.env.TRILIO_API_KEY
        });

        this.platforms.set('firebase_studio', {
            name: 'Firebase Studio',
            type: 'development',
            endpoints: {
                api: 'https://firebase.studio/api/v1',
                webhook: process.env.FIREBASE_STUDIO_WEBHOOK_URL
            },
            auth: {
                type: 'bearer',
                token: process.env.FIREBASE_STUDIO_TOKEN
            },
            enabled: !!process.env.FIREBASE_STUDIO_TOKEN
        });

        this.platforms.set('codeguide', {
            name: 'CodeGuide Dev',
            type: 'development',
            endpoints: {
                api: 'https://codeguide.dev/api/v1',
                webhook: process.env.CODEGUIDE_WEBHOOK_URL
            },
            auth: {
                type: 'api_key',
                key: process.env.CODEGUIDE_API_KEY
            },
            enabled: !!process.env.CODEGUIDE_API_KEY
        });

        logger.info(`Initialized ${this.platforms.size} platform integrations`);
        logger.info(`Enabled platforms: ${Array.from(this.platforms.entries())
            .filter(([, config]) => config.enabled)
            .map(([name]) => name)
            .join(', ')}`);
    }

    async sendEventToPlatform(platformName, event, data) {
        const platform = this.platforms.get(platformName);
        if (!platform || !platform.enabled) {
            logger.warn(`Platform ${platformName} not available or disabled`);
            return false;
        }

        try {
            const headers = this.buildAuthHeaders(platform);
            const payload = {
                event,
                data,
                timestamp: new Date().toISOString(),
                source: 'FlashFusion-Pipeline'
            };

            if (platform.endpoints.webhook) {
                // Send to webhook endpoint
                await axios.post(platform.endpoints.webhook, payload, { headers });
                logger.info(`Event sent to ${platform.name} webhook: ${event}`);
            } else if (platform.endpoints.api) {
                // Send to API endpoint
                await this.sendToApiEndpoint(platform, event, payload);
                logger.info(`Event sent to ${platform.name} API: ${event}`);
            }

            this.emit('platform_event_sent', { platform: platformName, event, success: true });
            return true;
        } catch (error) {
            logger.error(`Failed to send event to ${platform.name}:`, error.message);
            this.emit('platform_event_sent', { platform: platformName, event, success: false, error: error.message });
            return false;
        }
    }

    buildAuthHeaders(platform) {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'FlashFusion-Pipeline/1.0'
        };

        switch (platform.auth.type) {
            case 'bearer':
                headers['Authorization'] = `Bearer ${platform.auth.token}`;
                break;
            case 'api_key':
                headers['X-API-Key'] = platform.auth.key;
                break;
            case 'token':
                headers['Authorization'] = `token ${platform.auth.token}`;
                break;
            case 'basic':
                const credentials = Buffer.from(`${platform.auth.username}:${platform.auth.password}`).toString('base64');
                headers['Authorization'] = `Basic ${credentials}`;
                break;
        }

        return headers;
    }

    async sendToApiEndpoint(platform, event, payload) {
        const headers = this.buildAuthHeaders(platform);
        
        // Platform-specific API handling
        switch (platform.type) {
            case 'ai':
                return await this.handleAIPlatform(platform, event, payload, headers);
            case 'development':
                return await this.handleDevelopmentPlatform(platform, event, payload, headers);
            case 'productivity':
                return await this.handleProductivityPlatform(platform, event, payload, headers);
            case 'backend':
                return await this.handleBackendPlatform(platform, event, payload, headers);
            default:
                return await axios.post(`${platform.endpoints.api}/webhooks`, payload, { headers });
        }
    }

    async handleAIPlatform(platform, event, payload, headers) {
        // Handle AI platform specific events
        switch (event) {
            case 'conversation_started':
            case 'conversation_ended':
            case 'message_sent':
                return await axios.post(`${platform.endpoints.api}/conversations/events`, payload, { headers });
            default:
                return await axios.post(`${platform.endpoints.api}/events`, payload, { headers });
        }
    }

    async handleDevelopmentPlatform(platform, event, payload, headers) {
        // Handle development platform specific events
        switch (event) {
            case 'code_committed':
            case 'deployment_started':
            case 'deployment_completed':
                return await axios.post(`${platform.endpoints.api}/events`, payload, { headers });
            default:
                return await axios.post(`${platform.endpoints.api}/webhooks`, payload, { headers });
        }
    }

    async handleProductivityPlatform(platform, event, payload, headers) {
        // Handle productivity platform specific events
        if (platform.name === 'Notion') {
            switch (event) {
                case 'page_created':
                case 'page_updated':
                    return await axios.post(`${platform.endpoints.api}/pages`, payload.data, { headers });
                case 'database_updated':
                    return await axios.patch(`${platform.endpoints.api}/databases/${payload.data.database_id}`, payload.data, { headers });
                default:
                    return await axios.post(`${platform.endpoints.api}/webhooks`, payload, { headers });
            }
        }
        return await axios.post(`${platform.endpoints.api}/events`, payload, { headers });
    }

    async handleBackendPlatform(platform, event, payload, headers) {
        // Handle backend platform specific events
        switch (event) {
            case 'data_updated':
            case 'user_action':
            case 'system_event':
                return await axios.post(`${platform.endpoints.api}/events`, payload, { headers });
            default:
                return await axios.post(`${platform.endpoints.api}/webhooks`, payload, { headers });
        }
    }

    async broadcastEvent(event, data, excludePlatforms = []) {
        logger.info(`Broadcasting event: ${event} to all platforms`);
        
        const results = [];
        const enabledPlatforms = Array.from(this.platforms.entries())
            .filter(([name, config]) => config.enabled && !excludePlatforms.includes(name));

        for (const [platformName] of enabledPlatforms) {
            const result = await this.sendEventToPlatform(platformName, event, data);
            results.push({ platform: platformName, success: result });
        }

        const successCount = results.filter(r => r.success).length;
        logger.info(`Event broadcast complete: ${successCount}/${results.length} platforms notified`);
        
        return results;
    }

    queueEvent(event, data, targetPlatforms = null) {
        const eventData = {
            id: crypto.randomUUID(),
            event,
            data,
            targetPlatforms,
            timestamp: new Date().toISOString(),
            retries: 0,
            maxRetries: 3
        };

        this.eventQueue.push(eventData);
        logger.info(`Event queued: ${event} (Queue size: ${this.eventQueue.length})`);
        
        if (!this.isProcessing) {
            this.processEventQueue();
        }
    }

    async processEventQueue() {
        if (this.isProcessing || this.eventQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        logger.info(`Processing event queue (${this.eventQueue.length} events)`);

        while (this.eventQueue.length > 0) {
            const eventData = this.eventQueue.shift();
            
            try {
                if (eventData.targetPlatforms) {
                    // Send to specific platforms
                    for (const platformName of eventData.targetPlatforms) {
                        await this.sendEventToPlatform(platformName, eventData.event, eventData.data);
                    }
                } else {
                    // Broadcast to all platforms
                    await this.broadcastEvent(eventData.event, eventData.data);
                }
                
                logger.info(`Event processed successfully: ${eventData.event}`);
            } catch (error) {
                logger.error(`Failed to process event ${eventData.event}:`, error.message);
                
                // Retry logic
                if (eventData.retries < eventData.maxRetries) {
                    eventData.retries++;
                    this.eventQueue.push(eventData);
                    logger.info(`Event queued for retry (${eventData.retries}/${eventData.maxRetries}): ${eventData.event}`);
                } else {
                    logger.error(`Event failed after max retries: ${eventData.event}`);
                    this.emit('event_failed', eventData);
                }
            }

            // Small delay between events to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.isProcessing = false;
        logger.info('Event queue processing complete');
    }

    startEventProcessor() {
        // Process queue every 30 seconds
        setInterval(() => {
            if (this.eventQueue.length > 0 && !this.isProcessing) {
                this.processEventQueue();
            }
        }, 30000);
    }

    // Event handlers for different types of interactions
    async handleChatGPTInteraction(data) {
        this.queueEvent('chatgpt_interaction', {
            ...data,
            platform: 'chatgpt',
            type: 'ai_conversation'
        }, ['notion', 'zapier', 'firebase']);
    }

    async handleClaudeInteraction(data) {
        this.queueEvent('claude_interaction', {
            ...data,
            platform: 'claude',
            type: 'ai_conversation'
        }, ['notion', 'zapier', 'firebase']);
    }

    async handleCursorInteraction(data) {
        this.queueEvent('cursor_interaction', {
            ...data,
            platform: 'cursor',
            type: 'code_development'
        }, ['github', 'notion', 'zapier']);
    }

    async handleNotionInteraction(data) {
        this.queueEvent('notion_interaction', {
            ...data,
            platform: 'notion',
            type: 'productivity'
        }, ['zapier', 'github', 'firebase']);
    }

    async handleGitHubInteraction(data) {
        this.queueEvent('github_interaction', {
            ...data,
            platform: 'github',
            type: 'code_repository'
        }, ['notion', 'zapier', 'vercel']);
    }

    getPlatformStatus() {
        const status = {};
        for (const [name, config] of this.platforms.entries()) {
            status[name] = {
                enabled: config.enabled,
                type: config.type,
                hasWebhook: !!config.endpoints.webhook,
                hasAPI: !!config.endpoints.api
            };
        }
        return status;
    }

    getEnabledPlatforms() {
        return Array.from(this.platforms.entries())
            .filter(([, config]) => config.enabled)
            .map(([name, config]) => ({ name, type: config.type }));
    }

    async testPlatformConnection(platformName) {
        const platform = this.platforms.get(platformName);
        if (!platform || !platform.enabled) {
            return { success: false, error: 'Platform not available or disabled' };
        }

        try {
            const headers = this.buildAuthHeaders(platform);
            const testPayload = {
                event: 'connection_test',
                data: { test: true },
                timestamp: new Date().toISOString()
            };

            if (platform.endpoints.webhook) {
                await axios.post(platform.endpoints.webhook, testPayload, { headers });
            } else if (platform.endpoints.api) {
                await axios.get(platform.endpoints.api, { headers });
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = { PlatformIntegrationService };