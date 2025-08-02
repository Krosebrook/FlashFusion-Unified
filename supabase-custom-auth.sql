-- =============================================================================
-- FlashFusion Custom Access Control with JWT Email Authentication
-- =============================================================================
-- Run in Supabase SQL Editor to create custom auth system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. CUSTOM USER PROFILES TABLE
-- =============================================================================

-- Enhanced user profiles with role-based access
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  email_verified boolean DEFAULT false,
  email_verified_at timestamp with time zone,
  
  -- User information
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  
  -- Role and permissions
  role text DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'guest')),
  permissions jsonb DEFAULT '[]'::jsonb,
  custom_claims jsonb DEFAULT '{}'::jsonb,
  
  -- Status and security
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
  email_notifications boolean DEFAULT true,
  two_factor_enabled boolean DEFAULT false,
  
  -- Tracking
  last_login_at timestamp with time zone,
  login_count integer DEFAULT 0,
  failed_login_attempts integer DEFAULT 0,
  locked_at timestamp with time zone,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_username CHECK (username ~* '^[a-zA-Z0-9_-]{3,30}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);

-- =============================================================================
-- 2. EMAIL VERIFICATION SYSTEM
-- =============================================================================

-- Email verification tokens table
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  code text, -- 6-digit verification code
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT NOW()
);

-- =============================================================================
-- 3. CUSTOM JWT CLAIMS FUNCTION
-- =============================================================================

-- Function to generate custom JWT claims
CREATE OR REPLACE FUNCTION public.get_custom_claims(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile public.user_profiles%ROWTYPE;
  claims jsonb;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile
  FROM public.user_profiles
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;
  
  -- Build custom claims
  claims := jsonb_build_object(
    'role', user_profile.role,
    'email_verified', user_profile.email_verified,
    'username', user_profile.username,
    'display_name', user_profile.display_name,
    'permissions', user_profile.permissions,
    'status', user_profile.status,
    'last_login', user_profile.last_login_at,
    'custom_claims', user_profile.custom_claims
  );
  
  RETURN claims;
END;
$$;

-- =============================================================================
-- 4. ROLE-BASED PERMISSIONS SYSTEM
-- =============================================================================

-- Default permissions for each role
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL,
  permission text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT NOW(),
  
  UNIQUE(role, permission)
);

-- Insert default permissions
INSERT INTO public.role_permissions (role, permission, description) VALUES
-- Admin permissions
('admin', 'user:create', 'Create new users'),
('admin', 'user:read', 'Read user information'),
('admin', 'user:update', 'Update user information'),
('admin', 'user:delete', 'Delete users'),
('admin', 'content:create', 'Create content'),
('admin', 'content:read', 'Read all content'),
('admin', 'content:update', 'Update any content'),
('admin', 'content:delete', 'Delete any content'),
('admin', 'system:access', 'Access system settings'),
('admin', 'analytics:read', 'Read analytics data'),

-- Moderator permissions
('moderator', 'user:read', 'Read user information'),
('moderator', 'user:update', 'Update user information'),
('moderator', 'content:create', 'Create content'),
('moderator', 'content:read', 'Read all content'),
('moderator', 'content:update', 'Update content'),
('moderator', 'content:moderate', 'Moderate content'),
('moderator', 'analytics:read', 'Read analytics data'),

-- User permissions
('user', 'content:create', 'Create own content'),
('user', 'content:read', 'Read public content'),
('user', 'content:update:own', 'Update own content'),
('user', 'profile:read', 'Read own profile'),
('user', 'profile:update:own', 'Update own profile'),

-- Guest permissions
('guest', 'content:read:public', 'Read public content only')

ON CONFLICT (role, permission) DO NOTHING;

-- =============================================================================
-- 5. PERMISSION CHECK FUNCTIONS
-- =============================================================================

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  user_email text,
  required_permission text,
  resource_owner_email text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile public.user_profiles%ROWTYPE;
  has_permission boolean := false;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile
  FROM public.user_profiles
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user has the exact permission
  SELECT EXISTS(
    SELECT 1 FROM public.role_permissions
    WHERE role = user_profile.role 
    AND permission = required_permission
  ) INTO has_permission;
  
  IF has_permission THEN
    RETURN true;
  END IF;
  
  -- Check "own" resource permissions  
  IF required_permission LIKE '%:own' AND resource_owner_email IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.role_permissions
      WHERE role = user_profile.role 
      AND permission = required_permission
    ) INTO has_permission;
    
    -- Only grant if user owns the resource
    RETURN has_permission AND (user_email = resource_owner_email);
  END IF;
  
  RETURN false;
END;
$$;

