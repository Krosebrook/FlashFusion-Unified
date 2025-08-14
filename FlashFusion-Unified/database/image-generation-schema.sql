-- Image Generation Function Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- API Rate Limits Table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique constraint per user per endpoint
    UNIQUE(user_id, endpoint)
);

-- User Activity Table (enhanced)
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Violations Table
CREATE TABLE IF NOT EXISTS public.content_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    violation_terms TEXT[] DEFAULT '{}',
    severity VARCHAR(20) DEFAULT 'medium',
    reviewed BOOLEAN DEFAULT FALSE,
    reviewer_id UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Failures Table
CREATE TABLE IF NOT EXISTS public.api_failures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    api_provider VARCHAR(50) NOT NULL,
    error_code INTEGER,
    error_message TEXT,
    request_data JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Images Table (optional - for storing metadata)
CREATE TABLE IF NOT EXISTS public.generated_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_uuid VARCHAR(255) UNIQUE,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    model VARCHAR(100),
    width INTEGER,
    height INTEGER,
    steps INTEGER,
    cfg_scale DECIMAL(3,1),
    seed BIGINT,
    cost DECIMAL(10,6) DEFAULT 0,
    nsfw_content BOOLEAN DEFAULT FALSE,
    generation_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON public.api_rate_limits(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.api_rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_type ON public.user_activity(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_violations_user ON public.content_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_violations_reviewed ON public.content_violations(reviewed, created_at);
CREATE INDEX IF NOT EXISTS idx_api_failures_provider ON public.api_failures(api_provider, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_user ON public.generated_images(user_id, created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "Users can view own rate limits" ON public.api_rate_limits
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own activity
CREATE POLICY "Users can view own activity" ON public.user_activity
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own violations (admins can see all)
CREATE POLICY "Users can view own violations" ON public.content_violations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own images
CREATE POLICY "Users can view own images" ON public.generated_images
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (for the function)
CREATE POLICY "Service role full access - rate limits" ON public.api_rate_limits
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - activity" ON public.user_activity
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - violations" ON public.content_violations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - failures" ON public.api_failures
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - images" ON public.generated_images
    FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up old rate limit records (run daily)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete rate limit records older than 7 days
    DELETE FROM public.api_rate_limits 
    WHERE window_start < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also clean up old activity records (keep 30 days)
    DELETE FROM public.user_activity 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$;

-- Function to get user generation stats
CREATE OR REPLACE FUNCTION get_user_generation_stats(user_uuid UUID)
RETURNS TABLE (
    total_images INTEGER,
    images_today INTEGER,
    images_this_week INTEGER,
    total_cost DECIMAL,
    avg_generation_time DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_images,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END)::INTEGER as images_today,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::INTEGER as images_this_week,
        COALESCE(SUM(cost), 0) as total_cost,
        COALESCE(AVG(generation_time_ms), 0) as avg_generation_time
    FROM public.generated_images 
    WHERE user_id = user_uuid;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.api_rate_limits TO anon, authenticated;
GRANT SELECT, INSERT ON public.user_activity TO anon, authenticated;
GRANT SELECT, INSERT ON public.content_violations TO anon, authenticated;
GRANT SELECT, INSERT ON public.api_failures TO anon, authenticated;
GRANT SELECT, INSERT ON public.generated_images TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_generation_stats TO authenticated;