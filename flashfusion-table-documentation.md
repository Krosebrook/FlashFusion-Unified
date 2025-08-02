# 📊 FlashFusion Database Tables Documentation

## Overview
Complete database schema for FlashFusion Unified platform with 16 core tables supporting user management, projects, AI services, deployments, billing, and team collaboration.

## 🗂️ Table Structure

### 1. **profiles** - User Management
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Links to auth.users |
| email | text | Unique email |
| username | text | Unique username |
| full_name | text | Display name |
| role | text | user/admin/developer/enterprise |
| subscription_tier | text | free/starter/pro/enterprise |
| api_calls_used | integer | API usage counter |
| api_calls_limit | integer | API rate limit |
| stripe_customer_id | text | Stripe integration |
| preferences | jsonb | User settings |

### 2. **projects** - Project Management
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| name | text | Project name |
| slug | text | URL-friendly identifier |
| framework | text | react/vue/angular/nextjs |
| visibility | text | public/private/team |
| github_repo | text | GitHub integration |
| vercel_project_id | text | Vercel deployment |
| live_url | text | Production URL |

### 3. **ai_usage_logs** - AI Service Tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User reference |
| provider | text | openai/anthropic/google |
| model | text | Model identifier |
| prompt_tokens | integer | Input token count |
| completion_tokens | integer | Output token count |
| cost_usd | numeric | Usage cost |
| status | text | success/error/timeout |

### 4. **deployments** - Deployment Tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | Project reference |
| provider | text | vercel/netlify/aws |
| environment | text | production/preview/dev |
| url | text | Deployment URL |
| status | text | pending/building/ready/error |
| build_time_seconds | integer | Build duration |

### 5. **webhooks** - Integration Management
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| name | text | Webhook name |
| url | text | Endpoint URL |
| events | text[] | Event triggers |
| active | boolean | Enable/disable |
| secret | text | Signing secret |

### 6. **billing_transactions** - Payment Tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Customer reference |
| stripe_payment_intent_id | text | Stripe reference |
| amount_usd | numeric | Transaction amount |
| status | text | pending/succeeded/failed |
| type | text | subscription/one_time/refund |

### 7. **teams** - Team Collaboration
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Team name |
| slug | text | URL identifier |
| owner_id | uuid | Team owner |
| subscription_tier | text | Team plan |

### 8. **api_keys** - API Key Management
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| name | text | Key description |
| key_hash | text | Hashed API key |
| permissions | jsonb | Access control |
| rate_limit | integer | Request limit |
| expires_at | timestamp | Expiration date |

### 9. **notifications** - User Notifications
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Recipient |
| type | text | info/success/warning/error |
| title | text | Notification title |
| message | text | Content |
| read | boolean | Read status |

### 10. **project_collaborators** - Access Control
| Column | Type | Description |
|--------|------|-------------|
| project_id | uuid | Project reference |
| user_id | uuid | Collaborator |
| role | text | owner/admin/editor/viewer |
| permissions | jsonb | Granular permissions |

### 11. **project_files** - File Storage
| Column | Type | Description |
|--------|------|-------------|
| project_id | uuid | Project reference |
| path | text | File path |
| content | text | File content |
| type | text | file/directory |
| size_bytes | integer | File size |

### 12. **ai_conversations** - Chat History
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | User reference |
| title | text | Conversation title |
| messages | jsonb | Message array |
| total_tokens | integer | Token usage |
| total_cost | numeric | Conversation cost |

### 13. **deployment_logs** - Build Logs
| Column | Type | Description |
|--------|------|-------------|
| deployment_id | uuid | Deployment reference |
| level | text | debug/info/warning/error |
| message | text | Log content |
| timestamp | timestamp | Log time |

### 14. **webhook_logs** - Webhook History
| Column | Type | Description |
|--------|------|-------------|
| webhook_id | uuid | Webhook reference |
| event_type | text | Trigger event |
| status_code | integer | HTTP response |
| duration_ms | integer | Request time |

### 15. **subscription_history** - Plan Changes
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | User reference |
| tier | text | Subscription level |
| started_at | timestamp | Start date |
| ended_at | timestamp | End date |
| reason | text | Change reason |

### 16. **team_members** - Team Access
| Column | Type | Description |
|--------|------|-------------|
| team_id | uuid | Team reference |
| user_id | uuid | Member reference |
| role | text | owner/admin/member |
| permissions | jsonb | Team permissions |

## 🔒 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Public projects visible to all
- Team members share project access

### Indexes for Performance
- Email and username lookups
- Project slug searches
- Time-based queries (created_at)
- Provider and model filtering

### Automatic Features
- UUID primary keys with gen_random_uuid()
- Timestamps with automatic updates
- Cascade deletes for data integrity
- Check constraints for valid values

## 📝 Usage Examples

### Create a new user profile
```sql
INSERT INTO profiles (email, full_name, role) 
VALUES ('user@example.com', 'John Doe', 'user');
```

### Track AI usage
```sql
INSERT INTO ai_usage_logs (user_id, provider, model, total_tokens, cost_usd)
VALUES ('user-uuid', 'openai', 'gpt-4', 1500, 0.045);
```

### Create a project
```sql
INSERT INTO projects (user_id, name, slug, framework, visibility)
VALUES ('user-uuid', 'My App', 'my-app', 'react', 'public');
```

### Record deployment
```sql
INSERT INTO deployments (project_id, user_id, provider, url, status)
VALUES ('project-uuid', 'user-uuid', 'vercel', 'https://my-app.vercel.app', 'ready');
```

## 🚀 Quick Setup

1. Copy `create-flashfusion-tables.sql` to Supabase SQL Editor
2. Run the entire script
3. Tables, indexes, and RLS policies will be created
4. Sample data will be inserted
5. Verify with the status check at the end

The schema supports all FlashFusion features including multi-tenant isolation, team collaboration, usage tracking, and comprehensive audit trails.