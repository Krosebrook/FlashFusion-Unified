-- =============================================================================
-- FLASHFUSION QUICK SCHEMA IMPORT
-- =============================================================================
-- Copy this ENTIRE content and paste into Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'guest')),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  api_calls_used integer DEFAULT 0,
  api_calls_limit integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
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

-- Create AI usage logs
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text,
  total_tokens integer,
  cost_usd numeric(10,6),
  created_at timestamp with time zone DEFAULT now()
);

-- Create deployments table
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL,
  url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'ready', 'error')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.profiles (user_id, email, full_name, role) 
VALUES 
  (gen_random_uuid(), 'admin@flashfusion.co', 'FlashFusion Admin', 'admin'),
  (gen_random_uuid(), 'user@flashfusion.co', 'Test User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Test query
SELECT 'FlashFusion Schema Created Successfully!' as message, count(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('profiles', 'projects', 'ai_usage_logs', 'deployments');