-- Function to require permission (throws error if not granted)
CREATE OR REPLACE FUNCTION public.require_permission(
  user_email text,
  required_permission text,
  resource_owner_email text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.user_has_permission(user_email, required_permission, resource_owner_email) THEN
    RAISE EXCEPTION 'Access denied: Missing permission %', required_permission;
  END IF;
END;
$$;

-- =============================================================================
-- 6. EMAIL VERIFICATION FUNCTIONS
-- =============================================================================

-- Generate email verification token
CREATE OR REPLACE FUNCTION public.generate_email_verification_token(
  p_user_id uuid,
  p_email text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  verification_token text;
  verification_code text;
BEGIN
  -- Generate secure token and code
  verification_token := encode(gen_random_bytes(32), 'hex');
  verification_code := LPAD(floor(random() * 1000000)::text, 6, '0');
  
  -- Insert verification record
  INSERT INTO public.email_verification_tokens (
    user_id, email, token, code, expires_at
  ) VALUES (
    p_user_id, p_email, verification_token, verification_code, NOW() + INTERVAL '1 hour'
  );
  
  RETURN verification_token;
END;
$$;

-- Verify email with token
CREATE OR REPLACE FUNCTION public.verify_email_token(
  p_token text
)
RETURNS jsonb
LANGUAGE plpgsql  
SECURITY DEFINER
AS $$
DECLARE
  token_record public.email_verification_tokens%ROWTYPE;
  result jsonb;
BEGIN
  -- Find and validate token
  SELECT * INTO token_record
  FROM public.email_verification_tokens
  WHERE token = p_token
  AND expires_at > NOW()
  AND used_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired token');
  END IF;
  
  -- Mark token as used
  UPDATE public.email_verification_tokens
  SET used_at = NOW()
  WHERE id = token_record.id;
  
  -- Mark email as verified
  UPDATE public.user_profiles
  SET 
    email_verified = true,
    email_verified_at = NOW(),
    updated_at = NOW()
  WHERE id = token_record.user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'email', token_record.email,
    'verified_at', NOW()
  );
END;
$$;

-- =============================================================================
-- 7. USER MANAGEMENT FUNCTIONS
-- =============================================================================

-- Create or update user profile
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_auth_user_id uuid,
  p_email text,
  p_username text DEFAULT NULL,
  p_display_name text DEFAULT NULL,
  p_role text DEFAULT 'user'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Insert or update profile
  INSERT INTO public.user_profiles (
    auth_user_id, email, username, display_name, role
  ) VALUES (
    p_auth_user_id, p_email, p_username, p_display_name, p_role
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    username = COALESCE(EXCLUDED.username, user_profiles.username),
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
    updated_at = NOW()
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$;

-- Update user role (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(
  admin_email text,
  target_email text,
  new_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin permission
  PERFORM public.require_permission(admin_email, 'user:update');
  
  -- Validate role
  IF new_role NOT IN ('admin', 'moderator', 'user', 'guest') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Update role
  UPDATE public.user_profiles
  SET 
    role = new_role,
    updated_at = NOW()
  WHERE email = target_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', target_email;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('User %s role updated to %s', target_email, new_role)
  );
END;
$$;

-- =============================================================================
-- 8. AUTHENTICATION TRIGGERS
-- =============================================================================

-- Trigger to create profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id uuid;
  verification_token text;
BEGIN
  -- Create user profile
  profile_id := public.upsert_user_profile(
    NEW.id,
    NEW.email,
    NULL, -- username will be set later
    NEW.raw_user_meta_data->>'display_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  -- Generate email verification token
  verification_token := public.generate_email_verification_token(profile_id, NEW.email);
  
  -- TODO: Send verification email here
  -- You can use a webhook or external service
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on user profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (
    auth.email() = email OR
    public.user_has_permission(auth.email(), 'user:read')
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (
    auth.email() = email OR
    public.user_has_permission(auth.email(), 'user:update')
  );

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.user_profiles
  FOR DELETE USING (
    public.user_has_permission(auth.email(), 'user:delete')
  );

-- Enable RLS on other tables
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 10. UTILITY VIEWS
-- =============================================================================

-- View for user information with permissions
CREATE OR REPLACE VIEW public.user_info AS
SELECT 
  p.id,
  p.email,
  p.username,
  p.display_name,
  p.role,
  p.email_verified,
  p.status,
  p.last_login_at,
  p.created_at,
  array_agg(rp.permission) as permissions
FROM public.user_profiles p
LEFT JOIN public.role_permissions rp ON rp.role = p.role
WHERE p.status = 'active'
GROUP BY p.id, p.email, p.username, p.display_name, p.role, 
         p.email_verified, p.status, p.last_login_at, p.created_at;

-- =============================================================================
-- 11. TEST DATA (OPTIONAL)
-- =============================================================================

-- Insert test users (uncomment to create test data)
/*
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'admin@flashfusion.co', '{"role": "admin", "display_name": "Admin User"}', NOW(), NOW()),
  (gen_random_uuid(), 'mod@flashfusion.co', '{"role": "moderator", "display_name": "Moderator User"}', NOW(), NOW()),
  (gen_random_uuid(), 'user@flashfusion.co', '{"role": "user", "display_name": "Regular User"}', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
*/