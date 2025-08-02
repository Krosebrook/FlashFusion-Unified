-- 🚀 FLASHFUSION UNIFIED DATABASE TABLES
-- Complete table creation script for Supabase
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════
-- 1. CORE USER MANAGEMENT
-- ═══════════════════════════════════════════════════════════════

-- Drop existing tables (careful in production!)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.subscription_history CASCADE;
DROP TABLE IF EXISTS public.billing_transactions CASCADE;
DROP TABLE IF EXISTS public.webhook_logs CASCADE;
DROP TABLE IF EXISTS public.webhooks CASCADE;
DROP TABLE IF EXISTS public.deployment_logs CASCADE;
DROP TABLE IF EXISTS public.deployments CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.ai_usage_logs CASCADE;
DROP TABLE IF EXISTS public.project_files CASCADE;
DROP TABLE IF EXISTS public.project_collaborators CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- User Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest', 'developer', 'enterprise')),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise', 'custom')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
  api_calls_used integer DEFAULT 0,
  api_calls_limit integer DEFAULT 1000,
  storage_used_mb integer DEFAULT 0,
  storage_limit_mb integer DEFAULT 500,
  stripe_customer_id text,
  stripe_subscription_id text,
  github_username text,
  notion_workspace_id text,
  preferences jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. PROJECT MANAGEMENT
-- ═══════════════════════════════════════════════════════════════

-- Projects
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  readme text,
  framework text CHECK (framework IN ('react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'gatsby', 'remix', 'astro', 'custom')),
  category text CHECK (category IN ('web', 'mobile', 'desktop', 'api', 'fullstack', 'ai', 'blockchain', 'iot', 'other')),
  tags text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted', 'suspended')),
  visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'unlisted', 'team')),
  github_repo text,
  vercel_project_id text,
  netlify_site_id text,
  live_url text,
  preview_url text,
  thumbnail_url text,
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  star_count integer DEFAULT 0,
  fork_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  last_deployed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Project Collaborators
CREATE TABLE public.project_collaborators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  permissions jsonb DEFAULT '{"read": true, "write": false, "delete": false, "deploy": false}',
  invited_by uuid REFERENCES public.profiles(id),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Project Files
CREATE TABLE public.project_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  path text NOT NULL,
  name text NOT NULL,
  content text,
  type text CHECK (type IN ('file', 'directory')),
  size_bytes integer,
  mime_type text,
  encoding text DEFAULT 'utf-8',
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, path)
);

-- ═══════════════════════════════════════════════════════════════
-- 3. AI & USAGE TRACKING
-- ═══════════════════════════════════════════════════════════════

-- AI Usage Logs
CREATE TABLE public.ai_usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  provider text NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'cohere', 'huggingface', 'replicate', 'custom')),
  model text NOT NULL,
  action text CHECK (action IN ('completion', 'chat', 'embedding', 'image', 'audio', 'code', 'analysis')),
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  cost_usd numeric(10,6) DEFAULT 0,
  latency_ms integer,
  status text DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'canceled')),
  error_message text,
  request_data jsonb DEFAULT '{}',
  response_data jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- AI Conversations
CREATE TABLE public.ai_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text,
  model text NOT NULL,
  messages jsonb DEFAULT '[]',
  total_tokens integer DEFAULT 0,
  total_cost numeric(10,6) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. DEPLOYMENT & INFRASTRUCTURE
-- ═══════════════════════════════════════════════════════════════

-- Deployments
CREATE TABLE public.deployments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('vercel', 'netlify', 'cloudflare', 'aws', 'gcp', 'azure', 'heroku', 'railway', 'custom')),
  environment text DEFAULT 'production' CHECK (environment IN ('production', 'preview', 'development')),
  url text,
  domain text,
  commit_sha text,
  commit_message text,
  branch text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deploying', 'ready', 'error', 'canceled')),
  error_message text,
  build_time_seconds integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Deployment Logs
