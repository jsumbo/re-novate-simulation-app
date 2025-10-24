# RE-Novate Platform - Database Schema Documentation

## Overview
This document describes the comprehensive database schema for the RE-Novate entrepreneurship education platform. The schema is designed to support a gamified learning experience with AI-powered feedback, progress tracking, and multi-school deployment.

## Core Tables

### 1. Schools
Manages educational institutions using the platform.
```sql
schools (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  country TEXT DEFAULT 'Liberia',
  region TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 2. Users
Central user management for students, teachers, and admins.
```sql
users (
  id UUID PRIMARY KEY,
  participant_id TEXT UNIQUE NOT NULL,  -- Auto-generated unique ID
  username TEXT,                        -- User-chosen display name
  full_name TEXT,                       -- Real name for personalization
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth DATE,
  email TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  school_id UUID REFERENCES schools(id),
  career_path TEXT,                     -- Chosen interest area
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 3. Student Profiles
Extended profile information for students.
```sql
student_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  interest_area TEXT NOT NULL,          -- Primary learning focus
  avatar_config JSONB DEFAULT '{}',    -- Avatar customization data
  skill_level TEXT DEFAULT 'Beginner', -- Overall skill assessment
  motivation TEXT,                      -- Why they're learning
  aspirations TEXT,                     -- Career goals
  learning_preference TEXT,             -- Individual/collaborative/mixed
  onboarding_completed BOOLEAN DEFAULT FALSE,
  total_points INTEGER DEFAULT 0,      -- Gamification points
  current_level INTEGER DEFAULT 1,     -- User level based on points
  achievements JSONB DEFAULT '[]',     -- Earned achievements
  preferences JSONB DEFAULT '{}',      -- UI/UX preferences
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Learning Content Tables

### 4. Scenarios
Core learning scenarios/simulations.
```sql
scenarios (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT,                         -- Background story/situation
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  interest_area TEXT NOT NULL,
  scenario_type TEXT DEFAULT 'decision',
  estimated_duration INTEGER DEFAULT 5, -- minutes
  skills_focus TEXT[],                  -- Array of skills this scenario develops
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 5. Scenario Options
Multiple choice options for each scenario.
```sql
scenario_options (
  id UUID PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id),
  option_text TEXT NOT NULL,
  outcome_description TEXT,             -- What happens if chosen
  outcome_score INTEGER DEFAULT 0,     -- Points awarded
  skills_impact JSONB DEFAULT '{}',    -- Skills gained/lost
  feedback_text TEXT,                   -- Explanation of choice
  is_correct BOOLEAN DEFAULT FALSE,    -- For quiz-style scenarios
  order_index INTEGER DEFAULT 0,       -- Display order
  created_at TIMESTAMP
)
```

## Learning Progress Tables

### 6. Sessions
Learning sessions/practice rounds.
```sql
sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_type TEXT DEFAULT 'scenario_practice',
  status TEXT CHECK (status IN ('in_progress', 'completed', 'paused', 'abandoned')),
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER DEFAULT 5,
  total_score INTEGER DEFAULT 0,
  scenarios_completed INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,        -- seconds
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### 7. Decisions
Individual scenario decisions made by users.
```sql
decisions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES sessions(id),
  scenario_id UUID REFERENCES scenarios(id),
  selected_option_id UUID REFERENCES scenario_options(id),
  outcome_score INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,        -- seconds to decide
  ai_feedback TEXT,                     -- Personalized AI response
  skills_gained JSONB DEFAULT '{}',    -- Skills points earned
  reflection_notes TEXT,               -- User's own notes
  created_at TIMESTAMP
)
```

### 8. Progress
Skill development tracking.
```sql
progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  skill_name TEXT NOT NULL,
  skill_level INTEGER DEFAULT 0,       -- Current skill points
  total_scenarios_completed INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  last_practiced TIMESTAMP,
  improvement_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, skill_name)
)
```

## Assessment Tables

### 9. Quiz Results
Onboarding and assessment quiz results.
```sql
quiz_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  quiz_type TEXT NOT NULL,
  interest_area TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  skill_level_determined TEXT,          -- Beginner/Intermediate/Advanced
  answers JSONB DEFAULT '[]',           -- Detailed answer data
  time_taken INTEGER DEFAULT 0,        -- seconds
  ai_summary TEXT,                      -- AI-generated summary feedback
  completed_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### 10. Learning Goals
