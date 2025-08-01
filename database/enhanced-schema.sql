-- Enhanced FlashFusion Database Schema
-- Optimized for scalability, performance, and data governance
-- Supports advanced AI agent framework with memory and learning capabilities

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- Users table with enhanced profile management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    profile JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    subscription_status VARCHAR(50) DEFAULT 'active',
    usage_limits JSONB DEFAULT '{"requests_per_minute": 10, "monthly_tokens": 10000}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'
);

-- User sessions for enhanced security
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AI AGENT SYSTEM
-- =============================================

-- Agent definitions and configurations
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    capabilities TEXT[] NOT NULL DEFAULT '{}',
    personality JSONB NOT NULL DEFAULT '{}',
    configuration JSONB NOT NULL DEFAULT '{}',
    tools TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Agent performance metrics
CREATE TABLE agent_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    tasks_completed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 0,
    average_response_time INTEGER DEFAULT 0, -- milliseconds
    learning_progress DECIMAL(5,4) DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    cost_incurred DECIMAL(10,4) DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, date)
);

-- Agent memory system
CREATE TABLE agent_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL, -- 'short_term', 'long_term', 'semantic', 'episodic'
    content JSONB NOT NULL,
    relevance_score DECIMAL(3,2) DEFAULT 0,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent learning patterns and improvements
CREATE TABLE agent_learning (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL,
    pattern_data JSONB NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0,
    frequency INTEGER DEFAULT 1,
    success_impact DECIMAL(3,2) DEFAULT 0,
    first_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
);

-- =============================================
-- CONVERSATION AND TASK MANAGEMENT
-- =============================================

-- Enhanced conversations with context tracking
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id VARCHAR(50) REFERENCES agents(id),
    session_id UUID,
    message TEXT NOT NULL,
    response TEXT,
    context JSONB DEFAULT '{}',
    requirements JSONB DEFAULT '{}',
    execution_time INTEGER, -- milliseconds
    confidence DECIMAL(3,2),
    reasoning TEXT,
    tools_used TEXT[] DEFAULT '{}',
    memory_context INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(8,4) DEFAULT 0,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Task execution tracking
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id VARCHAR(50) REFERENCES agents(id),
    conversation_id UUID REFERENCES conversations(id),
    task_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '{}',
    constraints JSONB DEFAULT '{}',
    success_criteria JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    execution_plan JSONB,
    result JSONB,
    execution_time INTEGER,
    confidence DECIMAL(3,2),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Task steps for detailed execution tracking
CREATE TABLE task_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(100) NOT NULL,
    description TEXT,
    parameters JSONB DEFAULT '{}',
    tools TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    result JSONB,
    execution_time INTEGER,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- WORKFLOW ORCHESTRATION
-- =============================================

-- Workflow definitions
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    tasks JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Workflow executions
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200),
    status VARCHAR(50) DEFAULT 'running',
    trigger_type VARCHAR(50) DEFAULT 'manual',
    trigger_data JSONB DEFAULT '{}',
    execution_plan JSONB,
    results JSONB DEFAULT '[]',
    total_time INTEGER,
    task_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Workflow execution steps
CREATE TABLE workflow_execution_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
    agent_id VARCHAR(50) REFERENCES agents(id),
    step_order INTEGER NOT NULL,
    task_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    result JSONB,
    execution_time INTEGER,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(8,4) DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ANALYTICS AND MONITORING
-- =============================================

-- Usage analytics
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id VARCHAR(50) REFERENCES agents(id),
    date DATE DEFAULT CURRENT_DATE,
    hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW()),
    requests_count INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    cost_incurred DECIMAL(10,4) DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, agent_id, date, hour)
);

-- System metrics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'counter', 'gauge', 'histogram'
    value DECIMAL(15,4) NOT NULL,
    labels JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Error tracking
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB DEFAULT '{}',
    stack_trace TEXT,
    severity VARCHAR(20) DEFAULT 'error',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BUSINESS INTELLIGENCE
-- =============================================

-- User behavior tracking
CREATE TABLE user_behavior (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature usage tracking
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 1,
    first_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success_rate DECIMAL(5,4) DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, feature_name)
);

