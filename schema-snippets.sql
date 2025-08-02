-- =============================================================================
-- FLASHFUSION DATABASE CODE SNIPPETS
-- =============================================================================
-- Quick SQL snippets for common FlashFusion operations

-- =============================================================================
-- 1. USER MANAGEMENT SNIPPETS
-- =============================================================================

-- Get user profile with settings
SELECT 
  p.*,
  s.theme,
  s.language,
  s.notifications
FROM public.profiles p
LEFT JOIN public.user_settings s ON p.id = s.user_id
WHERE p.user_id = auth.uid();

-- Update user profile
UPDATE public.profiles 
SET 
  full_name = 'New Name',
  bio = 'Updated bio',
  updated_at = now()
WHERE user_id = auth.uid();

-- Get user's API usage summary
SELECT 
  provider,
  COUNT(*) as requests_count,
  SUM(total_tokens) as total_tokens,
  SUM(cost_usd) as total_cost,
  AVG(response_time_ms) as avg_response_time
FROM public.ai_usage_logs 
WHERE user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
GROUP BY provider
ORDER BY total_cost DESC;

-- =============================================================================
-- 2. PROJECT MANAGEMENT SNIPPETS
-- =============================================================================

-- Get user's projects with collaboration info
SELECT 
  p.*,
  COUNT(pc.id) as collaborator_count,
  COUNT(d.id) as deployment_count
FROM public.projects p
LEFT JOIN public.project_collaborators pc ON p.id = pc.project_id
LEFT JOIN public.deployments d ON p.id = d.project_id
WHERE p.user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
GROUP BY p.id, p.name, p.description, p.created_at
ORDER BY p.updated_at DESC;

-- Create new project
INSERT INTO public.projects (
  user_id, 
  name, 
  description, 
  framework, 
  template,
  slug,
  config
) VALUES (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
  'My New Project',
  'Project description',
  'react',
  'dashboard',
  'my-new-project',
  '{"theme": "dark", "typescript": true}'::jsonb
) RETURNING *;

-- Add collaborator to project
INSERT INTO public.project_collaborators (
  project_id,
  user_id,
  role,
  permissions
) VALUES (
  'project-uuid-here',
  (SELECT id FROM public.profiles WHERE email = 'collaborator@example.com'),
  'editor',
  '["read", "write", "deploy"]'::jsonb
);

-- =============================================================================
-- 3. AI USAGE TRACKING SNIPPETS
-- =============================================================================

-- Log AI API usage
INSERT INTO public.ai_usage_logs (
  user_id,
  project_id,
  provider,
  model,
  endpoint,
  prompt_tokens,
  completion_tokens,
  total_tokens,
  cost_usd,
  response_time_ms,
  status_code
) VALUES (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
  'project-uuid-here',
  'openai',
  'gpt-4',
  '/chat/completions',
  50,
  100,
  150,
  0.003,
  1200,
  200
);

-- Get monthly AI usage by user
SELECT 
  DATE_TRUNC('month', created_at) as month,
  provider,
  SUM(total_tokens) as tokens_used,
  SUM(cost_usd) as total_cost,
  COUNT(*) as request_count
FROM public.ai_usage_logs
WHERE user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', created_at), provider
ORDER BY month DESC, total_cost DESC;

-- Check user's remaining API quota
SELECT 
  p.api_calls_limit,
  p.api_calls_used,
  (p.api_calls_limit - p.api_calls_used) as remaining_calls,
  sp.name as plan_name
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id
LEFT JOIN public.subscription_plans sp ON s.plan_id = sp.id
WHERE p.user_id = auth.uid();

-- =============================================================================
-- 4. CODE GENERATION SNIPPETS
-- =============================================================================

-- Save generated code
INSERT INTO public.code_generations (
  user_id,
  project_id,
  prompt,
  language,
  framework,
  generated_code,
  provider,
  model,
  tokens_used,
  cost_usd
) VALUES (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
  'project-uuid-here',
  'Create a React button component',
  'javascript',
  'react',
  'export default function Button({ children, onClick }) { return <button onClick={onClick}>{children}</button>; }',
  'openai',
  'gpt-4',
  85,
  0.0017
) RETURNING *;

