-- FlashFusion Database Schema
-- Compatible with PostgreSQL and Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agent Logs Table
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  input TEXT,
  output TEXT,
  model_used TEXT,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp DESC);
CREATE INDEX idx_agent_logs_user_id ON agent_logs(user_id);
CREATE INDEX idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_metadata ON agent_logs USING GIN(metadata);

-- Agent Personalities Table
CREATE TABLE IF NOT EXISTS agent_personalities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id TEXT UNIQUE NOT NULL,
  personality_type TEXT NOT NULL,
  traits JSONB DEFAULT '[]',
  communication_style JSONB DEFAULT '{}',
  stress_responses JSONB DEFAULT '[]',
  decision_bias TEXT,
  work_pace TEXT,
  collaboration_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent States Table (for tracking emotional states and workload)
CREATE TABLE IF NOT EXISTS agent_states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  workload DECIMAL(3,2) DEFAULT 0.0 CHECK (workload >= 0 AND workload <= 1),
  timeline_pressure DECIMAL(3,2) DEFAULT 0.0 CHECK (timeline_pressure >= 0 AND timeline_pressure <= 1),
  conflicts DECIMAL(3,2) DEFAULT 0.0 CHECK (conflicts >= 0 AND conflicts <= 1),
  emotional_state TEXT,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id) ON DELETE CASCADE
);

-- Team Dynamics Table
CREATE TABLE IF NOT EXISTS team_dynamics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id TEXT NOT NULL,
  members TEXT[] NOT NULL,
  conflicts JSONB DEFAULT '[]',
  collaborations JSONB DEFAULT '[]',
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  owner_id TEXT,
  team_members TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Memory Table (for conversation persistence)
CREATE TABLE IF NOT EXISTS agent_memory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id TEXT,
  conversation_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Index for efficient memory retrieval
CREATE INDEX idx_agent_memory_lookup ON agent_memory(agent_id, user_id, conversation_id, sequence_number);

-- Orchestration Events Table
CREATE TABLE IF NOT EXISTS orchestration_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_id TEXT,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- API Usage Table (for tracking OpenRouter usage)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0.0,
  request_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_agent_logs_updated_at BEFORE UPDATE ON agent_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_personalities_updated_at BEFORE UPDATE ON agent_personalities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_states_updated_at BEFORE UPDATE ON agent_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for Supabase
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_dynamics ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (adjust based on your auth strategy)
-- Allow authenticated users to read their own data
CREATE POLICY "Users can view their own agent logs" ON agent_logs
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own agent logs" ON agent_logs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow all authenticated users to read agent personalities
CREATE POLICY "Anyone can view agent personalities" ON agent_personalities
    FOR SELECT USING (true);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid()::text = owner_id OR auth.uid()::text = ANY(team_members));

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid()::text = owner_id);

-- Views for common queries
CREATE OR REPLACE VIEW agent_activity_summary AS
SELECT 
    al.agent_id,
    ap.personality_type,
    COUNT(al.id) as total_interactions,
    MAX(al.timestamp) as last_interaction,
    AVG(CASE WHEN al.metadata->>'response_time_ms' IS NOT NULL 
         THEN (al.metadata->>'response_time_ms')::INTEGER 
         ELSE NULL END) as avg_response_time_ms
FROM agent_logs al
LEFT JOIN agent_personalities ap ON al.agent_id = ap.agent_id
GROUP BY al.agent_id, ap.personality_type;

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete agent logs older than 30 days
    DELETE FROM agent_logs WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Delete expired agent memory
    DELETE FROM agent_memory WHERE expires_at < NOW();
    
    -- Delete old orchestration events
    DELETE FROM orchestration_events WHERE created_at < NOW() - INTERVAL '7 days' AND status = 'processed';
END;
$$ LANGUAGE plpgsql;

-- Sample data for agent personalities
INSERT INTO agent_personalities (agent_id, personality_type, traits, communication_style, decision_bias, work_pace, collaboration_style)
VALUES 
    ('writerbot', 'ux_designer', '["empathetic", "user_obsessed", "research_driven", "perfectionistic"]'::jsonb, 
     '{"tone": "human_centered", "greeting": "👥 Let''s talk about our users", "signature": "Making it intuitive!"}'::jsonb,
     'user_first', 'iterative_refinement', 'advocate'),
    ('coderbot', 'backend_developer', '["systematic", "security_conscious", "scalability_focused", "logical"]'::jsonb,
     '{"tone": "precise", "greeting": "🔧 Let''s build the foundation", "signature": "Scalable and secure!"}'::jsonb,
     'technical_excellence', 'methodical_and_thorough', 'architect'),
    ('securitybot', 'security_analyst', '["paranoid_by_design", "compliance_focused", "threat_aware", "risk_calculator"]'::jsonb,
     '{"tone": "serious_but_helpful", "greeting": "🛡️ Let''s secure this properly", "signature": "Trust but verify!"}'::jsonb,
     'security_first', 'vigilant_and_thorough', 'guardian')
ON CONFLICT (agent_id) DO NOTHING;