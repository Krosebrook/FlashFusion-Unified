-- FlashFusion RLS Performance Optimization
-- Fixes auth.uid() performance issues and policy conflicts

-- =============================================================================
-- PART 1: Drop All Existing Policies to Prevent Conflicts
-- =============================================================================

-- API Rate Limits
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.api_rate_limits;
DROP POLICY IF EXISTS "Authenticated users can view own rate limits" ON public.api_rate_limits;

-- Audit Log
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated admins can view audit logs" ON public.audit_log;

-- Decks (multiple conflicting policies)
DROP POLICY IF EXISTS "Users can view accessible decks" ON public.decks;
DROP POLICY IF EXISTS "Users can manage own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can delete own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can update own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can view own decks" ON public.decks;
DROP POLICY IF EXISTS "Authenticated users can manage their own decks" ON public.decks;

-- Design Comments
DROP POLICY IF EXISTS "Users can manage their own comments" ON public.design_comments;
DROP POLICY IF EXISTS "Authenticated users can manage their own comments" ON public.design_comments;

-- Design History
DROP POLICY IF EXISTS "Users can manage their own design history" ON public.design_history;
DROP POLICY IF EXISTS "Authenticated users can manage their own design history" ON public.design_history;

-- Design Shares
DROP POLICY IF EXISTS "Users can manage their own shares" ON public.design_shares;
DROP POLICY IF EXISTS "Authenticated users can manage their own shares" ON public.design_shares;

-- Design Templates (multiple conflicting policies)
DROP POLICY IF EXISTS "Users can manage their own templates" ON public.design_templates;
DROP POLICY IF EXISTS "Users can view all templates" ON public.design_templates;
DROP POLICY IF EXISTS "Authenticated users can view public templates" ON public.design_templates;

-- Flashcard Performance
DROP POLICY IF EXISTS "Users can manage own performance" ON public.flashcard_performance;
DROP POLICY IF EXISTS "Authenticated users can manage own performance" ON public.flashcard_performance;

-- Flashcards (multiple conflicting policies)
DROP POLICY IF EXISTS "Users can view flashcards in accessible decks" ON public.flashcards;
DROP POLICY IF EXISTS "Users can manage flashcards in their own decks" ON public.flashcards;

-- Notifications
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can manage their own notifications" ON public.notifications;

-- Order Items
DROP POLICY IF EXISTS "Users can manage their order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can update their own order items" ON public.order_items;

-- Orders
DROP POLICY IF EXISTS "Users can manage their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Platform Products
DROP POLICY IF EXISTS "Users can manage their platform products" ON public.platform_products;
DROP POLICY IF EXISTS "Authenticated users can view platform products" ON public.platform_products;
DROP POLICY IF EXISTS "Only admins can modify platform products" ON public.platform_products;

-- Products
DROP POLICY IF EXISTS "Users can manage their own products" ON public.products;
DROP POLICY IF EXISTS "Users can view products from their stores" ON public.products;
DROP POLICY IF EXISTS "Store owners can manage their products" ON public.products;

-- Profiles (multiple conflicting policies)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view limited public profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

-- Stores
DROP POLICY IF EXISTS "Users can manage their own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can view active stores" ON public.stores;
DROP POLICY IF EXISTS "Users can create their own stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can update their stores" ON public.stores;

-- Study Sessions
DROP POLICY IF EXISTS "Users can manage their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can create their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;

-- User Activity
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can create their own activity records" ON public.user_activity;
DROP POLICY IF EXISTS "System can insert user activity" ON public.user_activity;

-- User Favorites
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;

-- User Preferences
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;

-- User Roles (multiple conflicting policies)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;

-- =============================================================================
-- PART 2: Create Optimized RLS Policies with (select auth.uid())
-- =============================================================================

-- API Rate Limits
CREATE POLICY "api_rate_limits_policy" ON public.api_rate_limits
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Audit Log - Admin only
CREATE POLICY "audit_log_admin_policy" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = (select auth.uid()) AND role = 'admin'
        )
    );

