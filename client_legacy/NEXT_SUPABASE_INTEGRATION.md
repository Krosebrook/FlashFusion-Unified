# Next.js + Supabase Agent Integration

## Overview
This frontend integrates with the FlashFusion agent routing system using Next.js App Router and Supabase for authentication and data persistence.

## File Structure
```
frontend/
├── app/
│   ├── agents/page.tsx              # Server component showing agent logs
│   ├── agent-chat/page.tsx          # Interactive chat page
│   └── api/agents/chat/route.ts     # API proxy route
├── components/
│   └── AgentChat.tsx                # Client component for chat interface
└── utils/supabase/
    ├── server.ts                    # Server-side Supabase client
    └── client.ts                    # Client-side Supabase client
```

## Environment Variables
Add to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
FLASHFUSION_BACKEND_URL=http://localhost:3000
```

Note: Some Supabase setups use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Check your Supabase dashboard for the correct key name.

## Features

### 1. **Server Components** (`app/agents/page.tsx`)
- Fetches agent logs directly from Supabase
- Shows available agents and recent activity
- Server-side rendered for SEO and performance

### 2. **Interactive Chat** (`app/agent-chat/page.tsx`)
- Authenticated user chat interface
- Real-time agent selection
- Secure API communication

### 3. **Client Components** (`components/AgentChat.tsx`)
- Interactive form handling
- Loading states and error handling
- Responsive design with Tailwind CSS

### 4. **API Routes** (`app/api/agents/chat/route.ts`)
- Proxies requests to FlashFusion backend
- Handles authentication via Supabase
- Type-safe with TypeScript

## Usage

### 1. View Agent Activity
Navigate to `/agents` to see:
- List of available agents
- Recent agent interactions from database
- Agent configurations

### 2. Chat with Agents
Navigate to `/agent-chat` to:
- Select an agent based on your task
- Send requests and receive AI responses
- View formatted responses

### 3. Authentication Flow
- Users must be logged in via Supabase Auth
- Unauthenticated users see login prompt
- Session tokens passed to backend

## Security Features
- ✅ Server-side authentication checks
- ✅ API key protection (backend only)
- ✅ CSRF protection via Supabase
- ✅ Rate limiting on backend
- ✅ Input validation

## Database Schema
The integration expects this Supabase table:
```sql
CREATE TABLE agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  input TEXT,
  output TEXT,
  model_used TEXT,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Index for performance
CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp DESC);
CREATE INDEX idx_agent_logs_user_id ON agent_logs(user_id);
```

## Development
```bash
cd frontend
npm install
npm run dev
```

Visit:
- http://localhost:3001/agents - View agent activity
- http://localhost:3001/agent-chat - Interactive chat

## Production Considerations
1. Set proper CORS headers in FlashFusion backend
2. Use environment-specific URLs
3. Enable RLS (Row Level Security) in Supabase
4. Monitor rate limits and costs
5. Implement proper error tracking

## Next Steps
- Add real-time updates with Supabase subscriptions
- Implement agent response streaming
- Add conversation history view
- Create admin dashboard for agent management