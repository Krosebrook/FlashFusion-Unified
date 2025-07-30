-- Fix Supabase Security Issues - Migration
-- Applied: 2025-07-29
-- Addresses: Function Search Path Mutable and Security Definer View issues

-- 1. Fix Function Search Path Issues
-- Set search_path for all functions to prevent path injection attacks

-- Fix next_auth.uid function (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'next_auth')) THEN
        ALTER FUNCTION next_auth.uid() SET search_path = 'next_auth', 'public';
    END IF;
END
$$;

-- Fix public functions (if they exist)
DO $$
BEGIN
    -- insert_sample_data
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'insert_sample_data' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.insert_sample_data() SET search_path = 'public';
    END IF;
    
    -- update_updated_at_column
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
    END IF;
    
    -- handle_new_user
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
    END IF;
    
    -- get_user_role
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_role' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.get_user_role(uuid) SET search_path = 'public';
    END IF;
    
    -- is_owner
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_owner' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.is_owner(uuid) SET search_path = 'public';
    END IF;
    
    -- set_user_role
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_user_role' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.set_user_role(uuid, text) SET search_path = 'public';
    END IF;
    
    -- debug_auth
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'debug_auth' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.debug_auth() SET search_path = 'public';
    END IF;
    
    -- audit_trigger
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'audit_trigger' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.audit_trigger() SET search_path = 'public';
    END IF;
    
    -- cleanup_audit_logs
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_audit_logs' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.cleanup_audit_logs() SET search_path = 'public';
    END IF;
END
$$;

-- 2. Fix Security Definer View Issue
-- Replace the security definer view with a secure alternative
DROP VIEW IF EXISTS public.rls_policies;

-- Create a secure version without SECURITY DEFINER
CREATE OR REPLACE VIEW public.rls_policies 
WITH (security_invoker = true) AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public';

-- 3. Create secure helper functions
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = 'public'
AS $$
    SELECT auth.uid();
$$;

-- 4. Ensure proper RLS is enabled on critical tables
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'auth_%'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        EXCEPTION WHEN OTHERS THEN
            -- Table might not exist or already have RLS enabled
            NULL;
        END;
    END LOOP;
END
$$;