-- FlashFusion Search System Database Schema
-- This schema provides comprehensive search functionality across all platform content

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search capabilities

-- Search History Table
-- Tracks all search queries for analytics and suggestions
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    options JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    count INTEGER DEFAULT 1,
    user_id UUID, -- Optional: link to user if authenticated
    session_id TEXT, -- For anonymous users
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON search_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_history_count ON search_history(count DESC);

-- Search Indices Tables
-- Separate tables for different content types to optimize performance

-- Workflows Search Index
CREATE TABLE IF NOT EXISTS search_workflows (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    status TEXT,
    tags TEXT[],
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(type, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(status, '')), 'C') ||
        setweight(to_tsvector('english', array_to_string(coalesce(tags, ARRAY[]::text[]), ' ')), 'D')
    ) STORED
);

-- Agents Search Index
CREATE TABLE IF NOT EXISTS search_agents (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    capabilities TEXT[],
    description TEXT,
    performance JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(role, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(coalesce(capabilities, ARRAY[]::text[]), ' ')), 'C')
    ) STORED
);

-- Projects Search Index
CREATE TABLE IF NOT EXISTS search_projects (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    phase TEXT,
    status TEXT,
    context JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(phase, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(status, '')), 'C')
    ) STORED
);

-- Integrations Search Index
CREATE TABLE IF NOT EXISTS search_integrations (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    status TEXT,
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(type, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(status, '')), 'C')
    ) STORED
);

-- Analytics Search Index
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    metrics JSONB,
    insights JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(type, '')), 'C')
    ) STORED
);

-- Content Search Index
CREATE TABLE IF NOT EXISTS search_content (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(type, '')), 'C') ||
        setweight(to_tsvector('english', array_to_string(coalesce(tags, ARRAY[]::text[]), ' ')), 'D')
    ) STORED
);

-- Create GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_search_workflows_vector ON search_workflows USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_agents_vector ON search_agents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_projects_vector ON search_projects USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_integrations_vector ON search_integrations USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_analytics_vector ON search_analytics USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_content_vector ON search_content USING GIN(search_vector);

-- Create additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_search_workflows_status ON search_workflows(status);
CREATE INDEX IF NOT EXISTS idx_search_workflows_type ON search_workflows(type);
CREATE INDEX IF NOT EXISTS idx_search_workflows_updated_at ON search_workflows(updated_at);

CREATE INDEX IF NOT EXISTS idx_search_agents_role ON search_agents(role);
CREATE INDEX IF NOT EXISTS idx_search_agents_updated_at ON search_agents(updated_at);

CREATE INDEX IF NOT EXISTS idx_search_projects_phase ON search_projects(phase);
CREATE INDEX IF NOT EXISTS idx_search_projects_status ON search_projects(status);
CREATE INDEX IF NOT EXISTS idx_search_projects_updated_at ON search_projects(updated_at);

CREATE INDEX IF NOT EXISTS idx_search_integrations_type ON search_integrations(type);
CREATE INDEX IF NOT EXISTS idx_search_integrations_status ON search_integrations(status);
CREATE INDEX IF NOT EXISTS idx_search_integrations_updated_at ON search_integrations(updated_at);

CREATE INDEX IF NOT EXISTS idx_search_analytics_type ON search_analytics(type);
CREATE INDEX IF NOT EXISTS idx_search_analytics_updated_at ON search_analytics(updated_at);

CREATE INDEX IF NOT EXISTS idx_search_content_type ON search_content(type);
CREATE INDEX IF NOT EXISTS idx_search_content_updated_at ON search_content(updated_at);

