-- Simple FlashFusion Database Test
-- Run this in Supabase SQL Editor to test and fix issues

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'projects', 'ai_usage_logs', 'deployments')
ORDER BY table_name;

-- 2. Create basic tables if they don't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid UNIQUE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  name text NOT NULL,
  description text,
  framework text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Insert test data
INSERT INTO public.profiles (user_id, email, full_name, role) 
VALUES 
  (gen_random_uuid(), 'test@flashfusion.co', 'Test User', 'user'),
  (gen_random_uuid(), 'admin@flashfusion.co', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 4. Test query
SELECT 
  p.email,
  p.full_name,
  p.role,
  COUNT(pr.id) as project_count
FROM public.profiles p
LEFT JOIN public.projects pr ON p.id = pr.user_id
GROUP BY p.id, p.email, p.full_name, p.role
ORDER BY p.created_at DESC;

-- 5. Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'projects');

-- 6. Success message
SELECT 'FlashFusion Database Test Complete!' as status;