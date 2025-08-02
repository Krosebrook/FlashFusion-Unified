-- =============================================================================
-- FLASHFUSION COMPLETE DATABASE SCHEMA
-- =============================================================================
-- Version: 2.0.0
-- Created: 2025-01-15
-- Description: Complete database schema for FlashFusion AI development platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;

-- =============================================================================
-- 1. USER MANAGEMENT TABLES
-- =============================================================================

-- Enhanced user profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  website text,
  location text,
  
  -- Role and permissions
  role text DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'guest', 'premium')),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  permissions jsonb DEFAULT '[]'::jsonb,
  
  -- Status and verification
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  two_factor_enabled boolean DEFAULT false,
  
  -- Usage tracking
  api_calls_used integer DEFAULT 0,
  api_calls_limit integer DEFAULT 1000,
  storage_used bigint DEFAULT 0, -- in bytes
  storage_limit bigint DEFAULT 1073741824, -- 1GB default
  
  -- Timestamps
  last_login_at timestamp with time zone,
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  notifications jsonb DEFAULT '{
    "email": true,
    "push": true,
    "marketing": false,
    "security": true
  }'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 2. PROJECT MANAGEMENT TABLES
-- =============================================================================

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  slug text UNIQUE,
  
  -- Project configuration
  framework text, -- 'react', 'vue', 'angular', 'vanilla', etc.
  template text, -- 'dashboard', 'ecommerce', 'blog', etc.
  repository_url text,
  deployment_url text,
  preview_url text,
  
  -- Project status
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted', 'building', 'deployed')),
  visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'team')),
  
  -- Configuration and metadata
  config jsonb DEFAULT '{}'::jsonb,
  environment_vars jsonb DEFAULT '{}'::jsonb,
  build_settings jsonb DEFAULT '{}'::jsonb,
  
  -- Analytics
  views_count integer DEFAULT 0,
  forks_count integer DEFAULT 0,
  stars_count integer DEFAULT 0,
  
  -- Timestamps
  last_deployed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Project collaborators
CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  permissions jsonb DEFAULT '[]'::jsonb,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- =============================================================================
-- 3. AI SERVICES TABLES
-- =============================================================================

-- AI service providers
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL, -- 'openai', 'anthropic', 'google', etc.
  display_name text NOT NULL,
  api_endpoint text,
  documentation_url text,
  pricing_info jsonb DEFAULT '{}'::jsonb,
  available_models jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
  created_at timestamp with time zone DEFAULT now()
);

-- User API keys for different services
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL, -- references ai_providers.name
  key_name text, -- user-friendly name
  api_key_encrypted text NOT NULL, -- encrypted API key
  key_preview text, -- last 4 characters for display
  
  -- Usage and limits
  usage_count integer DEFAULT 0,
  usage_limit integer,
  cost_limit_usd numeric(10,2),
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'revoked')),
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, provider, key_name)
);

-- AI API usage logs
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text,
  endpoint text,
  
  -- Request details
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  
  -- Cost tracking
  cost_usd numeric(10,6),
  billing_unit text, -- 'tokens', 'requests', 'characters'
  
  -- Performance
  response_time_ms integer,
  status_code integer,
  
  -- Content (optional, for debugging)
  request_hash text, -- hash of request for deduplication
  error_message text,
  
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 4. CODE GENERATION TABLES
-- =============================================================================

-- Generated code snippets
CREATE TABLE IF NOT EXISTS public.code_generations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Generation details
  prompt text NOT NULL,
  language text, -- 'javascript', 'python', 'html', etc.
  framework text, -- 'react', 'vue', 'express', etc.
  generated_code text NOT NULL,
  
  -- AI provider used
  provider text,
  model text,
  tokens_used integer,
  cost_usd numeric(10,6),
  
  -- Quality metrics
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  
  -- Usage
  usage_count integer DEFAULT 0,
  is_public boolean DEFAULT false,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Code templates library
CREATE TABLE IF NOT EXISTS public.code_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text, -- 'component', 'function', 'page', 'api', etc.
  language text,
  framework text,
  
  -- Template content
  template_code text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb, -- variables to replace
  instructions text,
  
  -- Metadata
  tags text[],
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Attribution
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_official boolean DEFAULT false,
  is_public boolean DEFAULT true,
  
  -- Usage stats
  usage_count integer DEFAULT 0,
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 5. DEPLOYMENT TABLES
-- =============================================================================

-- Deployment providers
CREATE TABLE IF NOT EXISTS public.deployment_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL, -- 'vercel', 'netlify', 'aws', etc.
  display_name text NOT NULL,
  webhook_url text,
  api_endpoint text,
  documentation_url text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

-- Project deployments
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Deployment details
  provider text NOT NULL,
  deployment_id text, -- provider's deployment ID
  url text,
  branch text DEFAULT 'main',
  commit_hash text,
  commit_message text,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'ready', 'error', 'cancelled')),
  build_log text,
  error_message text,
  
  -- Performance
  build_time_seconds integer,
  bundle_size_bytes bigint,
  
  -- Timestamps
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 6. INTEGRATION TABLES
-- =============================================================================

