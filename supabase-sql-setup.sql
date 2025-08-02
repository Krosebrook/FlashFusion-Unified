-- =============================================================================
-- FlashFusion Supabase SQL Editor Setup Commands
-- =============================================================================
-- Copy and paste these commands in Supabase SQL Editor

-- 1. Test database connection
SELECT 'FlashFusion Database Connected!' as status, now() as timestamp;

-- 2. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;

-- 3. Check current database info
SELECT 
  current_database() as database_name,
  current_user as current_user,
  inet_server_addr() as server_ip,
  version() as postgres_version;

-- 4. Create FlashFusion schema
CREATE SCHEMA IF NOT EXISTS flashfusion;

-- 5. Create test table to verify permissions
CREATE TABLE IF NOT EXISTS flashfusion.test_connection (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text DEFAULT 'FlashFusion connected successfully!',
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Insert test data
INSERT INTO flashfusion.test_connection (message) 
VALUES ('API test from FlashFusion setup');

-- 7. Test basic query
SELECT * FROM flashfusion.test_connection ORDER BY created_at DESC LIMIT 5;

-- 8. Create user profiles table (enhanced)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'guest')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  email_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 9. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = user_id);

-- 11. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 13. Create FlashFusion projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  settings jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 14. Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- 15. Create API logs table
CREATE TABLE IF NOT EXISTS public.api_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service text NOT NULL, -- 'openai', 'anthropic', 'google', etc.
  endpoint text,
  method text,
  status_code integer,
  tokens_used integer,
  cost_usd numeric(10,6),
  request_data jsonb,
  response_data jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- 16. Enable RLS on API logs
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own API logs" ON public.api_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 17. Create webhook logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL, -- 'zapier', 'notion', 'github', etc.
  event_type text,
  payload jsonb,
  status text DEFAULT 'received',
  processed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- 18. Test final connection and permissions
SELECT 
  'FlashFusion Setup Complete!' as message,
  count(*) as test_records
FROM flashfusion.test_connection;

-- 19. Show all created tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'flashfusion')
ORDER BY schemaname, tablename;

-- 20. Cleanup test data (optional)
-- DROP TABLE IF EXISTS flashfusion.test_connection;
-- DROP SCHEMA IF EXISTS flashfusion CASCADE;