-- Get user's code generation history
SELECT 
  id,
  prompt,
  language,
  framework,
  LEFT(generated_code, 100) as code_preview,
  provider,
  rating,
  created_at
FROM public.code_generations
WHERE user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
ORDER BY created_at DESC
LIMIT 20;

-- Get popular code templates
SELECT 
  ct.*,
  p.full_name as created_by_name
FROM public.code_templates ct
LEFT JOIN public.profiles p ON ct.created_by = p.id
WHERE ct.is_public = true
ORDER BY ct.usage_count DESC, ct.rating_avg DESC
LIMIT 10;

-- =============================================================================
-- 5. DEPLOYMENT SNIPPETS
-- =============================================================================

-- Log deployment
INSERT INTO public.deployments (
  project_id,
  user_id,
  provider,
  deployment_id,
  url,
  branch,
  commit_hash,
  commit_message,
  status
) VALUES (
  'project-uuid-here',
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
  'vercel',
  'dpl_abc123',
  'https://my-project.vercel.app',
  'main',
  'abc123def456',
  'Update homepage design',
  'building'
) RETURNING *;

-- Update deployment status
UPDATE public.deployments 
SET 
  status = 'ready',
  completed_at = now(),
  build_time_seconds = 45,
  bundle_size_bytes = 2048576
WHERE id = 'deployment-uuid-here';

-- Get project deployment history
SELECT 
  d.*,
  p.name as project_name
FROM public.deployments d
JOIN public.projects p ON d.project_id = p.id
WHERE d.project_id = 'project-uuid-here'
ORDER BY d.created_at DESC
LIMIT 10;

-- =============================================================================
-- 6. ANALYTICS SNIPPETS
-- =============================================================================

-- Update daily stats
INSERT INTO public.daily_stats (
  date,
  user_id,
  api_calls,
  tokens_used,
  cost_usd,
  projects_created,
  deployments,
  active_time_minutes,
  sessions
) VALUES (
  CURRENT_DATE,
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
  25,
  3500,
  0.07,
  1,
  3,
  180,
  5
) ON CONFLICT (date, user_id) 
DO UPDATE SET
  api_calls = EXCLUDED.api_calls,
  tokens_used = EXCLUDED.tokens_used,
  cost_usd = EXCLUDED.cost_usd,
  projects_created = EXCLUDED.projects_created,
  deployments = EXCLUDED.deployments,
  active_time_minutes = EXCLUDED.active_time_minutes,
  sessions = EXCLUDED.sessions;

-- Get user analytics dashboard data
SELECT 
  DATE_TRUNC('day', ds.date) as date,
  SUM(ds.api_calls) as total_api_calls,
  SUM(ds.tokens_used) as total_tokens,
  SUM(ds.cost_usd) as total_cost,
  SUM(ds.projects_created) as projects_created,
  SUM(ds.deployments) as deployments,
  AVG(ds.active_time_minutes) as avg_active_time
FROM public.daily_stats ds
WHERE ds.user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND ds.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', ds.date)
ORDER BY date DESC;

-- Track feature usage
INSERT INTO public.feature_usage (
  user_id,
  feature_name,
  metadata
) VALUES (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
  'code_generation',
  '{"language": "javascript", "framework": "react"}'::jsonb
) ON CONFLICT (user_id, feature_name)
DO UPDATE SET
  usage_count = feature_usage.usage_count + 1,
  last_used_at = now(),
  updated_at = now();

-- =============================================================================
-- 7. BILLING SNIPPETS
-- =============================================================================

-- Get user's current subscription
SELECT 
  p.subscription_tier,
  sp.display_name,
  sp.price_monthly_usd,
  s.status,
  s.current_period_end,
  sp.api_calls_limit,
  sp.projects_limit,
  sp.storage_limit_gb
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id
LEFT JOIN public.subscription_plans sp ON s.plan_id = sp.id
WHERE p.user_id = auth.uid();