-- Search Analytics Table
-- Stores aggregated search metrics for performance insights
CREATE TABLE IF NOT EXISTS search_analytics_aggregated (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_searches INTEGER DEFAULT 0,
    unique_queries INTEGER DEFAULT 0,
    average_search_time DECIMAL(5,2), -- in seconds
    search_success_rate DECIMAL(5,2), -- percentage
    content_type_distribution JSONB, -- {"workflows": 150, "agents": 75, ...}
    popular_queries JSONB, -- [{"query": "workflow", "count": 25}, ...]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_aggregated_date ON search_analytics_aggregated(date);

-- Search Suggestions Table
-- Stores AI-generated and user-based search suggestions
CREATE TABLE IF NOT EXISTS search_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ai_generated', 'user_based', 'popular')),
    relevance_score DECIMAL(3,2) DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_suggestions_query ON search_suggestions(query);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_type ON search_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_relevance ON search_suggestions(relevance_score DESC);

-- Search Filters Table
-- Stores saved search filters for users
CREATE TABLE IF NOT EXISTS search_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_filters_user_id ON search_filters(user_id);

-- Search Performance Metrics Table
-- Tracks search performance for optimization
CREATE TABLE IF NOT EXISTS search_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id UUID REFERENCES search_history(id),
    query TEXT NOT NULL,
    response_time_ms INTEGER,
    results_count INTEGER,
    cache_hit BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_performance_metrics_created_at ON search_performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_search_performance_metrics_response_time ON search_performance_metrics(response_time_ms);

-- Functions for search operations

-- Function to update search history count
CREATE OR REPLACE FUNCTION update_search_history_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to update existing record
    UPDATE search_history 
    SET count = count + 1, updated_at = NOW()
    WHERE query = NEW.query;
    
    -- If no rows were updated, insert new record
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle search history updates
CREATE TRIGGER trigger_update_search_history_count
    BEFORE INSERT ON search_history
    FOR EACH ROW
    EXECUTE FUNCTION update_search_history_count();

-- Function to calculate search relevance
CREATE OR REPLACE FUNCTION calculate_search_relevance(
    search_query TEXT,
    content_vector tsvector,
    content_weight DECIMAL DEFAULT 1.0
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ts_rank(content_vector, plainto_tsquery('english', search_query)) * content_weight;
END;
$$ LANGUAGE plpgsql;

-- Function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(
    search_query TEXT,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE(suggestion TEXT, type TEXT, relevance_score DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.suggestion,
        s.type,
        s.relevance_score
    FROM search_suggestions s
    WHERE s.is_active = true
    AND (
        s.query ILIKE search_query || '%'
        OR s.suggestion ILIKE search_query || '%'
    )
    ORDER BY s.relevance_score DESC, s.usage_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate daily search analytics
CREATE OR REPLACE FUNCTION aggregate_daily_search_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO search_analytics_aggregated (
        date,
        total_searches,
        unique_queries,
        average_search_time,
        search_success_rate,
        content_type_distribution,
        popular_queries
    )
    SELECT
        target_date,
        COUNT(*) as total_searches,
        COUNT(DISTINCT query) as unique_queries,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as average_search_time,
        (COUNT(*) FILTER (WHERE options->>'success' = 'true') * 100.0 / COUNT(*)) as search_success_rate,
        '{}'::jsonb as content_type_distribution, -- Will be populated separately
        jsonb_agg(
            jsonb_build_object(
                'query', query,
                'count', count
            ) ORDER BY count DESC
        ) FILTER (WHERE count > 1) as popular_queries
    FROM search_history
    WHERE DATE(timestamp) = target_date
    ON CONFLICT (date) DO UPDATE SET
        total_searches = EXCLUDED.total_searches,
        unique_queries = EXCLUDED.unique_queries,
        average_search_time = EXCLUDED.average_search_time,
        search_success_rate = EXCLUDED.search_success_rate,
        popular_queries = EXCLUDED.popular_queries,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean old search data
CREATE OR REPLACE FUNCTION clean_old_search_data(days_to_keep INTEGER DEFAULT 90)
RETURNS VOID AS $$
BEGIN
    -- Clean old search history
    DELETE FROM search_history 
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    
    -- Clean old performance metrics
    DELETE FROM search_performance_metrics 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    -- Clean old aggregated analytics (keep for 1 year)
    DELETE FROM search_analytics_aggregated 
    WHERE date < CURRENT_DATE - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Views for easier querying

-- View for search statistics
CREATE OR REPLACE VIEW search_statistics AS
SELECT
    COUNT(*) as total_searches,
    COUNT(DISTINCT query) as unique_queries,
    AVG(count) as average_searches_per_query,
    MAX(timestamp) as last_search_time
FROM search_history;

-- View for popular searches
CREATE OR REPLACE VIEW popular_searches AS
SELECT
    query,
    SUM(count) as total_count,
    COUNT(*) as search_occurrences,
    MAX(timestamp) as last_searched
FROM search_history
GROUP BY query
ORDER BY total_count DESC;

-- View for search performance
CREATE OR REPLACE VIEW search_performance AS
SELECT
    DATE(created_at) as search_date,
    COUNT(*) as total_searches,
    AVG(response_time_ms) as avg_response_time,
    COUNT(*) FILTER (WHERE cache_hit = true) as cache_hits,
    COUNT(*) FILTER (WHERE error_message IS NOT NULL) as errors
FROM search_performance_metrics
GROUP BY DATE(created_at)
ORDER BY search_date DESC;

-- Insert sample data for testing

-- Sample search history
INSERT INTO search_history (query, count, timestamp) VALUES
('workflow automation', 15, NOW() - INTERVAL '1 hour'),
('AI agents', 8, NOW() - INTERVAL '2 hours'),
('project management', 12, NOW() - INTERVAL '3 hours'),
('integration setup', 6, NOW() - INTERVAL '4 hours'),
('analytics dashboard', 9, NOW() - INTERVAL '5 hours')
ON CONFLICT (query) DO UPDATE SET count = search_history.count + EXCLUDED.count;

-- Sample search suggestions
INSERT INTO search_suggestions (query, suggestion, type, relevance_score) VALUES
('workflow', 'workflow automation', 'ai_generated', 0.95),
('workflow', 'workflow templates', 'ai_generated', 0.85),
('agent', 'AI agents', 'ai_generated', 0.90),
('agent', 'agent configuration', 'ai_generated', 0.80),
('project', 'project management', 'ai_generated', 0.88),
('project', 'project analytics', 'ai_generated', 0.75);

-- Sample content for search indices
INSERT INTO search_workflows (id, name, description, type, status, tags) VALUES
(uuid_generate_v4(), 'E-commerce Automation', 'Automated product research and listing workflow', 'commerce', 'active', ARRAY['ecommerce', 'automation', 'research']),
(uuid_generate_v4(), 'Content Creation Pipeline', 'AI-powered content generation and distribution', 'content', 'active', ARRAY['content', 'ai', 'creation']),
(uuid_generate_v4(), 'Lead Generation System', 'Automated lead capture and nurturing workflow', 'marketing', 'active', ARRAY['leads', 'marketing', 'automation']);

INSERT INTO search_agents (id, name, role, capabilities, description) VALUES
(uuid_generate_v4(), 'Market Researcher', 'Research and Analysis', ARRAY['market_research', 'competitor_analysis', 'trend_identification'], 'Specialized agent for market research and competitive analysis'),
(uuid_generate_v4(), 'Content Creator', 'Content Generation', ARRAY['content_creation', 'copywriting', 'design'], 'AI agent for creating engaging content across multiple formats'),
(uuid_generate_v4(), 'Data Analyst', 'Analytics and Insights', ARRAY['data_analysis', 'reporting', 'insights'], 'Analytics agent for processing data and generating insights');

INSERT INTO search_projects (id, name, description, phase, status) VALUES
(uuid_generate_v4(), 'SaaS MVP Development', 'Building a minimum viable product for SaaS platform', 'development', 'in_progress'),
(uuid_generate_v4(), 'E-commerce Store Launch', 'Launching a new online store with automation', 'launch', 'planning'),
(uuid_generate_v4(), 'Content Marketing Campaign', 'Creating and distributing content marketing materials', 'execution', 'active');

-- Create a scheduled job to aggregate analytics daily (requires pg_cron extension)
-- SELECT cron.schedule('aggregate-search-analytics', '0 1 * * *', 'SELECT aggregate_daily_search_analytics();');

-- Create a scheduled job to clean old data weekly
-- SELECT cron.schedule('clean-search-data', '0 2 * * 0', 'SELECT clean_old_search_data(90);');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE search_history IS 'Tracks all search queries for analytics and suggestions';
COMMENT ON TABLE search_workflows IS 'Search index for workflow content';
COMMENT ON TABLE search_agents IS 'Search index for agent content';
COMMENT ON TABLE search_projects IS 'Search index for project content';
COMMENT ON TABLE search_integrations IS 'Search index for integration content';
COMMENT ON TABLE search_analytics IS 'Search index for analytics content';
COMMENT ON TABLE search_content IS 'Search index for general content';
COMMENT ON TABLE search_analytics_aggregated IS 'Daily aggregated search analytics';
COMMENT ON TABLE search_suggestions IS 'AI-generated and user-based search suggestions';
COMMENT ON TABLE search_filters IS 'Saved search filters for users';
COMMENT ON TABLE search_performance_metrics IS 'Search performance tracking for optimization'; 