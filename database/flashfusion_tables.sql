-- FlashFusion Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  priority INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES projects(id),
  current_phase VARCHAR(50) DEFAULT 'discovery',
  progress INTEGER DEFAULT 0,
  phase_progress JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'not_started',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent activities table
CREATE TABLE IF NOT EXISTS agent_activities (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(255),
  workflow_id VARCHAR(255),
  agent_role VARCHAR(100),
  activity_type VARCHAR(100),
  activity_data JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_workflows_project_id ON workflows(project_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_agent_activities_project_id ON agent_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_agent_role ON agent_activities(agent_role);
CREATE INDEX IF NOT EXISTS idx_agent_activities_created_at ON agent_activities(created_at);

-- Insert sample data for testing
INSERT INTO projects (id, name, description, type, priority, status) 
VALUES ('sample_project_001', 'FlashFusion Demo Project', 'Demonstration of the orchestration system', 'demo', 8, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflows (id, project_id, current_phase, progress, status)
VALUES ('workflow_001', 'sample_project_001', 'discovery', 25, 'in_progress')
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_activities (project_id, workflow_id, agent_role, activity_type, activity_data, status)
VALUES 
  ('sample_project_001', 'workflow_001', 'visionary_strategist', 'analysis', '{"task": "Market research completed"}', 'completed'),
  ('sample_project_001', 'workflow_001', 'product_manager', 'planning', '{"task": "Requirements gathering"}', 'in_progress')
ON CONFLICT DO NOTHING;