-- Create subscription
INSERT INTO public.subscriptions (
  user_id,
  plan_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  current_period_start,
  current_period_end
) VALUES (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
  (SELECT id FROM public.subscription_plans WHERE name = 'pro'),
  'sub_abc123',
  'cus_def456',
  'active',
  now(),
  now() + INTERVAL '1 month'
);

-- Log payment
INSERT INTO public.payments (
  user_id,
  subscription_id,
  stripe_payment_intent_id,
  amount_usd,
  status,
  description
) VALUES (
  (SELECT id FROM public.profiles WHERE user_id = auth.uid()),
  'subscription-uuid-here',
  'pi_abc123',
  19.99,
  'succeeded',
  'Pro Plan Monthly Subscription'
);

-- =============================================================================
-- 8. WEBHOOK HANDLING SNIPPETS
-- =============================================================================

-- Log incoming webhook
INSERT INTO public.webhook_logs (
  integration_id,
  provider,
  event_type,
  headers,
  payload,
  status
) VALUES (
  'integration-uuid-here',
  'github',
  'push',
  '{"x-github-event": "push", "x-hub-signature": "sha256=..."}'::jsonb,
  '{"ref": "refs/heads/main", "commits": [...]}'::jsonb,
  'received'
) RETURNING *;

-- Update webhook processing status
UPDATE public.webhook_logs 
SET 
  status = 'completed',
  processed_at = now()
WHERE id = 'webhook-log-uuid-here';

-- Get failed webhooks for retry
SELECT *
FROM public.webhook_logs
WHERE status = 'failed'
  AND retry_count < 3
  AND created_at > now() - INTERVAL '24 hours'
ORDER BY created_at ASC;

-- =============================================================================
-- 9. ADMIN QUERIES
-- =============================================================================

-- Get platform statistics
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT pr.id) as total_projects,
  COUNT(DISTINCT d.id) as total_deployments,
  SUM(aul.cost_usd) as total_ai_cost,
  COUNT(DISTINCT s.id) as active_subscriptions
FROM public.profiles p
LEFT JOIN public.projects pr ON p.id = pr.user_id
LEFT JOIN public.deployments d ON pr.id = d.project_id
LEFT JOIN public.ai_usage_logs aul ON p.id = aul.user_id
LEFT JOIN public.subscriptions s ON p.id = s.user_id AND s.status = 'active';

-- Get top users by AI usage
SELECT 
  p.email,
  p.full_name,
  p.subscription_tier,
  COUNT(aul.id) as api_calls,
  SUM(aul.total_tokens) as total_tokens,
  SUM(aul.cost_usd) as total_cost
FROM public.profiles p
JOIN public.ai_usage_logs aul ON p.id = aul.user_id
WHERE aul.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p.id, p.email, p.full_name, p.subscription_tier
ORDER BY total_cost DESC
LIMIT 10;

-- Get system health metrics
SELECT 
  'webhooks' as metric,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM public.webhook_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours'

UNION ALL

SELECT 
  'deployments' as metric,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'ready') as successful,
  COUNT(*) FILTER (WHERE status = 'error') as failed
FROM public.deployments
WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours';

-- =============================================================================
-- 10. CLEANUP AND MAINTENANCE
-- =============================================================================

-- Clean old webhook logs (keep last 30 days)
DELETE FROM public.webhook_logs 
WHERE created_at < now() - INTERVAL '30 days';

-- Clean old AI usage logs (keep last 90 days for free users, 1 year for paid)
DELETE FROM public.ai_usage_logs 
WHERE created_at < now() - INTERVAL '90 days'
  AND user_id IN (
    SELECT p.id FROM public.profiles p 
    WHERE p.subscription_tier = 'free'
  );

-- Update usage counters
UPDATE public.profiles 
SET api_calls_used = (
  SELECT COUNT(*)
  FROM public.ai_usage_logs aul
  WHERE aul.user_id = profiles.id
    AND aul.created_at >= DATE_TRUNC('month', CURRENT_DATE)
);

-- Vacuum and analyze for performance
VACUUM ANALYZE public.ai_usage_logs;
VACUUM ANALYZE public.deployments;
VACUUM ANALYZE public.webhook_logs;