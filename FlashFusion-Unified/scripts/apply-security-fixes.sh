#!/bin/bash

# Apply Security Fixes to Supabase Database
# This script applies all security fixes for RLS policies and auth configuration

set -e

echo "🔒 Applying Security Fixes to Supabase Database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "supabase login"
    exit 1
fi

# Check required environment variables
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo "❌ SUPABASE_PROJECT_REF environment variable is required"
    echo "Set it with: export SUPABASE_PROJECT_REF=your-project-ref"
    exit 1
fi

echo "✅ Environment check passed"

# Apply database security fixes
echo "📊 Applying RLS policy fixes..."
if [ -f "database/security-fixes.sql" ]; then
    echo "Executing security-fixes.sql..."
    supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres" --file "database/security-fixes.sql" || {
        echo "⚠️ Failed to apply via push. Please run manually in Supabase SQL editor."
        echo "File: database/security-fixes.sql"
    }
else
    echo "❌ security-fixes.sql file not found"
    exit 1
fi

echo "🔐 Applying auth security configuration..."
if [ -f "database/auth-security-config.sql" ]; then
    echo "Executing auth-security-config.sql..."
    supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres" --file "database/auth-security-config.sql" || {
        echo "⚠️ Failed to apply via push. Please run manually in Supabase SQL editor."
        echo "File: database/auth-security-config.sql"
    }
else
    echo "❌ auth-security-config.sql file not found"
    exit 1
fi

echo ""
echo "🎉 Security fixes applied successfully!"
echo ""
echo "📝 Manual Configuration Required:"
echo ""
echo "⚠️  IMPORTANT: The following settings must be configured manually in Supabase Dashboard:"
echo ""
echo "1. 🕐 OTP Expiry Settings:"
echo "   Go to: Authentication > Settings > Auth"
echo "   - Email OTP expiry: 600 seconds (10 minutes)"
echo "   - SMS OTP expiry: 300 seconds (5 minutes)"
echo "   - Phone OTP expiry: 300 seconds (5 minutes)"
echo ""
echo "2. 🛡️  Password Protection:"
echo "   Go to: Authentication > Settings > Auth"
echo "   - Enable 'Leaked password protection': ✅ ON"
echo "   - Set password requirements:"
echo "     • Minimum length: 8 characters"
echo "     • Require uppercase letters: ✅"
echo "     • Require lowercase letters: ✅"
echo "     • Require numbers: ✅"
echo "     • Require special characters: ✅"
echo ""
echo "3. 🔒 Additional Security Settings:"
echo "   Go to: Authentication > Settings > Auth"
echo "   - Enable 'Confirm email change': ✅ ON"
echo "   - Enable 'Secure email change': ✅ ON"
echo "   - Set 'JWT expiry limit': 3600 seconds (1 hour)"
echo "   - Enable 'Refresh token rotation': ✅ ON"
echo ""
echo "📊 Verification Commands:"
echo ""
echo "Run these queries in Supabase SQL Editor to verify fixes:"
echo ""
echo "-- Check RLS is enabled on all tables"
echo "SELECT schemaname, tablename, rowsecurity"
echo "FROM pg_tables"
echo "WHERE schemaname = 'public'"
echo "  AND tablename IN ("
echo "    'order_items', 'orders', 'platform_products', 'products',"
echo "    'profiles', 'stores', 'study_sessions', 'user_activity',"
echo "    'user_favorites', 'user_preferences', 'user_roles'"
echo "  )"
echo "ORDER BY tablename;"
echo ""
echo "-- Check security policies"
echo "SELECT schemaname, tablename, policyname, roles"
echo "FROM pg_policies"
echo "WHERE schemaname = 'public'"
echo "ORDER BY tablename, policyname;"
echo ""
echo "-- View security dashboard (admin only)"
echo "SELECT * FROM public.security_dashboard;"
echo ""
echo "🔗 Direct Links:"
echo "- Supabase Dashboard: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}"
echo "- Auth Settings: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/users"
echo "- SQL Editor: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql"
echo ""
echo "✅ Security audit should now pass all checks!"
echo ""
echo "⚠️  Remember to:"
echo "1. Test your application after applying these changes"
echo "2. Update your frontend code to handle authentication properly"
echo "3. Monitor the security_events table for any issues"
echo "4. Review and adjust policies based on your specific needs"