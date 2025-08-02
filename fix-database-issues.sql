-- Fix FlashFusion Database Issues
-- Run this in Supabase SQL Editor

-- 1. Drop and recreate tables with proper constraints
DROP TABLE IF EXISTS public.deployments CASCADE;
DROP TABLE IF EXISTS public.ai_usage_logs CASCADE;  
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create profiles table with proper constraints
CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid UNIQUE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  api_calls_used integer DEFAULT 0,
  api_calls_limit integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create projects table
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  framework text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create AI usage logs
CREATE TABLE public.ai_usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text,
  total_tokens integer,
  cost_usd numeric(10,6),
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Create deployments table
CREATE TABLE public.deployments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL,
  url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'ready', 'error')),
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Insert sample data
INSERT INTO public.profiles (user_id, email, full_name, role) VALUES
  (gen_random_uuid(), 'demo@flashfusion.co', 'FlashFusion Demo', 'user'),
  (gen_random_uuid(), 'admin@flashfusion.co', 'FlashFusion Admin', 'admin')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- 7. Insert sample project
INSERT INTO public.projects (user_id, name, description, framework) 
SELECT 
  p.id,
  'Sample FlashFusion Project',
  'A demo project showcasing FlashFusion capabilities',
  'react'
FROM public.profiles p 
WHERE p.email = 'demo@flashfusion.co'
ON CONFLICT DO NOTHING;

-- 8. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- 9. Create basic policies
CREATE POLICY "Enable read for service role" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable read for service role" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable read for service role" ON public.ai_usage_logs FOR SELECT USING (true);
CREATE POLICY "Enable read for service role" ON public.deployments FOR SELECT USING (true);

-- 10. Test the setup
SELECT 
  'Database fixed!' as status,
  count(*) as profile_count
FROM public.profiles;