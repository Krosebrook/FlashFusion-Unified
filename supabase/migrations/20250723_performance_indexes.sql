-- Migration: Add performance indexes
-- Created: 2025-07-23
-- Description: Adds indexes for improved query performance

-- Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- User activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_activity 
ON users(user_id, last_activity_date)
WHERE last_activity_date IS NOT NULL;

-- Recommendations lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_user 
ON recommendations(user_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Content engagement queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_engagement 
ON content(status, engagement_score DESC)
WHERE status = 'active';

-- User preferences for AI recommendations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_lookup
ON user_preferences(user_id, preference_type)
WHERE is_active = true;

-- Session management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_active
ON sessions(user_id, expires_at)
WHERE expires_at > NOW();

-- Content search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_search
ON content USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Add table partitioning for large tables (if needed)
-- Example for audit logs by month
/*
CREATE TABLE IF NOT EXISTS audit_logs_2025_07 PARTITION OF audit_logs
FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE IF NOT EXISTS audit_logs_2025_08 PARTITION OF audit_logs
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
*/

-- Update table statistics
ANALYZE users;
ANALYZE recommendations;
ANALYZE content;
ANALYZE user_preferences;
ANALYZE sessions;

-- Add performance monitoring function
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE(
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    max_time DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time,
        pg_stat_statements.mean_exec_time,
        pg_stat_statements.max_exec_time
    FROM pg_stat_statements
    WHERE pg_stat_statements.mean_exec_time > 100 -- queries slower than 100ms
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_slow_queries() TO authenticated;

-- Add index health check function
CREATE OR REPLACE FUNCTION check_index_health()
RETURNS TABLE(
    schemaname NAME,
    tablename NAME,
    indexname NAME,
    index_size TEXT,
    index_scans BIGINT,
    efficiency_ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname,
        s.tablename,
        s.indexname,
        pg_size_pretty(pg_relation_size(s.indexrelid)) AS index_size,
        s.idx_scan AS index_scans,
        CASE 
            WHEN s.idx_scan > 0 THEN 
                ROUND((100.0 * s.idx_scan) / NULLIF(t.seq_scan + s.idx_scan, 0), 2)
            ELSE 0 
        END AS efficiency_ratio
    FROM pg_stat_user_indexes s
    JOIN pg_stat_user_tables t ON s.tablename = t.tablename AND s.schemaname = t.schemaname
    WHERE s.schemaname = 'public'
    ORDER BY efficiency_ratio DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_index_health() TO authenticated;