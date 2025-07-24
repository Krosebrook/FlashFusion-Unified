// Database Service Layer for FlashFusion
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

class DatabaseService {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
        this.connectionError = null;
    }

    async initialize() {
        try {
            // Initialize Supabase client
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase credentials. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
            }

            this.supabase = createClient(supabaseUrl, supabaseKey);
            
            // Test connection
            const { data, error } = await this.supabase
                .from('agent_personalities')
                .select('count(*)')
                .limit(1);

            if (error) {
                throw new Error(`Database connection failed: ${error.message}`);
            }

            this.isConnected = true;
            console.log('✅ Database connection established successfully');
            
            // Initialize schema if needed
            await this.ensureSchemaExists();
            
            return true;
        } catch (error) {
            this.connectionError = error.message;
            this.isConnected = false;
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    async ensureSchemaExists() {
        try {
            // Check if agent_personalities table exists
            const { data, error } = await this.supabase
                .from('agent_personalities')
                .select('id')
                .limit(1);

            if (error && error.code === 'PGRST116') {
                console.log('🔧 Database schema not found, would need manual setup');
                // Note: Schema creation requires admin privileges
                // User should run the schema.sql file manually
            }
        } catch (error) {
            console.warn('Schema check failed:', error.message);
        }
    }

    // Agent Personalities
    async getAgentPersonalities() {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('agent_personalities')
                .select('*');

            if (error) throw error;

            return { success: true, data: data || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createAgentPersonality(agentData) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('agent_personalities')
                .insert([agentData])
                .select();

            if (error) throw error;

            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateAgentPersonality(agentId, updates) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('agent_personalities')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('agent_id', agentId)
                .select();

            if (error) throw error;

            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Agent States
    async getAgentState(agentId) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('agent_states')
                .select('*')
                .eq('agent_id', agentId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            return { success: true, data: data || null };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateAgentState(agentId, stateData) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('agent_states')
                .upsert({
                    agent_id: agentId,
                    ...stateData,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;

            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Agent Logs
    async logAgentInteraction(logData) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('agent_logs')
                .insert([{
                    ...logData,
                    timestamp: new Date().toISOString()
                }])
                .select();

            if (error) throw error;

            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAgentLogs(agentId, limit = 100) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            let query = this.supabase
                .from('agent_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (agentId) {
                query = query.eq('agent_id', agentId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return { success: true, data: data || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Agent Memory
    async saveAgentMemory(memoryData) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('agent_memory')
                .insert([memoryData])
                .select();

            if (error) throw error;

            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAgentMemory(agentId, userId, conversationId, limit = 50) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('agent_memory')
                .select('*')
                .eq('agent_id', agentId)
                .eq('user_id', userId)
                .eq('conversation_id', conversationId)
                .order('sequence_number', { ascending: true })
                .limit(limit);

            if (error) throw error;

            return { success: true, data: data || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Projects
    async createProject(projectData) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('projects')
                .insert([projectData])
                .select();

            if (error) throw error;

            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getProjects(ownerId) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            let query = this.supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (ownerId) {
                query = query.eq('owner_id', ownerId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return { success: true, data: data || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // API Usage Tracking
    async logApiUsage(usageData) {
        if (!this.isConnected) {
            return { success: false, error: 'Database not connected' };
        }

        try {
            const { data, error } = await this.supabase
                .from('api_usage')
                .insert([usageData])
                .select();

            if (error) throw error;

            return { success: true, data: data[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Health Check
    async healthCheck() {
        try {
            const { data, error } = await this.supabase
                .from('agent_personalities')
                .select('count(*)')
                .limit(1);

            if (error) throw error;

            return {
                status: 'healthy',
                connected: this.isConnected,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Utility Methods
    async cleanup() {
        if (!this.isConnected) return;

        try {
            // Clean up expired agent memory
            await this.supabase
                .from('agent_memory')
                .delete()
                .lt('expires_at', new Date().toISOString());

            console.log('🧹 Database cleanup completed');
        } catch (error) {
            console.error('Cleanup failed:', error.message);
        }
    }

    getConnectionStatus() {
        return {
            connected: this.isConnected,
            error: this.connectionError,
            timestamp: new Date().toISOString()
        };
    }
}

// Export singleton instance
const databaseService = new DatabaseService();
module.exports = databaseService;