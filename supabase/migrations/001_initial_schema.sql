-- FlashFusion-United Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    expertise VARCHAR(255),
    avatar_emoji VARCHAR(10),
    bio TEXT,
    rating INTEGER DEFAULT 5,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard metrics table
CREATE TABLE dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_change NUMERIC,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO team_members (name, role, expertise, avatar_emoji) VALUES
('Alex Johnson', 'CEO & Founder', 'Strategy & Vision', '👨‍💼'),
('Sarah Chen', 'Chief Technology Officer', 'Engineering & Architecture', '👩‍💻'),
('Mike Rodriguez', 'Head of Design', 'UX & Product Design', '👨‍🎨'),
('Emily Davis', 'Product Manager', 'Product Strategy', '👩‍💼'),
('David Kim', 'Lead Developer', 'Full-Stack Development', '👨‍💻'),
('Lisa Wang', 'Marketing Director', 'Growth & Analytics', '👩‍📊');

INSERT INTO dashboard_metrics (metric_type, metric_value, metric_change, period_start, period_end) VALUES
('active_sessions', 2847, 12, NOW() - INTERVAL '1 month', NOW()),
('monthly_revenue', 12943, 8.2, NOW() - INTERVAL '1 month', NOW()),
('conversion_rate', 23.7, -2.1, NOW() - INTERVAL '1 month', NOW()),
('user_growth', 1284, 15.3, NOW() - INTERVAL '1 month', NOW());

-- Create indexes for performance
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_dashboard_metrics_type ON dashboard_metrics(metric_type);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can log analytics" ON analytics
    FOR INSERT WITH CHECK (true);

-- Public read access for team members and metrics
CREATE POLICY "Team members are publicly readable" ON team_members
    FOR SELECT USING (active = true);

CREATE POLICY "Dashboard metrics are publicly readable" ON dashboard_metrics
    FOR SELECT USING (true);