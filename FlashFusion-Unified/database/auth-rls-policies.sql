-- FlashFusion Authentication and RLS Policies
-- Comprehensive Row Level Security setup for all tables

-- =============================================================================
-- PART 1: Enable RLS on Core Tables
-- =============================================================================

-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other core tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PART 2: Profiles Table RLS Policies
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Policy for selecting user's own records
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- Policy for inserting new records
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Policy for updating own records
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- Policy for deleting own records
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- =============================================================================
-- PART 3: User Preferences RLS Policies
-- =============================================================================

DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- =============================================================================
-- PART 4: User Activity RLS Policies
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity;

CREATE POLICY "Users can view their own activity" ON public.user_activity
    FOR SELECT USING (
        auth.uid() = user_id
    );

CREATE POLICY "System can insert user activity" ON public.user_activity
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR auth.role() = 'service_role'
    );

-- =============================================================================
-- PART 5: User Favorites RLS Policies
-- =============================================================================

DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.user_favorites;

CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
    FOR ALL USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- =============================================================================
-- PART 6: User Roles RLS Policies
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (
        auth.uid() = user_id
    );

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- =============================================================================
-- PART 7: Notifications RLS Policies
-- =============================================================================

DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- =============================================================================
-- PART 8: Audit Log RLS Policies
-- =============================================================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_log
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- =============================================================================
-- PART 9: Session and Token Management Tables
-- =============================================================================

-- Create secure session storage table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on sessions table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (
        auth.uid() = user_id
    );

CREATE POLICY "System can manage sessions" ON public.user_sessions
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON public.user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- =============================================================================
-- PART 10: OAuth Integration Tables
-- =============================================================================

-- OAuth provider connections
CREATE TABLE IF NOT EXISTS public.oauth_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'shopify', 'etsy', 'tiktok', 'github', etc.
    provider_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT[],
    provider_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider, provider_user_id)
);

-- Enable RLS on OAuth connections
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for OAuth connections
CREATE POLICY "Users can manage their own OAuth connections" ON public.oauth_connections
    FOR ALL USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON public.oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_provider ON public.oauth_connections(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_expires_at ON public.oauth_connections(token_expires_at);

-- =============================================================================
-- PART 11: Security Functions
-- =============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = user_uuid AND role = 'admin'
    );
END;
$$;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Function to rotate OAuth tokens
CREATE OR REPLACE FUNCTION public.rotate_oauth_token(
    p_user_id UUID,
    p_provider TEXT,
    p_new_access_token TEXT,
    p_new_refresh_token TEXT DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.oauth_connections 
    SET 
        access_token = p_new_access_token,
        refresh_token = COALESCE(p_new_refresh_token, refresh_token),
        token_expires_at = COALESCE(p_expires_at, token_expires_at),
        updated_at = NOW()
    WHERE user_id = p_user_id AND provider = p_provider;
    
    RETURN FOUND;
END;
$$;

-- =============================================================================
-- PART 12: Triggers for Updated Timestamps
-- =============================================================================

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply triggers to tables
CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_oauth_connections_updated_at 
    BEFORE UPDATE ON public.oauth_connections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- PART 13: Security Views
-- =============================================================================

-- View for user's active sessions
CREATE OR REPLACE VIEW public.user_active_sessions AS
SELECT 
    id,
    user_id,
    last_accessed,
    ip_address,
    user_agent,
    device_fingerprint,
    created_at
FROM public.user_sessions
WHERE is_active = true AND expires_at > NOW() AND user_id = auth.uid();

-- View for user's OAuth connections
CREATE OR REPLACE VIEW public.user_oauth_providers AS
SELECT 
    id,
    user_id,
    provider,
    provider_user_id,
    scope,
    is_active,
    created_at,
    CASE 
        WHEN token_expires_at > NOW() THEN true 
        ELSE false 
    END as token_valid
FROM public.oauth_connections
WHERE user_id = auth.uid() AND is_active = true;

-- =============================================================================
-- PART 14: Grant Permissions
-- =============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT, INSERT ON public.user_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favorites TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oauth_connections TO authenticated;

-- Grant view permissions
GRANT SELECT ON public.user_active_sessions TO authenticated;
GRANT SELECT ON public.user_oauth_providers TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_oauth_token TO authenticated;

-- =============================================================================
-- PART 15: Verification Queries
-- =============================================================================

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'user_preferences', 'user_activity', 'user_favorites',
    'user_roles', 'notifications', 'audit_log', 'user_sessions', 'oauth_connections'
)
ORDER BY tablename;

-- Verify policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    permissive
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;