-- =============================================
-- SECURITY AND COMPLIANCE
-- =============================================

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- API keys and tokens
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    rate_limit INTEGER DEFAULT 1000,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Session indexes
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Agent indexes
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agent_performance_agent_date ON agent_performance(agent_id, date);

-- Memory indexes
CREATE INDEX idx_agent_memory_agent_id ON agent_memory(agent_id);
CREATE INDEX idx_agent_memory_type ON agent_memory(memory_type);
CREATE INDEX idx_agent_memory_relevance ON agent_memory(relevance_score DESC);
CREATE INDEX idx_agent_memory_tags ON agent_memory USING GIN(tags);
CREATE INDEX idx_agent_memory_content ON agent_memory USING GIN(content);

-- Conversation indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);

-- Task indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Workflow indexes
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_type ON workflows(type);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- Analytics indexes
CREATE INDEX idx_usage_analytics_user_date ON usage_analytics(user_id, date);
CREATE INDEX idx_usage_analytics_agent_date ON usage_analytics(agent_id, date);
CREATE INDEX idx_system_metrics_name_timestamp ON system_metrics(metric_name, timestamp DESC);

-- Error tracking indexes
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

-- =============================================
-- TRIGGERS FOR AUTOMATION
-- =============================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_memory_updated_at BEFORE UPDATE ON agent_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger for sensitive tables
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, resource_type, resource_id, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id::TEXT, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (action, resource_type, resource_id, old_values, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id::TEXT, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, resource_type, resource_id, old_values)
        VALUES (TG_OP, TG_TABLE_NAME, OLD.id::TEXT, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_agents AFTER INSERT OR UPDATE OR DELETE ON agents
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Agent performance summary view
CREATE VIEW agent_performance_summary AS
SELECT 
    a.id,
    a.name,
    a.type,
    COUNT(c.id) as total_conversations,
    AVG(c.confidence) as avg_confidence,
    AVG(c.execution_time) as avg_execution_time,
    COUNT(CASE WHEN c.feedback_rating >= 4 THEN 1 END) as positive_feedback_count,
    SUM(c.tokens_used) as total_tokens_used,
    SUM(c.cost) as total_cost
FROM agents a
LEFT JOIN conversations c ON a.id = c.agent_id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY a.id, a.name, a.type;

-- User usage summary view
CREATE VIEW user_usage_summary AS
SELECT 
    u.id,
    u.email,
    u.subscription_tier,
    COUNT(c.id) as total_conversations,
    COUNT(DISTINCT DATE(c.created_at)) as active_days,
    SUM(c.tokens_used) as total_tokens_used,
    SUM(c.cost) as total_cost,
    AVG(c.feedback_rating) as avg_rating
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.subscription_tier;

-- Workflow success rates view
CREATE VIEW workflow_success_rates AS
SELECT 
    w.id,
    w.name,
    w.type,
    COUNT(we.id) as total_executions,
    COUNT(CASE WHEN we.status = 'completed' THEN 1 END) as successful_executions,
    ROUND(
        COUNT(CASE WHEN we.status = 'completed' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(we.id), 0) * 100, 2
    ) as success_rate,
    AVG(we.total_time) as avg_execution_time
FROM workflows w
LEFT JOIN workflow_executions we ON w.id = we.workflow_id
WHERE we.started_at >= NOW() - INTERVAL '30 days'
GROUP BY w.id, w.name, w.type;

-- =============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

-- Function to calculate user usage limits
CREATE OR REPLACE FUNCTION check_user_usage_limits(user_id_param UUID)
RETURNS TABLE(
    within_request_limit BOOLEAN,
    within_token_limit BOOLEAN,
    requests_used INTEGER,
    tokens_used INTEGER,
    request_limit INTEGER,
    token_limit INTEGER
) AS $$
DECLARE
    user_limits JSONB;
    current_requests INTEGER;
    current_tokens INTEGER;
BEGIN
    -- Get user limits
    SELECT usage_limits INTO user_limits 
    FROM users 
    WHERE id = user_id_param;
    
    -- Get current usage for this month
    SELECT 
        COALESCE(SUM(requests_count), 0),
        COALESCE(SUM(tokens_used), 0)
    INTO current_requests, current_tokens
    FROM usage_analytics 
    WHERE user_id = user_id_param 
    AND date >= DATE_TRUNC('month', CURRENT_DATE);
    
    RETURN QUERY SELECT
        current_requests < (user_limits->>'requests_per_minute')::INTEGER,
        current_tokens < (user_limits->>'monthly_tokens')::INTEGER,
        current_requests,
        current_tokens,
        (user_limits->>'requests_per_minute')::INTEGER,
        (user_limits->>'monthly_tokens')::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Function to update agent performance metrics
CREATE OR REPLACE FUNCTION update_agent_performance_metrics(
    agent_id_param VARCHAR(50),
    execution_time_param INTEGER,
    success_param BOOLEAN,
    tokens_used_param INTEGER DEFAULT 0,
    cost_param DECIMAL(8,4) DEFAULT 0
) RETURNS VOID AS $$
BEGIN
    INSERT INTO agent_performance (
        agent_id, 
        date, 
        tasks_completed, 
        success_rate, 
        average_response_time,
        total_tokens_used,
        cost_incurred
    ) VALUES (
        agent_id_param,
        CURRENT_DATE,
        1,
        CASE WHEN success_param THEN 1.0 ELSE 0.0 END,
        execution_time_param,
        tokens_used_param,
        cost_param
    )
    ON CONFLICT (agent_id, date) DO UPDATE SET
        tasks_completed = agent_performance.tasks_completed + 1,
        success_rate = (
            agent_performance.success_rate * agent_performance.tasks_completed + 
            CASE WHEN success_param THEN 1.0 ELSE 0.0 END
        ) / (agent_performance.tasks_completed + 1),
        average_response_time = (
            agent_performance.average_response_time * agent_performance.tasks_completed + 
            execution_time_param
        ) / (agent_performance.tasks_completed + 1),
        total_tokens_used = agent_performance.total_tokens_used + tokens_used_param,
        cost_incurred = agent_performance.cost_incurred + cost_param;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert default agents
INSERT INTO agents (id, name, type, capabilities, personality, configuration) VALUES
('coordinator', 'Coordinator Agent', 'coordinator', 
 ARRAY['orchestration', 'planning', 'coordination', 'strategy'],
 '{"role": "Strategic Orchestrator", "traits": ["analytical", "organized"], "expertise": ["workflow optimization"]}',
 '{"model": "gpt-4", "temperature": 0.7, "max_tokens": 500}'),
('researcher', 'Research Agent', 'researcher',
 ARRAY['research', 'analysis', 'data_gathering', 'trend_identification'],
 '{"role": "Research Specialist", "traits": ["thorough", "analytical"], "expertise": ["market analysis"]}',
 '{"model": "gpt-4", "temperature": 0.6, "max_tokens": 500}'),
('creator', 'Creator Agent', 'creator',
 ARRAY['content_creation', 'design', 'ideation', 'storytelling'],
 '{"role": "Creative Specialist", "traits": ["innovative", "artistic"], "expertise": ["content strategy"]}',
 '{"model": "gpt-4", "temperature": 0.8, "max_tokens": 500}'),
('automator', 'Automator Agent', 'automator',
 ARRAY['automation', 'integration', 'workflow_optimization', 'process_improvement'],
 '{"role": "Automation Specialist", "traits": ["systematic", "efficient"], "expertise": ["workflow automation"]}',
 '{"model": "gpt-4", "temperature": 0.5, "max_tokens": 500}'),
('analyzer', 'Analyzer Agent', 'analyzer',
 ARRAY['data_analysis', 'performance_monitoring', 'predictive_modeling', 'insights'],
 '{"role": "Analytics Specialist", "traits": ["logical", "detail-oriented"], "expertise": ["data analysis"]}',
 '{"model": "gpt-4", "temperature": 0.4, "max_tokens": 500}'),
('optimizer', 'Optimizer Agent', 'optimizer',
 ARRAY['optimization', 'performance_tuning', 'conversion_improvement', 'efficiency'],
 '{"role": "Optimization Specialist", "traits": ["results-focused", "experimental"], "expertise": ["conversion optimization"]}',
 '{"model": "gpt-4", "temperature": 0.6, "max_tokens": 500}');

-- Create a sample admin user
INSERT INTO users (email, username, subscription_tier, usage_limits) VALUES
('admin@flashfusion.ai', 'admin', 'enterprise', 
 '{"requests_per_minute": 100, "monthly_tokens": 1000000}');

COMMIT;