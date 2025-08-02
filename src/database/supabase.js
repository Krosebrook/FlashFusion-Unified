import { createClient } from '@supabase/supabase-js';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/database.log' }),
        new winston.transports.Console()
    ]
});

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Create mock clients if environment variables not set
let supabase = null;
let supabaseAdmin = null;

if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Supabase environment variables not configured. Database features will be limited.');
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;
}

export { supabase, supabaseAdmin };

/**
 * Database connection utilities for FlashFusion
 */
export class DatabaseManager {
    constructor() {
        this.client = supabase;
        this.adminClient = supabaseAdmin;
        this.logger = logger;
        this.isConfigured = !!(supabase && supabaseAdmin);
        
        if (!this.isConfigured) {
            this.logger.warn('DatabaseManager initialized without Supabase configuration');
        }
    }
    
    /**
     * Check if database is configured
     */
    checkConfiguration() {
        if (!this.isConfigured) {
            throw new Error('Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
        }
    }

    /**
     * User Management
     */
    async createUser(userData) {
        try {
            const { data, error } = await this.client
                .from('users')
                .insert([userData])
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`User created: ${data.id}`);
            return data;
        } catch (error) {
            this.logger.error('Error creating user:', error);
            throw error;
        }
    }

    async getUserByAuthId(authId) {
        try {
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching user:', error);
            throw error;
        }
    }

    async updateUser(userId, updates) {
        try {
            const { data, error } = await this.client
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`User updated: ${userId}`);
            return data;
        } catch (error) {
            this.logger.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Project Management
     */
    async createProject(projectData) {
        try {
            const { data, error } = await this.client
                .from('projects')
                .insert([projectData])
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`Project created: ${data.id}`);
            return data;
        } catch (error) {
            this.logger.error('Error creating project:', error);
            throw error;
        }
    }

    async getUserProjects(userId) {
        try {
            const { data, error } = await this.client
                .from('projects')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching user projects:', error);
            throw error;
        }
    }

