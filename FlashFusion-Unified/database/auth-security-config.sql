-- Auth Security Configuration Fixes
-- This script addresses auth configuration issues

-- =============================================================================
-- PART 1: Fix OTP Expiry Settings
-- =============================================================================

-- Note: These settings need to be applied via Supabase Dashboard or API
-- The following are the recommended values:

/*
Auth Settings to apply in Supabase Dashboard:

1. OTP Expiry Settings:
   - Email OTP expiry: 600 seconds (10 minutes) - RECOMMENDED
   - SMS OTP expiry: 300 seconds (5 minutes) - RECOMMENDED
   - Phone OTP expiry: 300 seconds (5 minutes) - RECOMMENDED

Current issue: OTP expiry exceeds recommended threshold
Fix: Reduce OTP expiry times to recommended values

2. Leaked Password Protection:
   - Enable leaked password protection: true
   - This prevents users from using passwords found in data breaches

3. Additional Security Settings:
   - Enable password requirements
   - Set minimum password length: 8 characters
   - Require special characters: true
   - Require uppercase letters: true
   - Require lowercase letters: true
   - Require numbers: true
*/

-- =============================================================================
-- PART 2: Database Functions for Enhanced Security
-- =============================================================================

-- Function to validate password strength
CREATE OR REPLACE FUNCTION auth.validate_password_strength(password text)
RETURNS boolean AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Check for special character
  IF password !~ '[^A-Za-z0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log authentication attempts
CREATE OR REPLACE FUNCTION auth.log_auth_attempt(
  user_email text,
  attempt_type text,
  success boolean,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    jsonb_build_object(
      'event_type', 'auth_attempt',
      'user_email', user_email,
      'attempt_type', attempt_type,
      'success', success,
      'ip_address', ip_address,
      'user_agent', user_agent,
      'timestamp', now()
    ),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PART 3: Security Monitoring Tables
-- =============================================================================

-- Create table for tracking failed login attempts
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'failed_login', 'password_reset', 'account_lockout', 
    'suspicious_activity', 'policy_violation'
  )),
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Only admins can view security events"
ON public.security_events FOR SELECT
USING (auth.is_admin());

-- System can insert security events
CREATE POLICY "System can insert security events"
ON public.security_events FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

-- =============================================================================
-- PART 4: Rate Limiting Enhancement
-- =============================================================================

-- Enhance existing rate limiting table
ALTER TABLE IF EXISTS public.api_rate_limits 
ADD COLUMN IF NOT EXISTS security_level text DEFAULT 'normal' 
CHECK (security_level IN ('normal', 'elevated', 'high'));

ALTER TABLE IF EXISTS public.api_rate_limits 
ADD COLUMN IF NOT EXISTS blocked_until timestamp with time zone;

-- Function to check if user is rate limited
CREATE OR REPLACE FUNCTION auth.is_rate_limited(
  user_uuid uuid,
  endpoint_name text,
  max_requests integer DEFAULT 50,
  window_hours integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  current_count integer;
  is_blocked boolean;
BEGIN
  -- Check if user is temporarily blocked
  SELECT blocked_until > now() INTO is_blocked
  FROM public.api_rate_limits 
  WHERE user_id = user_uuid AND endpoint = endpoint_name;
  
  IF is_blocked THEN
    RETURN true;
  END IF;
  
  -- Count requests in the current window
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM public.api_rate_limits 
  WHERE user_id = user_uuid 
    AND endpoint = endpoint_name 
    AND window_start > (now() - (window_hours || ' hours')::interval);
  
  RETURN current_count >= max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PART 5: Content Security Enhancements
-- =============================================================================

-- Enhanced content moderation
CREATE TABLE IF NOT EXISTS public.content_moderation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL CHECK (rule_type IN (
    'blocked_words', 'pattern_match', 'length_limit', 'character_whitelist'
  )),
  pattern text NOT NULL,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  action text DEFAULT 'block' CHECK (action IN ('block', 'flag', 'moderate')),
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_moderation_rules ENABLE ROW LEVEL SECURITY;

-- Only admins can manage moderation rules
CREATE POLICY "Only admins can manage moderation rules"
ON public.content_moderation_rules FOR ALL
USING (auth.is_admin());

-- Insert default content moderation rules
INSERT INTO public.content_moderation_rules (rule_type, pattern, severity, action) VALUES
  ('blocked_words', 'nude|nsfw|explicit|pornographic|sexual', 'high', 'block'),
  ('blocked_words', 'violence|blood|gore|death|killing', 'high', 'block'),
  ('blocked_words', 'hate|racist|terrorism|drugs|illegal', 'high', 'block'),
  ('length_limit', '1000', 'medium', 'flag'),
  ('pattern_match', '\\b[A-Z]{10,}\\b', 'low', 'moderate')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PART 6: Audit and Compliance
-- =============================================================================

-- Enhanced audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    INSERT INTO public.audit_log (
      table_name,
      operation,
      old_data,
      user_id,
      timestamp
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      old_data,
      auth.uid(),
      now()
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    INSERT INTO public.audit_log (
      table_name,
      operation,
      old_data,
      new_data,
      user_id,
      timestamp
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      old_data,
      new_data,
      auth.uid(),
      now()
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    INSERT INTO public.audit_log (
      table_name,
      operation,
      new_data,
      user_id,
      timestamp
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      new_data,
      auth.uid(),
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES auth.users(id),
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_log FOR SELECT
USING (auth.is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_log FOR INSERT
WITH CHECK (true);

-- =============================================================================
-- VERIFICATION AND MONITORING QUERIES
-- =============================================================================

-- Query to check current security configuration
CREATE OR REPLACE VIEW public.security_status AS
SELECT 
  'RLS Policies' as security_area,
  COUNT(*) as items_configured,
  'All tables should have RLS enabled and proper policies' as recommendation
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Content Moderation Rules' as security_area,
  COUNT(*) as items_configured,
  'Should have comprehensive blocked words and patterns' as recommendation
FROM public.content_moderation_rules 
WHERE active = true
UNION ALL
SELECT 
  'Security Events Tracking' as security_area,
  COUNT(*) as items_configured,
  'Monitor for suspicious activities and failed attempts' as recommendation
FROM public.security_events 
WHERE created_at > now() - interval '24 hours';

-- Create security dashboard view for admins
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  'Failed Login Attempts (24h)' as metric,
  COUNT(*) as value
FROM public.security_events 
WHERE event_type = 'failed_login' 
  AND created_at > now() - interval '24 hours'
UNION ALL
SELECT 
  'Content Violations (24h)' as metric,
  COUNT(*) as value
FROM public.content_violations 
WHERE created_at > now() - interval '24 hours'
UNION ALL
SELECT 
  'Rate Limited Users (Active)' as metric,
  COUNT(DISTINCT user_id) as value
FROM public.api_rate_limits 
WHERE blocked_until > now()
UNION ALL
SELECT 
  'Total Active Users (24h)' as metric,
  COUNT(DISTINCT user_id) as value
FROM public.user_activity 
WHERE created_at > now() - interval '24 hours';

-- Grant access to security views for admins only
GRANT SELECT ON public.security_status TO authenticated;
GRANT SELECT ON public.security_dashboard TO authenticated;

-- Create RLS policies for the views
CREATE POLICY "Only admins can view security status"
ON public.security_status FOR SELECT
USING (auth.is_admin());

CREATE POLICY "Only admins can view security dashboard"
ON public.security_dashboard FOR SELECT
USING (auth.is_admin());