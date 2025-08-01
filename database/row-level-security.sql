-- =====================================================
-- FLASHFUSION ROW-LEVEL SECURITY CONHFIGURATION
-- Comprehensive security policies and audit logging
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only policy for audit log
CREATE POLICY audit_log_admin_policy ON security_audit_log
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_action VARCHAR(50),
    p_table_name VARCHAR(50),
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO security_audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        session_id,
        metadata
    ) VALUES (
        auth.uid(),
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent',
        current_setting('request.headers', true)::json->>'x-session-id',
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USER SECURITY POLICIES
-- =====================================================

-- Users can only see their own data
CREATE POLICY users_own_data_policy ON users
    FOR ALL USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY users_update_own_policy ON users
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- PROJECT SECURITY POLICIES
-- =====================================================

-- Users can only access their own projects
CREATE POLICY projects_own_data_policy ON projects
    FOR ALL USING (auth.uid() = owner_id);

-- Users can only create projects for themselves
CREATE POLICY projects_create_own_policy ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can only update their own projects
CREATE POLICY projects_update_own_policy ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can only delete their own projects
CREATE POLICY projects_delete_own_policy ON projects
    FOR DELETE USING (auth.uid() = owner_id);

-- =====================================================
-- WORKFLOW SECURITY POLICIES
-- =====================================================

-- Users can only access workflows in their projects
CREATE POLICY workflows_project_policy ON workflows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = workflows.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- Users can only create workflows in their projects
CREATE POLICY workflows_create_policy ON workflows
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = workflows.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- =====================================================
-- AGENT PERSONALITIES SECURITY POLICIES
-- =====================================================

-- Users can only access their own agent personalities
CREATE POLICY agent_personalities_own_policy ON agent_personalities
    FOR ALL USING (auth.uid() = user_id);

-- Users can only create agent personalities for themselves
CREATE POLICY agent_personalities_create_policy ON agent_personalities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own agent personalities
CREATE POLICY agent_personalities_update_policy ON agent_personalities
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own agent personalities
CREATE POLICY agent_personalities_delete_policy ON agent_personalities
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- AGENT STATES SECURITY POLICIES
-- =====================================================

-- Users can only access their own agent states
CREATE POLICY agent_states_own_policy ON agent_states
    FOR ALL USING (auth.uid() = user_id);

-- Users can only create agent states for themselves
CREATE POLICY agent_states_create_policy ON agent_states
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own agent states
CREATE POLICY agent_states_update_policy ON agent_states
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- AGENT INTERACTIONS SECURITY POLICIES
-- =====================================================

-- Users can only access their own agent interactions
CREATE POLICY agent_interactions_own_policy ON agent_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Users can only create agent interactions for themselves
CREATE POLICY agent_interactions_create_policy ON agent_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- API KEYS SECURITY POLICIES
-- =====================================================

-- Users can only access their own API keys
CREATE POLICY api_keys_own_policy ON api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Users can only create API keys for themselves
CREATE POLICY api_keys_create_policy ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own API keys
CREATE POLICY api_keys_update_policy ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own API keys
CREATE POLICY api_keys_delete_policy ON api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- API USAGE LOGS SECURITY POLICIES
-- =====================================================

-- Users can only access their own API usage logs
CREATE POLICY api_usage_logs_own_policy ON api_usage_logs
    FOR ALL USING (auth.uid() = user_id);

-- Users can only create API usage logs for themselves
CREATE POLICY api_usage_logs_create_policy ON api_usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR AUDIT LOGGING
-- =====================================================

-- Function to handle audit logging on table changes
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_security_event(
            'INSERT',
            TG_TABLE_NAME,
            NEW.id,
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_security_event(
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_security_event(
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging on sensitive tables
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_projects_changes
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_api_keys_changes
    AFTER INSERT OR UPDATE OR DELETE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user has access to a project
CREATE OR REPLACE FUNCTION has_project_access(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_id 
        AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN COALESCE(auth.jwt() ->> 'role', 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDEXES FOR SECURITY AUDIT LOG
-- =====================================================

-- Indexes for efficient audit log queries
CREATE INDEX idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_action ON security_audit_log(action);
CREATE INDEX idx_security_audit_log_table_name ON security_audit_log(table_name);
CREATE INDEX idx_security_audit_log_created_at ON security_audit_log(created_at);
CREATE INDEX idx_security_audit_log_ip_address ON security_audit_log(ip_address);

-- Composite index for common queries
CREATE INDEX idx_security_audit_log_user_action ON security_audit_log(user_id, action);
CREATE INDEX idx_security_audit_log_table_action ON security_audit_log(table_name, action);

-- =====================================================
-- SECURITY VIEWS
-- =====================================================

-- View for user's own audit log entries
CREATE VIEW user_audit_log AS
SELECT 
    id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    created_at,
    metadata
FROM security_audit_log
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON user_audit_log TO authenticated;

-- =====================================================
-- SECURITY SETTINGS
-- =====================================================

-- Set secure defaults
ALTER DATABASE flashfusion SET session_replication_role = replica;
ALTER DATABASE flashfusion SET log_statement = 'all';
ALTER DATABASE flashfusion SET log_connections = on;
ALTER DATABASE flashfusion SET log_disconnections = on;

-- Create security role for application
CREATE ROLE flashfusion_app_role;
GRANT CONNECT ON DATABASE flashfusion TO flashfusion_app_role;
GRANT USAGE ON SCHEMA public TO flashfusion_app_role;

-- Grant necessary permissions to application role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO flashfusion_app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO flashfusion_app_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION log_security_event TO flashfusion_app_role;
GRANT EXECUTE ON FUNCTION has_project_access TO flashfusion_app_role;
GRANT EXECUTE ON FUNCTION get_user_role TO flashfusion_app_role;
GRANT EXECUTE ON FUNCTION is_admin TO flashfusion_app_role;

-- =====================================================
-- SECURITY MONITORING
-- =====================================================

-- Function to get security statistics
CREATE OR REPLACE FUNCTION get_security_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_events BIGINT,
    failed_logins BIGINT,
    suspicious_ips BIGINT,
    admin_actions BIGINT,
    data_access_events BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE action = 'LOGIN_FAILED') as failed_logins,
        COUNT(DISTINCT ip_address) FILTER (WHERE action IN ('LOGIN_FAILED', 'SUSPICIOUS_ACTIVITY')) as suspicious_ips,
        COUNT(*) FILTER (WHERE action LIKE '%ADMIN%') as admin_actions,
        COUNT(*) FILTER (WHERE action IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')) as data_access_events
    FROM security_audit_log
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to security stats function
GRANT EXECUTE ON FUNCTION get_security_stats TO flashfusion_app_role;

-- =====================================================
-- CLEANUP FUNCTION
-- =====================================================

-- Function to clean old audit logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_audit_log 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean old audit logs (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs();');

-- =====================================================
-- SECURITY ALERTS
-- =====================================================

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TABLE (
    alert_type VARCHAR(50),
    description TEXT,
    severity VARCHAR(20),
    ip_address INET,
    user_id UUID,
    event_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    -- Multiple failed logins from same IP
    SELECT 
        'MULTIPLE_FAILED_LOGINS'::VARCHAR(50) as alert_type,
        'Multiple failed login attempts from same IP'::TEXT as description,
        'HIGH'::VARCHAR(20) as severity,
        sal.ip_address,
        sal.user_id,
        COUNT(*) as event_count
    FROM security_audit_log sal
    WHERE sal.action = 'LOGIN_FAILED'
    AND sal.created_at >= NOW() - INTERVAL '1 hour'
    GROUP BY sal.ip_address, sal.user_id
    HAVING COUNT(*) >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to security alerts function
GRANT EXECUTE ON FUNCTION detect_suspicious_activity TO flashfusion_app_role;

-- =====================================================
-- FINAL SECURITY SETTINGS
-- =====================================================

-- Ensure all security policies are active
SELECT 'Security policies created successfully' as status;

-- Log the security setup
INSERT INTO security_audit_log (action, table_name, metadata)
VALUES (
    'SECURITY_SETUP',
    'SYSTEM',
    '{"setup_type": "row_level_security", "version": "2.0.0", "timestamp": "' || NOW() || '"}'
); 