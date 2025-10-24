-- RE-Novate Database Schema
-- Creates all necessary tables for the entrepreneurship simulation platform

-- Schools table for verification codes
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  verification_code TEXT UNIQUE NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (students and teachers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT UNIQUE NOT NULL, -- Anonymous identifier
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  career_path TEXT, -- CEO, CTO, Marketing Lead, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Scenarios table for business challenges
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT NOT NULL, -- Liberian business context
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  career_relevance TEXT[], -- Array of relevant career paths
  options JSONB NOT NULL, -- Array of decision options
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table to track simulation runs
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER DEFAULT 5,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Decisions table to track student choices
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  selected_option TEXT NOT NULL,
  ai_feedback TEXT,
  outcome_score INTEGER CHECK (outcome_score BETWEEN 0 AND 100),
  skills_gained JSONB, -- {"leadership": 5, "financial_literacy": 3}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress table for tracking student development
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level INTEGER DEFAULT 0 CHECK (skill_level >= 0),
  total_scenarios_completed INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_session ON decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