    async updateProject(projectId, updates) {
        try {
            const { data, error } = await this.client
                .from('projects')
                .update(updates)
                .eq('id', projectId)
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`Project updated: ${projectId}`);
            return data;
        } catch (error) {
            this.logger.error('Error updating project:', error);
            throw error;
        }
    }

    async deleteProject(projectId) {
        try {
            const { error } = await this.client
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;
            
            this.logger.info(`Project deleted: ${projectId}`);
            return true;
        } catch (error) {
            this.logger.error('Error deleting project:', error);
            throw error;
        }
    }

    /**
     * AI Services Management
     */
    async getAIServices() {
        try {
            const { data, error } = await this.client
                .from('ai_services')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching AI services:', error);
            throw error;
        }
    }

    async createAIService(serviceData) {
        try {
            const { data, error } = await this.adminClient
                .from('ai_services')
                .insert([serviceData])
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`AI service created: ${data.id}`);
            return data;
        } catch (error) {
            this.logger.error('Error creating AI service:', error);
            throw error;
        }
    }

    /**
     * API Keys Management (Encrypted)
     */
    async storeUserAPIKey(userId, serviceName, encryptedKey, alias = null) {
        try {
            const { data, error } = await this.client
                .from('user_api_keys')
                .insert([{
                    user_id: userId,
                    service_name: serviceName,
                    encrypted_api_key: encryptedKey,
                    key_alias: alias
                }])
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`API key stored for user: ${userId}, service: ${serviceName}`);
            return data;
        } catch (error) {
            this.logger.error('Error storing API key:', error);
            throw error;
        }
    }

    async getUserAPIKeys(userId) {
        try {
            const { data, error } = await this.client
                .from('user_api_keys')
                .select('id, service_name, key_alias, is_active, created_at, last_used_at, usage_count')
                .eq('user_id', userId)
                .eq('is_active', true);

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching user API keys:', error);
            throw error;
        }
    }

    /**
     * Code Generation Management
     */
    async createCodeGeneration(generationData) {
        try {
            const { data, error } = await this.client
                .from('code_generations')
                .insert([generationData])
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`Code generation created: ${data.id}`);
            return data;
        } catch (error) {
            this.logger.error('Error creating code generation:', error);
            throw error;
        }
    }

    async updateCodeGeneration(generationId, updates) {
        try {
            const { data, error } = await this.client
                .from('code_generations')
                .update(updates)
                .eq('id', generationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error updating code generation:', error);
            throw error;
        }
    }

    async getProjectCodeGenerations(projectId) {
        try {
            const { data, error } = await this.client
                .from('code_generations')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching project code generations:', error);
            throw error;
        }
    }

    /**
     * Agent Management
     */
    async getActiveAgents() {
        try {
            const { data, error } = await this.client
                .from('agents')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching active agents:', error);
            throw error;
        }
    }

    async createAgentTask(taskData) {
        try {
            const { data, error } = await this.client
                .from('agent_tasks')
                .insert([taskData])
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`Agent task created: ${data.id}`);
            return data;
        } catch (error) {
            this.logger.error('Error creating agent task:', error);
            throw error;
        }
    }

    async updateAgentTask(taskId, updates) {
        try {
            const { data, error } = await this.client
                .from('agent_tasks')
                .update(updates)
                .eq('id', taskId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error updating agent task:', error);
            throw error;
        }
    }

    async getAgentTasks(agentId, status = null) {
        try {
            let query = this.client
                .from('agent_tasks')
                .select('*')
                .eq('agent_id', agentId);

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching agent tasks:', error);
            throw error;
        }
    }

    /**
     * Deployment Management
     */
    async createDeployment(deploymentData) {
        try {
            const { data, error } = await this.client
                .from('deployments')
                .insert([deploymentData])
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`Deployment created: ${data.id}`);
            return data;
        } catch (error) {
            this.logger.error('Error creating deployment:', error);
            throw error;
        }
    }

    async updateDeployment(deploymentId, updates) {
        try {
            const { data, error } = await this.client
                .from('deployments')
                .update(updates)
                .eq('id', deploymentId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error updating deployment:', error);
            throw error;
        }
    }

    async getProjectDeployments(projectId) {
        try {
            const { data, error } = await this.client
                .from('deployments')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching project deployments:', error);
            throw error;
        }
    }

    /**
     * Usage Analytics
     */
    async trackUsage(userId, eventType, eventData = {}, projectId = null) {
        try {
            const { data, error } = await this.client
                .from('usage_analytics')
                .insert([{
                    user_id: userId,
                    project_id: projectId,
                    event_type: eventType,
                    event_data: eventData,
                    session_id: eventData.session_id || null,
                    api_tokens_used: eventData.tokens_used || 0,
                    cost_incurred: eventData.cost || 0
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error tracking usage:', error);
            throw error;
        }
    }

    async getUserUsageStats(userId, startDate = null, endDate = null) {
        try {
            let query = this.client
                .from('usage_analytics')
                .select('*')
                .eq('user_id', userId);

            if (startDate) {
                query = query.gte('timestamp', startDate);
            }

            if (endDate) {
                query = query.lte('timestamp', endDate);
            }

            const { data, error } = await query.order('timestamp', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching usage stats:', error);
            throw error;
        }
    }

    /**
     * Notifications
     */
    async createNotification(userId, title, message, type = 'info', actionUrl = null) {
        try {
            const { data, error } = await this.client
                .from('notifications')
                .insert([{
                    user_id: userId,
                    title,
                    message,
                    type,
                    action_url: actionUrl
                }])
                .select()
                .single();

            if (error) throw error;
            
            this.logger.info(`Notification created for user: ${userId}`);
            return data;
        } catch (error) {
            this.logger.error('Error creating notification:', error);
            throw error;
        }
    }

    async getUserNotifications(userId, unreadOnly = false) {
        try {
            let query = this.client
                .from('notifications')
                .select('*')
                .eq('user_id', userId);

            if (unreadOnly) {
                query = query.eq('is_read', false);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error fetching notifications:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            const { data, error } = await this.client
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', notificationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Health Check
     */
    async healthCheck() {
        if (!this.client) {
            return { 
                status: 'not_configured', 
                message: 'Database not configured',
                timestamp: new Date().toISOString() 
            };
        }
        
        try {
            const { data, error } = await this.client
                .from('users')
                .select('count')
                .limit(1);

            if (error) throw error;
            
            this.logger.info('Database health check passed');
            return { status: 'healthy', timestamp: new Date().toISOString() };
        } catch (error) {
            this.logger.error('Database health check failed:', error);
            return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
        }
    }
}

// Export singleton instance
export const db = new DatabaseManager();
export default db;