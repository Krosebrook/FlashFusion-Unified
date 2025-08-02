# FlashFusion Database Schema Import Guide

## 📄 Files Created

1. **`flashfusion-schema.sql`** - Complete database schema
2. **`sample-data.csv`** - Sample data for testing
3. **`schema-import-guide.md`** - This guide

## 🚀 Import Methods

### Method 1: Supabase SQL Editor (Recommended)
1. Go to: https://supabase.com/dashboard/project/gcqfqzhgludrzkfajljp/sql
2. Copy entire `flashfusion-schema.sql` content
3. Paste and click "Run"
4. Wait for completion message

### Method 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Run the schema
supabase db push --db-url "postgresql://postgres:[password]@db.gcqfqzhgludrzkfajljp.supabase.co:5432/postgres"
```

### Method 3: Direct PostgreSQL
```bash
# Connect to your Supabase database
psql "postgresql://postgres:[password]@db.gcqfqzhgludrzkfajljp.supabase.co:5432/postgres"

# Run the schema file
\i flashfusion-schema.sql
```

## 📊 Schema Overview

### Core Tables (12)
- **profiles** - User management and roles
- **user_settings** - User preferences
- **projects** - FlashFusion projects
- **project_collaborators** - Team collaboration
- **ai_providers** - AI service providers
- **user_api_keys** - Encrypted API keys
- **ai_usage_logs** - AI usage tracking
- **code_generations** - Generated code history
- **code_templates** - Code template library
- **deployments** - Deployment history
- **integrations** - Third-party integrations
- **webhook_logs** - Webhook processing

### Business Tables (3)
- **subscription_plans** - Pricing tiers
- **subscriptions** - User subscriptions
- **payments** - Payment history

### Analytics Tables (2)
- **daily_stats** - Daily usage metrics
- **feature_usage** - Feature usage tracking

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Users can only access their own data
- ✅ Public projects have read access
- ✅ Collaborators have appropriate permissions

### Data Protection
- ✅ API keys are encrypted
- ✅ Sensitive data is protected
- ✅ User isolation enforced

## 📈 Performance Optimizations

### Indexes Created
- User lookup indexes
- Project filtering indexes  
- AI usage tracking indexes
- Deployment history indexes
- Full-text search ready

### Query Optimization
- Foreign key relationships
- Efficient joins
- Partitioning ready for large datasets

## 🧪 Testing the Schema

### 1. Run Schema Import
```sql
-- Verify tables created
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Test User Creation
```sql
-- Create test user profile
INSERT INTO public.profiles (user_id, email, full_name, role) 
VALUES (gen_random_uuid(), 'test@flashfusion.co', 'Test User', 'user');
```

### 3. Test Project Creation
```sql
-- Create test project
INSERT INTO public.projects (user_id, name, description, framework) 
VALUES (
  (SELECT user_id FROM public.profiles WHERE email = 'test@flashfusion.co'),
  'My First Project',
  'A test project for FlashFusion',
  'react'
);
```

### 4. Test AI Usage Log
```sql
-- Log AI usage
INSERT INTO public.ai_usage_logs (user_id, provider, model, total_tokens, cost_usd)
VALUES (
  (SELECT id FROM public.profiles WHERE email = 'test@flashfusion.co'),
  'openai',
  'gpt-4',
  150,
  0.003
);
```

## 🔧 Customization Options

### Adding New Tables
```sql
-- Example: Add a new feature table
CREATE TABLE public.your_new_table (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- your columns here
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.your_new_table ENABLE ROW LEVEL SECURITY;

-- Add policy
CREATE POLICY "Users access own data" ON public.your_new_table
  FOR ALL USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
```

### Modifying Existing Tables
```sql
-- Add new column
ALTER TABLE public.profiles 
ADD COLUMN new_field text;

-- Add constraint
ALTER TABLE public.projects 
ADD CONSTRAINT check_status 
CHECK (status IN ('active', 'archived', 'deleted', 'new_status'));
```

## 📋 Post-Import Checklist

- [ ] Schema imported successfully
- [ ] All tables created (17 total)
- [ ] RLS policies active
- [ ] Indexes created
- [ ] Triggers working
- [ ] Sample data inserted
- [ ] API connection tested
- [ ] User signup flow tested

## 🔍 Troubleshooting

### Common Issues

**Permission Errors:**
- Ensure you're using the service role key
- Check RLS policies are correct

**Schema Conflicts:**
- Drop existing tables if needed: `DROP TABLE IF EXISTS table_name CASCADE;`
- Clear all data: Use Supabase dashboard reset

**Performance Issues:**
- Check indexes are created: `\di` in psql
- Verify query plans: `EXPLAIN ANALYZE SELECT ...`

### Support
- Supabase docs: https://supabase.com/docs
- FlashFusion schema issues: Check the generated SQL file
- Database monitoring: Use Supabase dashboard insights

## 🎯 Next Steps

1. **Import the schema** using Method 1 above
2. **Test the connection** with your FlashFusion app
3. **Customize as needed** for your specific requirements
4. **Monitor performance** as you add data
5. **Set up backups** for production use