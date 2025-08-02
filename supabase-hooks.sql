-- =============================================================================
-- Supabase Database Hooks for FlashFusion
-- =============================================================================
-- Run these in Supabase SQL Editor to set up automated webhooks

-- Enable the http extension for making webhook requests
CREATE EXTENSION IF NOT EXISTS http;

-- =============================================================================
-- 1. USER REGISTRATION HOOK
-- =============================================================================

-- Function to send webhook on user signup
CREATE OR REPLACE FUNCTION notify_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Send webhook to Zapier/external service
  PERFORM
    http((
      'POST',
      current_setting('app.webhook_url', true), -- Set this in Supabase dashboard
      ARRAY[http_header('content-type','application/json')],
      json_build_object(
        'event', 'user_signup',
        'user_id', NEW.id,
        'email', NEW.email,
        'created_at', NEW.created_at,
        'metadata', NEW.raw_user_meta_data
      )::text
    )::http_request);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user signups
CREATE OR REPLACE TRIGGER on_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_signup();

-- =============================================================================
-- 2. USER ACTIVITY TRACKING HOOK
-- =============================================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into activity log
  INSERT INTO public.user_activity_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 3. DATA VALIDATION HOOKS
-- =============================================================================

-- Function to validate and clean user data
CREATE OR REPLACE FUNCTION validate_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  -- Clean and validate username
  IF NEW.username IS NOT NULL THEN
    NEW.username = lower(trim(NEW.username));
    
    IF length(NEW.username) < 3 THEN
      RAISE EXCEPTION 'Username must be at least 3 characters';
    END IF;
    
    IF NEW.username ~ '[^a-z0-9_-]' THEN
      RAISE EXCEPTION 'Username can only contain letters, numbers, hyphens, and underscores';
    END IF;
  END IF;
  
  -- Auto-generate slug from name
  IF NEW.name IS NOT NULL AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    NEW.slug = regexp_replace(lower(NEW.name), '[^a-z0-9]+', '-', 'g');
    NEW.slug = trim(NEW.slug, '-');
  END IF;
  
  -- Set timestamps
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 4. SECURITY & AUDIT HOOKS
-- =============================================================================

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log failed login attempts, suspicious activity, etc.
  INSERT INTO public.security_log (
    event_type,
    user_id,
    ip_address,
    user_agent,
    details,
    created_at
  ) VALUES (
    CASE 
      WHEN TG_OP = 'UPDATE' AND OLD.last_sign_in_at != NEW.last_sign_in_at THEN 'login'
      WHEN TG_OP = 'UPDATE' AND OLD.email != NEW.email THEN 'email_change'
      ELSE 'user_update'
    END,
    NEW.id,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent',
    json_build_object(
      'old_email', OLD.email,
      'new_email', NEW.email,
      'changed_fields', (
        SELECT json_object_agg(key, value)
        FROM json_each_text(to_json(NEW))
        WHERE value != coalesce((to_json(OLD)->>key), '')
      )
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5. WEBHOOK NOTIFICATION HOOKS
-- =============================================================================

-- Generic webhook notification function
CREATE OR REPLACE FUNCTION send_webhook_notification(
  event_type text,
  payload jsonb
)
RETURNS void AS $$
DECLARE
  webhook_url text;
  response http_response;
BEGIN
  -- Get webhook URL from settings
  webhook_url := current_setting('app.webhook_url', true);
  
  IF webhook_url IS NOT NULL AND webhook_url != '' THEN
    -- Send webhook
    SELECT * INTO response FROM http((
      'POST',
      webhook_url,
      ARRAY[
        http_header('content-type', 'application/json'),
        http_header('x-event-type', event_type),
        http_header('x-timestamp', extract(epoch from now())::text)
      ],
      json_build_object(
        'event', event_type,
        'timestamp', now(),
        'data', payload
      )::text
    )::http_request);
    
    -- Log webhook result
    INSERT INTO public.webhook_log (
      event_type,
      payload,
      response_status,
      response_body,
      created_at
    ) VALUES (
      event_type,
      payload,
      response.status,
      response.content,
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 6. CONTENT MODERATION HOOKS
-- =============================================================================

-- Function to moderate user-generated content
CREATE OR REPLACE FUNCTION moderate_content()
RETURNS TRIGGER AS $$
DECLARE
  blocked_words text[] := ARRAY['spam', 'inappropriate', 'abuse']; -- Add your list
  word text;
BEGIN
  -- Check for blocked words in content
  IF NEW.content IS NOT NULL THEN
    FOREACH word IN ARRAY blocked_words LOOP
      IF lower(NEW.content) LIKE '%' || word || '%' THEN
        NEW.status = 'pending_review';
        NEW.flagged_at = NOW();
        NEW.flag_reason = 'Automated content filter: ' || word;
        
        -- Send notification to moderators
        PERFORM send_webhook_notification(
          'content_flagged',
          json_build_object(
            'content_id', NEW.id,
            'user_id', NEW.user_id,
            'reason', NEW.flag_reason,
            'content_preview', left(NEW.content, 100)
          )
        );
        
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 7. PERFORMANCE MONITORING HOOKS
-- =============================================================================

-- Function to track slow queries and performance
CREATE OR REPLACE FUNCTION track_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Track expensive operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND TG_TABLE_NAME IN ('large_table', 'analytics_events') THEN
    INSERT INTO public.performance_log (
      operation,
      table_name,
      record_count,
      execution_time,
      created_at
    ) VALUES (
      TG_OP,
      TG_TABLE_NAME,
      1,
      extract(epoch from clock_timestamp() - statement_timestamp()),
      NOW()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. REQUIRED TABLES FOR HOOKS
-- =============================================================================

-- User activity log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Security log table
CREATE TABLE IF NOT EXISTS public.security_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  details jsonb,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Webhook log table
CREATE TABLE IF NOT EXISTS public.webhook_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  payload jsonb,
  response_status integer,
  response_body text,
  created_at timestamp with time zone DEFAULT NOW()
);

-- Performance log table
CREATE TABLE IF NOT EXISTS public.performance_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  operation text NOT NULL,
  table_name text NOT NULL,
  record_count integer,
  execution_time numeric,
  created_at timestamp with time zone DEFAULT NOW()
);

-- =============================================================================
-- 9. CONFIGURATION
-- =============================================================================

-- Set webhook URL (replace with your actual webhook URL)
-- ALTER DATABASE postgres SET app.webhook_url = 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/';

-- Enable Row Level Security on log tables
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only admins can read logs)
CREATE POLICY "Admin access to logs" ON public.user_activity_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Repeat for other log tables...

-- =============================================================================
-- 10. USAGE EXAMPLES
-- =============================================================================

/*
-- Apply hooks to your tables:

-- For user profiles
CREATE TRIGGER validate_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_profile();

-- For content moderation
CREATE TRIGGER moderate_posts_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION moderate_content();

-- For activity tracking
CREATE TRIGGER track_user_activity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.important_table
  FOR EACH ROW
  EXECUTE FUNCTION log_user_activity();

-- For security monitoring
CREATE TRIGGER security_audit_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION log_security_event();
*/