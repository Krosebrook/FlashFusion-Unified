-- database/indexes.sql
-- Performance optimization indexes for FlashFusion

-- Create indexes for user activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_activity 
ON users(user_id, last_activity_date);

-- Create indexes for recommendation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_user 
ON recommendations(user_id, created_at DESC);

-- Create indexes for content engagement queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_engagement 
ON content(status, engagement_score DESC);

-- Additional performance indexes

-- User preferences for personalized recommendations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_lookup
ON user_preferences(user_id, preference_type);

-- Content metadata for filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_metadata
ON content(type, status, created_at DESC);

-- Session tracking for auth service
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user
ON sessions(user_id, expires_at);

-- API key lookups (if storing in DB)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_user
ON api_keys(user_id, provider, is_active);

-- Audit logs for compliance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp
ON audit_logs(created_at DESC, action_type);

-- Cache invalidation tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cache_keys
ON cache_entries(cache_key, expires_at);

-- View tracking for trending content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_views
ON content_views(content_id, viewed_at DESC);

-- Composite index for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_full_search
ON content(status, type, engagement_score DESC, created_at DESC);

-- Performance monitoring note
COMMENT ON INDEX idx_users_activity IS 'Optimizes user activity queries for recommendation engine';
COMMENT ON INDEX idx_recommendations_user IS 'Speeds up personalized recommendation fetches';
COMMENT ON INDEX idx_content_engagement IS 'Improves popular content queries';

-- Analyze tables after index creation
ANALYZE users;
ANALYZE recommendations;
ANALYZE content;
ANALYZE user_preferences;
ANALYZE sessions;