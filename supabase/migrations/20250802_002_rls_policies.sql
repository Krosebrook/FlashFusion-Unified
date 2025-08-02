-- Row Level Security (RLS) Policies
-- Created: 2025-08-02
-- Description: Security policies for FlashFusion database

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can view public projects" ON projects
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- User API Keys policies (highly sensitive)
CREATE POLICY "Users can only access own API keys" ON user_api_keys
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Code Generations policies
CREATE POLICY "Users can view own code generations" ON code_generations
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own code generations" ON code_generations
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own code generations" ON code_generations
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Agent Tasks policies
CREATE POLICY "Users can view own agent tasks" ON agent_tasks
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own agent tasks" ON agent_tasks
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own agent tasks" ON agent_tasks
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Deployments policies
CREATE POLICY "Users can view own deployments" ON deployments
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own deployments" ON deployments
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own deployments" ON deployments
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Integrations policies
CREATE POLICY "Users can access own integrations" ON integrations
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Billing policies
CREATE POLICY "Users can view own billing" ON billing
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Usage Analytics policies
CREATE POLICY "Users can view own usage analytics" ON usage_analytics
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "System can insert usage analytics" ON usage_analytics
    FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- AI Services and Agents tables are read-only for users
ALTER TABLE ai_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active AI services" ON ai_services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active agents" ON agents
    FOR SELECT USING (is_active = true);

-- Admin policies (for service accounts)
CREATE POLICY "Service role can manage AI services" ON ai_services
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage agents" ON agents
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');