-- System can insert audit logs
CREATE POLICY "audit_log_system_insert" ON public.audit_log
    FOR INSERT WITH CHECK (
        (select auth.role()) = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Decks - Single comprehensive policy
CREATE POLICY "decks_user_policy" ON public.decks
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Design Comments
CREATE POLICY "design_comments_policy" ON public.design_comments
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Design History
CREATE POLICY "design_history_policy" ON public.design_history
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Design Shares
CREATE POLICY "design_shares_policy" ON public.design_shares
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Design Templates - Separate policies for own vs public
CREATE POLICY "design_templates_own_policy" ON public.design_templates
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "design_templates_public_read" ON public.design_templates
    FOR SELECT USING (is_public = true AND (select auth.uid()) IS NOT NULL);

-- Flashcard Performance
CREATE POLICY "flashcard_performance_policy" ON public.flashcard_performance
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Flashcards - Single policy based on deck ownership
CREATE POLICY "flashcards_policy" ON public.flashcards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.decks 
            WHERE decks.id = flashcards.deck_id 
            AND decks.user_id = (select auth.uid())
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.decks 
            WHERE decks.id = flashcards.deck_id 
            AND decks.user_id = (select auth.uid())
        )
    );

-- Notifications
CREATE POLICY "notifications_policy" ON public.notifications
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Order Items - Based on order ownership
CREATE POLICY "order_items_policy" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = (select auth.uid())
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = (select auth.uid())
        )
    );

-- Orders
CREATE POLICY "orders_policy" ON public.orders
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Platform Products - Public read, admin write
CREATE POLICY "platform_products_read" ON public.platform_products
    FOR SELECT USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "platform_products_admin_write" ON public.platform_products
    FOR INSERT, UPDATE, DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = (select auth.uid()) AND role = 'admin'
        )
    );

-- Products - Based on store ownership
CREATE POLICY "products_read" ON public.products
    FOR SELECT USING (
        (select auth.uid()) IS NOT NULL AND (
            (published = true AND status = 'active') OR 
            EXISTS (
                SELECT 1 FROM public.stores 
                WHERE stores.id = products.store_id 
                AND stores.owner_id = (select auth.uid())
            )
        )
    );

CREATE POLICY "products_write" ON public.products
    FOR INSERT, UPDATE, DELETE USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id = (select auth.uid())
        )
    );

-- Profiles - Single comprehensive policy
CREATE POLICY "profiles_policy" ON public.profiles
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Stores - Owner management + public read for active stores
CREATE POLICY "stores_read" ON public.stores
    FOR SELECT USING (
        (select auth.uid()) IS NOT NULL AND 
        (status = 'active' OR owner_id = (select auth.uid()))
    );

CREATE POLICY "stores_write" ON public.stores
    FOR INSERT, UPDATE, DELETE USING ((select auth.uid()) = owner_id)
    WITH CHECK ((select auth.uid()) = owner_id);

-- Study Sessions
CREATE POLICY "study_sessions_policy" ON public.study_sessions
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- User Activity
CREATE POLICY "user_activity_read" ON public.user_activity
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "user_activity_insert" ON public.user_activity
    FOR INSERT WITH CHECK (
        (select auth.uid()) = user_id OR (select auth.role()) = 'service_role'
    );

-- User Favorites
CREATE POLICY "user_favorites_policy" ON public.user_favorites
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- User Preferences
CREATE POLICY "user_preferences_policy" ON public.user_preferences
    FOR ALL USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- User Roles - Separate read and admin policies
CREATE POLICY "user_roles_read_own" ON public.user_roles
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "user_roles_admin_manage" ON public.user_roles
    FOR INSERT, UPDATE, DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = (select auth.uid()) AND ur.role = 'admin'
        )
    );

-- =============================================================================
-- PART 3: Fix Function Search Path Issues
-- =============================================================================

-- Fix usage_tracking.log_usage function
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

-- Fix usage_tracking.reset_meters function
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
-- PART 4: Create Performance Indexes
-- =============================================================================

-- Indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_design_comments_user_id ON public.design_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_design_history_user_id ON public.design_history(user_id);
CREATE INDEX IF NOT EXISTS idx_design_shares_user_id ON public.design_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_design_templates_user_id ON public.design_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_design_templates_is_public ON public.design_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_flashcard_performance_user_id ON public.flashcard_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);

-- =============================================================================
-- PART 5: Verification Queries
-- =============================================================================

-- Check that all policies use (select auth.uid()) pattern
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'NEEDS_FIX'
        WHEN with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%' THEN 'NEEDS_FIX'
        ELSE 'OPTIMIZED'
    END as performance_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for duplicate policies
SELECT 
    schemaname,
    tablename,
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

-- Verify function search paths
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    CASE 
        WHEN pg_get_function_identity_arguments(p.oid) != '' 
        THEN p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')'
        ELSE p.proname || '()'
    END as function_signature,
    CASE 
        WHEN p.proconfig IS NOT NULL 
        THEN array_to_string(p.proconfig, ', ')
        ELSE 'No search_path set'
    END as search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'usage_tracking')
AND p.proname IN ('log_usage', 'reset_meters', 'update_user_preferences_updated_at')
ORDER BY n.nspname, p.proname;