-- Third-party integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Integration details
  provider text NOT NULL, -- 'github', 'notion', 'slack', etc.
  integration_name text,
  external_id text, -- ID in the external system
  
  -- Configuration
  config jsonb DEFAULT '{}'::jsonb,
  credentials_encrypted text, -- encrypted access tokens
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'expired')),
  last_sync_at timestamp with time zone,
  error_message text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, provider, external_id)
);

-- Webhook logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id uuid REFERENCES public.integrations(id) ON DELETE SET NULL,
  
  -- Webhook details
  provider text NOT NULL,
  event_type text,
  webhook_id text,
  
  -- Request data
  headers jsonb,
  payload jsonb,
  signature text,
  
  -- Processing
  status text DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'failed')),
  processed_at timestamp with time zone,
  error_message text,
  retry_count integer DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 7. BILLING AND SUBSCRIPTIONS
-- =============================================================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  
  -- Pricing
  price_monthly_usd numeric(10,2),
  price_yearly_usd numeric(10,2),
  
  -- Limits
  api_calls_limit integer,
  projects_limit integer,
  storage_limit_gb integer,
  collaborators_limit integer,
  
  -- Features
  features jsonb DEFAULT '[]'::jsonb,
  
  -- Status
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id),
  
  -- Subscription details
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'incomplete')),
  
  -- Billing
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Payment history
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  -- Payment details
  stripe_payment_intent_id text UNIQUE,
  amount_usd numeric(10,2),
  currency text DEFAULT 'usd',
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  
  -- Metadata
  description text,
  receipt_url text,
  
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 8. ANALYTICS AND REPORTING
-- =============================================================================

-- Daily usage stats
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Usage metrics
  api_calls integer DEFAULT 0,
  tokens_used bigint DEFAULT 0,
  cost_usd numeric(10,6) DEFAULT 0,
  projects_created integer DEFAULT 0,
  deployments integer DEFAULT 0,
  
  -- Engagement metrics
  active_time_minutes integer DEFAULT 0,
  sessions integer DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(date, user_id)
);

-- Feature usage tracking
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  
  -- Usage details
  usage_count integer DEFAULT 1,
  last_used_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, feature_name)
);

-- =============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- =============================================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

-- AI usage logs indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON public.ai_usage_logs(provider);

-- Code generations indexes
CREATE INDEX IF NOT EXISTS idx_code_generations_user_id ON public.code_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_code_generations_project_id ON public.code_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_code_generations_language ON public.code_generations(language);
CREATE INDEX IF NOT EXISTS idx_code_generations_public ON public.code_generations(is_public) WHERE is_public = true;

-- Deployments indexes
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON public.deployments(created_at DESC);

-- =============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies  
CREATE POLICY "Users can read own projects" ON public.projects
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.project_collaborators 
      WHERE project_id = projects.id AND user_id = (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- Public read for public projects
CREATE POLICY "Public projects are readable" ON public.projects
  FOR SELECT USING (visibility = 'public');

-- Similar policies for other tables...
CREATE POLICY "Users can read own API keys" ON public.user_api_keys
  FOR ALL USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can read own AI usage" ON public.ai_usage_logs
  FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- =============================================================================
-- 11. TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES ((SELECT id FROM public.profiles WHERE user_id = NEW.id));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_settings
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 12. INITIAL DATA SEEDING
-- =============================================================================

-- Insert default AI providers
INSERT INTO public.ai_providers (name, display_name, api_endpoint, available_models) VALUES
('openai', 'OpenAI', 'https://api.openai.com/v1', '["gpt-4", "gpt-3.5-turbo", "dall-e-3"]'::jsonb),
('anthropic', 'Anthropic', 'https://api.anthropic.com/v1', '["claude-3-5-sonnet-20241022", "claude-3-opus-20240229"]'::jsonb),
('google', 'Google AI', 'https://generativelanguage.googleapis.com/v1', '["gemini-pro", "gemini-pro-vision"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly_usd, api_calls_limit, projects_limit, storage_limit_gb) VALUES
('free', 'Free', 'Perfect for getting started', 0, 1000, 3, 1),
('pro', 'Pro', 'For serious developers', 19.99, 10000, 25, 10),
('enterprise', 'Enterprise', 'For teams and organizations', 99.99, 100000, 100, 100)
ON CONFLICT (name) DO NOTHING;

-- Insert default code templates
INSERT INTO public.code_templates (name, description, category, language, framework, template_code, is_official) VALUES
('React Component', 'Basic React functional component', 'component', 'javascript', 'react', 
'import React from ''react'';

export default function {{componentName}}() {
  return (
    <div>
      <h1>{{title}}</h1>
    </div>
  );
}', true),
('Express API Route', 'Express.js API route handler', 'api', 'javascript', 'express',
'const express = require(''express'');
const router = express.Router();

router.{{method}}(''{{path}}'', async (req, res) => {
  try {
    // Your code here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;', true)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- SCHEMA COMPLETE
-- =============================================================================

-- Verify schema creation
SELECT 
  'FlashFusion Schema Created Successfully!' as message,
  count(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name NOT LIKE 'pg_%';