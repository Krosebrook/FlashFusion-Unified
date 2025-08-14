-- Security Fixes for Supabase Database
-- This script addresses RLS policy issues and auth configuration problems

-- =============================================================================
-- PART 1: Fix Row Level Security (RLS) Policies
-- Remove anonymous access and enforce proper authentication
-- =============================================================================

-- Drop existing permissive policies that allow anonymous access
-- Note: Replace with your actual policy names if different

-- Order Items Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;
DROP POLICY IF EXISTS "Public read access" ON public.order_items;

-- Create secure RLS policies for order_items
CREATE POLICY "Users can view their own order items"
ON public.order_items FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own order items"
ON public.order_items FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own order items"
ON public.order_items FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Orders Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Public read access" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Platform Products Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.platform_products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.platform_products;
DROP POLICY IF EXISTS "Public read access" ON public.platform_products;

CREATE POLICY "Authenticated users can view platform products"
ON public.platform_products FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify platform products"
ON public.platform_products FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Products Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Public read access" ON public.products;

CREATE POLICY "Users can view products from their stores"
ON public.products FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Product is public/published
    (published = true AND status = 'active')
    OR 
    -- User owns the store
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = products.store_id 
      AND stores.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Store owners can manage their products"
ON public.products FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Profiles Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public read access" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL AND id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() IS NOT NULL AND id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND id = auth.uid());

-- Stores Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.stores;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.stores;
DROP POLICY IF EXISTS "Public read access" ON public.stores;

CREATE POLICY "Users can view active stores"
ON public.stores FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (status = 'active' OR owner_id = auth.uid())
);

CREATE POLICY "Users can create their own stores"
ON public.stores FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Store owners can update their stores"
ON public.stores FOR UPDATE
USING (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Study Sessions Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.study_sessions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.study_sessions;
DROP POLICY IF EXISTS "Public read access" ON public.study_sessions;

CREATE POLICY "Users can view their own study sessions"
ON public.study_sessions FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can create their own study sessions"
ON public.study_sessions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own study sessions"
ON public.study_sessions FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- User Activity Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.user_activity;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_activity;
DROP POLICY IF EXISTS "Public read access" ON public.user_activity;

CREATE POLICY "Users can view their own activity"
ON public.user_activity FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can create their own activity records"
ON public.user_activity FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- User Favorites Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.user_favorites;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_favorites;
DROP POLICY IF EXISTS "Public read access" ON public.user_favorites;

CREATE POLICY "Users can view their own favorites"
ON public.user_favorites FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can manage their own favorites"
ON public.user_favorites FOR ALL
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- User Preferences Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.user_preferences;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_preferences;
DROP POLICY IF EXISTS "Public read access" ON public.user_preferences;

CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences FOR ALL
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- User Roles Table
DROP POLICY IF EXISTS "Allow anonymous access" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Public read access" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Only admins can manage user roles"
ON public.user_roles FOR ALL
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- =============================================================================
-- PART 2: Ensure RLS is enabled on all tables
-- =============================================================================

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PART 3: Create helper functions for common checks
-- =============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a store
CREATE OR REPLACE FUNCTION auth.owns_store(store_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.stores 
    WHERE id = store_id 
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PART 4: Create secure default policies for future tables
-- =============================================================================

-- Template for secure table creation
COMMENT ON SCHEMA public IS 'Default security template: All new tables should have RLS enabled and require authentication';

-- =============================================================================
-- PART 5: Fix Function Search Path Security Issues
-- =============================================================================

-- Fix update_user_preferences_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix usage_tracking.log_usage function (if exists)
CREATE OR REPLACE FUNCTION usage_tracking.log_usage(
    p_user_id UUID,
    p_feature TEXT,
    p_action TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
SECURITY DEFINER
SET search_path = usage_tracking, public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO usage_tracking.logs (user_id, feature, action, metadata, created_at)
    VALUES (p_user_id, p_feature, p_action, p_metadata, NOW());
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist, skip silently
        NULL;
END;
$$;

-- Fix usage_tracking.reset_meters function (if exists)
CREATE OR REPLACE FUNCTION usage_tracking.reset_meters()
RETURNS void
SECURITY DEFINER
SET search_path = usage_tracking, public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    -- Reset daily meters at midnight
    UPDATE usage_tracking.daily_usage 
    SET count = 0, last_reset = NOW()
    WHERE DATE(last_reset) < CURRENT_DATE;
    
    -- Reset monthly meters at month start
    UPDATE usage_tracking.monthly_usage 
    SET count = 0, last_reset = NOW()
    WHERE DATE_TRUNC('month', last_reset) < DATE_TRUNC('month', CURRENT_DATE);
EXCEPTION
    WHEN undefined_table THEN
        -- Tables don't exist, skip silently
        NULL;
END;
$$;

-- =============================================================================
-- PART 6: Enhanced Security for Design and Flashcard Tables
-- =============================================================================

-- Design Comments
DROP POLICY IF EXISTS "Users can manage their own comments" ON public.design_comments;
CREATE POLICY "Authenticated users can manage their own comments" ON public.design_comments
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Design History
DROP POLICY IF EXISTS "Users can manage their own design history" ON public.design_history;
CREATE POLICY "Authenticated users can manage their own design history" ON public.design_history
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Design Shares
DROP POLICY IF EXISTS "Users can manage their own shares" ON public.design_shares;
CREATE POLICY "Authenticated users can manage their own shares" ON public.design_shares
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Design Templates - More restrictive
DROP POLICY IF EXISTS "Users can manage their own templates" ON public.design_templates;
DROP POLICY IF EXISTS "Users can view all templates" ON public.design_templates;

CREATE POLICY "Users can manage their own templates" ON public.design_templates
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated users can view public templates" ON public.design_templates
FOR SELECT USING (auth.uid() IS NOT NULL AND (is_public = true OR user_id = auth.uid()));

-- Decks - More restrictive
DROP POLICY IF EXISTS "Users can delete own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can manage own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can update own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can view accessible decks" ON public.decks;
DROP POLICY IF EXISTS "Users can view own decks" ON public.decks;

CREATE POLICY "Authenticated users can manage their own decks" ON public.decks
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Flashcards - More restrictive
DROP POLICY IF EXISTS "Users can manage flashcards in their own decks" ON public.flashcards;
DROP POLICY IF EXISTS "Users can view flashcards in accessible decks" ON public.flashcards;

CREATE POLICY "Users can manage flashcards in their own decks" ON public.flashcards
FOR ALL USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
        SELECT 1 FROM public.decks 
        WHERE decks.id = flashcards.deck_id AND decks.user_id = auth.uid()
    )
);

-- Flashcard Performance
DROP POLICY IF EXISTS "Users can manage own performance" ON public.flashcard_performance;
CREATE POLICY "Authenticated users can manage own performance" ON public.flashcard_performance
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Notifications
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Authenticated users can manage their own notifications" ON public.notifications
FOR ALL USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =============================================================================
-- PART 7: Revoke Anonymous Permissions
-- =============================================================================

-- Revoke all permissions from anonymous users
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Grant minimal necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check that RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'order_items', 'orders', 'platform_products', 'products', 
    'profiles', 'stores', 'study_sessions', 'user_activity', 
    'user_favorites', 'user_preferences', 'user_roles',
    'decks', 'flashcards', 'design_templates', 'design_comments',
    'design_history', 'design_shares', 'flashcard_performance', 'notifications'
  );

-- Check existing policies
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
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;