User-set learning objectives.
```sql
learning_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  goal_text TEXT NOT NULL,
  goal_category TEXT DEFAULT 'custom',
  status TEXT CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  progress INTEGER DEFAULT 0,          -- 0-100 percentage
  target_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  milestones JSONB DEFAULT '[]',       -- Sub-goals/checkpoints
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## AI and Engagement Tables

### 11. AI Interactions
Tracking AI mentor interactions.
```sql
ai_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  interaction_type TEXT NOT NULL,       -- feedback, quiz, guidance, etc.
  context JSONB DEFAULT '{}',          -- Situation context
  ai_response TEXT,                     -- AI's response
  response_time INTEGER DEFAULT 0,     -- milliseconds
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  was_helpful BOOLEAN,
  user_feedback TEXT,                   -- User's comments on AI response
  created_at TIMESTAMP
)
```

### 12. Achievements
Gamification achievements system.
```sql
achievements (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '🏆',
  category TEXT DEFAULT 'general',
  points_required INTEGER DEFAULT 0,
  criteria JSONB DEFAULT '{}',         -- Achievement unlock conditions
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP
)
```

### 13. User Achievements
Tracking which achievements users have earned.
```sql
user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMP,
  progress INTEGER DEFAULT 100,        -- For progressive achievements
  UNIQUE(user_id, achievement_id)
)
```

### 14. Notifications
In-app notification system.
```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('achievement', 'reminder', 'feedback', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,                      -- Deep link for action
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### 15. Learning Paths
AI-generated personalized learning journeys.
```sql
learning_paths (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  interest_area TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_duration INTEGER DEFAULT 30, -- days
  modules JSONB DEFAULT '[]',           -- Learning modules/steps
  current_module INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Key Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Students can only access their own data
- Teachers can view their school's student data
- Admins have broader access based on role

### Performance Optimization
- Strategic indexes on frequently queried columns
- Composite indexes for complex queries
- Optimized for mobile-first responsive queries

### Data Integrity
- Foreign key constraints maintain referential integrity
- Check constraints ensure valid enum values
- Unique constraints prevent duplicates
- Triggers automatically update timestamps

### Scalability Considerations
- UUID primary keys for distributed systems
- JSONB fields for flexible schema evolution
- Partitioning-ready timestamp fields
- Efficient indexing strategy

## Sample Queries

### Get Student Dashboard Data
```sql
-- Student overview with progress
SELECT 
  u.username,
  u.full_name,
  sp.interest_area,
  sp.total_points,
  sp.current_level,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
  AVG(d.outcome_score) as average_score
FROM users u
JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN sessions s ON u.id = s.user_id
LEFT JOIN decisions d ON u.id = d.user_id
WHERE u.id = $1
GROUP BY u.id, sp.id;
```

### Get Teacher Dashboard Data
```sql
-- Teacher's class overview
SELECT 
  u.username,
  sp.interest_area,
  COUNT(DISTINCT s.id) as total_sessions,
  AVG(d.outcome_score) as average_score,
  MAX(s.completed_at) as last_activity
FROM users u
JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN sessions s ON u.id = s.user_id
LEFT JOIN decisions d ON u.id = d.user_id
WHERE u.school_id = (SELECT school_id FROM users WHERE id = $1)
  AND u.role = 'student'
GROUP BY u.id, sp.id
ORDER BY last_activity DESC;
```

### Get Skill Progress
```sql
-- Individual skill development
SELECT 
  skill_name,
  skill_level,
  total_scenarios_completed,
  average_score,
  improvement_rate,
  last_practiced
FROM progress
WHERE user_id = $1
ORDER BY skill_level DESC;
```

This schema provides a robust foundation for the RE-Novate platform, supporting all current features while being extensible for future enhancements.