CREATE TABLE public.deployment_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id uuid REFERENCES public.deployments(id) ON DELETE CASCADE NOT NULL,
  level text DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warning', 'error')),
  message text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- ═══════════════════════════════════════════════════════════════
-- 5. WEBHOOKS & INTEGRATIONS
-- ═══════════════════════════════════════════════════════════════

-- Webhooks
CREATE TABLE public.webhooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  secret text,
  events text[] DEFAULT '{}',
  active boolean DEFAULT true,
  headers jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  last_triggered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Webhook Logs
CREATE TABLE public.webhook_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id uuid REFERENCES public.webhooks(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  status_code integer,
  request_body jsonb DEFAULT '{}',
  response_body jsonb DEFAULT '{}',
  error_message text,
  duration_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 6. BILLING & SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════════

-- Billing Transactions
CREATE TABLE public.billing_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_invoice_id text,
  amount_usd numeric(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  type text CHECK (type IN ('subscription', 'one_time', 'usage', 'refund')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Subscription History
CREATE TABLE public.subscription_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tier text NOT NULL,
  status text NOT NULL,
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone,
  reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. TEAM COLLABORATION
-- ═══════════════════════════════════════════════════════════════

-- Teams
CREATE TABLE public.teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  avatar_url text,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_tier text DEFAULT 'free',
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Team Members
CREATE TABLE public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  permissions jsonb DEFAULT '{}',
  invited_by uuid REFERENCES public.profiles(id),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════
-- 8. API KEYS & SECURITY
-- ═══════════════════════════════════════════════════════════════

-- API Keys
CREATE TABLE public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  key_hash text UNIQUE NOT NULL,
  key_prefix text NOT NULL,
  permissions jsonb DEFAULT '{"read": true, "write": false}',
  rate_limit integer DEFAULT 1000,
  expires_at timestamp with time zone,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  revoked_at timestamp with time zone
);

-- ═══════════════════════════════════════════════════════════════
-- 9. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════

-- Notifications
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'project', 'billing', 'security')),
  title text NOT NULL,
  message text,
  action_url text,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 10. INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════

-- Profile indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_tier, subscription_status);

-- Project indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_visibility ON public.projects(visibility);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- AI usage indexes
CREATE INDEX idx_ai_usage_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_project_id ON public.ai_usage_logs(project_id);
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_provider_model ON public.ai_usage_logs(provider, model);

-- Deployment indexes
CREATE INDEX idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX idx_deployments_user_id ON public.deployments(user_id);
CREATE INDEX idx_deployments_status ON public.deployments(status);
CREATE INDEX idx_deployments_created_at ON public.deployments(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 11. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- 12. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR role = 'admin');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    visibility = 'public' OR
    id IN (SELECT project_id FROM public.project_collaborators WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════
-- 13. FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_collaborators_updated_at BEFORE UPDATE ON public.project_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 14. SAMPLE DATA
-- ═══════════════════════════════════════════════════════════════

-- Insert sample profiles
INSERT INTO public.profiles (email, full_name, role, subscription_tier) VALUES
  ('demo@flashfusion.ai', 'Demo User', 'user', 'free'),
  ('pro@flashfusion.ai', 'Pro User', 'user', 'pro'),
  ('admin@flashfusion.ai', 'Admin User', 'admin', 'enterprise')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- Insert sample projects
INSERT INTO public.projects (user_id, name, slug, description, framework, visibility)
SELECT 
  p.id,
  'Sample ' || p.email || ' Project',
  'sample-' || split_part(p.email, '@', 1) || '-project',
  'A demo project showcasing FlashFusion capabilities',
  'react',
  CASE WHEN p.role = 'admin' THEN 'public' ELSE 'private' END
FROM public.profiles p
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 15. FINAL STATUS CHECK
-- ═══════════════════════════════════════════════════════════════

SELECT 
  '✅ FlashFusion Database Created Successfully!' as status,
  COUNT(DISTINCT table_name) as tables_created,
  COUNT(DISTINCT constraint_name) as constraints_added
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK');