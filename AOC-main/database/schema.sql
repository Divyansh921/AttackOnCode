-- ============================================================================
-- ATTACK ON CODE — DATABASE SCHEMA
-- A collaborative developer network optimized for hackathon ecosystems.
--
-- Database: PostgreSQL 15+
-- Architecture: Modular (Identity → Social → Teams → Hackathons → Projects)
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy search


-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE availability_status AS ENUM (
  'looking_for_team',
  'exploring',
  'busy',
  'inactive'
);

CREATE TYPE proficiency_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

CREATE TYPE team_status AS ENUM (
  'recruiting',
  'active',
  'submitted',
  'archived'
);

CREATE TYPE team_visibility AS ENUM (
  'public',
  'invite_only',
  'private'
);

CREATE TYPE opening_status AS ENUM (
  'open',
  'filled',
  'closed'
);

CREATE TYPE hackathon_mode AS ENUM (
  'online',
  'offline',
  'hybrid'
);

CREATE TYPE participation_status AS ENUM (
  'interested',
  'preparing',
  'registered',
  'participating',
  'submitted',
  'winner',
  'completed'
);

CREATE TYPE project_status AS ENUM (
  'idea',
  'in_development',
  'beta',
  'live',
  'shipped',
  'archived'
);

CREATE TYPE project_visibility AS ENUM (
  'public',
  'team_only',
  'private'
);

CREATE TYPE activity_type AS ENUM (
  'joined_team',
  'left_team',
  'created_team',
  'created_project',
  'joined_project',
  'registered_hackathon',
  'submitted_hackathon',
  'won_hackathon',
  'earned_badge',
  'updated_profile',
  'pushed_commits',
  'merged_pr',
  'status_changed',
  'invited_member',
  'applied_to_team'
);

CREATE TYPE entity_type AS ENUM (
  'user',
  'team',
  'project',
  'hackathon',
  'badge'
);

CREATE TYPE notification_type AS ENUM (
  'team_invite',
  'team_application',
  'application_accepted',
  'application_rejected',
  'hackathon_reminder',
  'hackathon_deadline',
  'team_update',
  'project_update',
  'badge_earned',
  'mention',
  'system'
);

CREATE TYPE hackathon_frequency AS ENUM (
  'weekly',
  'monthly',
  'quarterly',
  'occasionally'
);

CREATE TYPE skill_category AS ENUM (
  'frontend',
  'backend',
  'fullstack',
  'mobile',
  'ai_ml',
  'data_science',
  'devops',
  'design',
  'blockchain',
  'game_dev',
  'cybersecurity',
  'other'
);

CREATE TYPE application_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'withdrawn'
);


-- ============================================================================
-- MODULE 1: IDENTITY
-- ============================================================================

CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username            VARCHAR(50) UNIQUE NOT NULL,
  full_name           VARCHAR(100) NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  avatar_url          TEXT,
  bio                 TEXT,
  college             VARCHAR(200),
  year                INT CHECK (year >= 1 AND year <= 6),
  github_url          TEXT,
  linkedin_url        TEXT,
  portfolio_url       TEXT,
  looking_for_team    BOOLEAN DEFAULT false,
  availability_status availability_status DEFAULT 'inactive',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_availability ON users (availability_status) WHERE looking_for_team = true;
CREATE INDEX idx_users_college ON users (college);
CREATE INDEX idx_users_fullname_trgm ON users USING gin (full_name gin_trgm_ops);


-- ============================================================================
-- MODULE 2: SKILLS
-- ============================================================================

CREATE TABLE skills (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name     VARCHAR(100) UNIQUE NOT NULL,
  category skill_category NOT NULL
);

CREATE INDEX idx_skills_category ON skills (category);
CREATE INDEX idx_skills_name_trgm ON skills USING gin (name gin_trgm_ops);

CREATE TABLE user_skills (
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id         UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency      proficiency_level DEFAULT 'beginner',
  years_experience NUMERIC(3,1) DEFAULT 0 CHECK (years_experience >= 0),
  PRIMARY KEY (user_id, skill_id)
);

CREATE INDEX idx_user_skills_skill ON user_skills (skill_id);
CREATE INDEX idx_user_skills_proficiency ON user_skills (proficiency);


-- ============================================================================
-- MODULE 3: TEAMS
-- ============================================================================

CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  leader_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  max_members INT DEFAULT 6 CHECK (max_members >= 2 AND max_members <= 20),
  visibility  team_visibility DEFAULT 'public',
  status      team_status DEFAULT 'recruiting',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_leader ON teams (leader_id);
CREATE INDEX idx_teams_status ON teams (status);
CREATE INDEX idx_teams_name_trgm ON teams USING gin (name gin_trgm_ops);

CREATE TABLE team_members (
  team_id   UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  role      VARCHAR(100) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON team_members (user_id);


-- ============================================================================
-- MODULE 4: TEAM RECRUITMENT
-- ============================================================================

CREATE TABLE team_openings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title           VARCHAR(100) NOT NULL,
  description     TEXT,
  required_skills JSONB DEFAULT '[]',
  slots           INT DEFAULT 1 CHECK (slots >= 1),
  status          opening_status DEFAULT 'open',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_openings_team ON team_openings (team_id);
CREATE INDEX idx_team_openings_status ON team_openings (status) WHERE status = 'open';
CREATE INDEX idx_team_openings_skills ON team_openings USING gin (required_skills);

CREATE TABLE team_applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opening_id  UUID NOT NULL REFERENCES team_openings(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT,
  status      application_status DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE (opening_id, user_id)
);

CREATE INDEX idx_team_applications_user ON team_applications (user_id);
CREATE INDEX idx_team_applications_status ON team_applications (status) WHERE status = 'pending';


-- ============================================================================
-- MODULE 5: HACKATHONS
-- ============================================================================

CREATE TABLE hackathons (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  VARCHAR(200) NOT NULL,
  organizer             VARCHAR(200),
  mode                  hackathon_mode DEFAULT 'offline',
  location              VARCHAR(300),
  registration_deadline TIMESTAMPTZ,
  start_date            TIMESTAMPTZ NOT NULL,
  end_date              TIMESTAMPTZ NOT NULL,
  prize_pool            VARCHAR(100),
  website_url           TEXT,
  description           TEXT,
  banner_url            TEXT,
  max_team_size         INT,
  min_team_size         INT,
  themes                JSONB DEFAULT '[]',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date > start_date)
);

CREATE INDEX idx_hackathons_dates ON hackathons (start_date, end_date);
CREATE INDEX idx_hackathons_deadline ON hackathons (registration_deadline) WHERE registration_deadline > NOW();
CREATE INDEX idx_hackathons_name_trgm ON hackathons USING gin (name gin_trgm_ops);
CREATE INDEX idx_hackathons_themes ON hackathons USING gin (themes);

-- Tracks which teams are participating in which hackathons
CREATE TABLE team_hackathons (
  team_id      UUID REFERENCES teams(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  project_id   UUID,  -- FK added after projects table
  status       participation_status DEFAULT 'interested',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, hackathon_id)
);

CREATE INDEX idx_team_hackathons_hackathon ON team_hackathons (hackathon_id);
CREATE INDEX idx_team_hackathons_status ON team_hackathons (status);

-- Tracks individual interest in hackathons (before team formation)
CREATE TABLE user_hackathon_interest (
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  interested_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, hackathon_id)
);


-- ============================================================================
-- MODULE 6: PROJECTS
-- ============================================================================

CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  github_repo   TEXT,
  demo_url      TEXT,
  tech_stack    JSONB DEFAULT '[]',
  status        project_status DEFAULT 'idea',
  owner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  visibility    project_visibility DEFAULT 'public',
  stars         INT DEFAULT 0 CHECK (stars >= 0),
  forks         INT DEFAULT 0 CHECK (forks >= 0),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_team ON projects (owner_team_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_tech ON projects USING gin (tech_stack);
CREATE INDEX idx_projects_name_trgm ON projects USING gin (name gin_trgm_ops);

-- Now add the FK from team_hackathons to projects
ALTER TABLE team_hackathons
  ADD CONSTRAINT fk_team_hackathons_project
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(100) NOT NULL DEFAULT 'contributor',
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_project_members_user ON project_members (user_id);

-- Tracks what a project needs (contributor openings)
CREATE TABLE project_needs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role_title  VARCHAR(100) NOT NULL,
  description TEXT,
  skills      JSONB DEFAULT '[]',
  is_filled   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_needs_project ON project_needs (project_id);
CREATE INDEX idx_project_needs_open ON project_needs (is_filled) WHERE is_filled = false;


-- ============================================================================
-- MODULE 7: ACTIVITY FEED
-- ============================================================================

CREATE TABLE activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  entity_type   entity_type NOT NULL,
  entity_id     UUID NOT NULL,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON activities (user_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities (activity_type);
CREATE INDEX idx_activities_entity ON activities (entity_type, entity_id);
CREATE INDEX idx_activities_created ON activities (created_at DESC);


-- ============================================================================
-- MODULE 8: REPUTATION
-- ============================================================================

CREATE TABLE user_stats (
  user_id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp                 INT DEFAULT 0 CHECK (xp >= 0),
  hackathons_joined  INT DEFAULT 0 CHECK (hackathons_joined >= 0),
  projects_completed INT DEFAULT 0 CHECK (projects_completed >= 0),
  wins               INT DEFAULT 0 CHECK (wins >= 0),
  contributions      INT DEFAULT 0 CHECK (contributions >= 0),
  streak_days        INT DEFAULT 0 CHECK (streak_days >= 0),
  last_active_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url    TEXT,
  xp_reward   INT DEFAULT 0,
  criteria    JSONB DEFAULT '{}'
);

CREATE TABLE user_badges (
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id  UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE INDEX idx_user_badges_badge ON user_badges (badge_id);


-- ============================================================================
-- MODULE 9: MATCHMAKING / PREFERENCES
-- ============================================================================

CREATE TABLE user_preferences (
  user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_roles      JSONB DEFAULT '[]',
  preferred_team_size  INT CHECK (preferred_team_size >= 2 AND preferred_team_size <= 20),
  interested_domains   JSONB DEFAULT '[]',
  hackathon_frequency  hackathon_frequency DEFAULT 'occasionally',
  open_to_mentoring    BOOLEAN DEFAULT false,
  preferred_mode       hackathon_mode DEFAULT 'hybrid',
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- MODULE 10: NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT,
  link       TEXT,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE is_read = false;


-- ============================================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teams_updated
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_stats_updated
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_preferences_updated
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- SEED DATA: Skills
-- ============================================================================

INSERT INTO skills (name, category) VALUES
  -- Frontend
  ('React', 'frontend'),
  ('Next.js', 'frontend'),
  ('Vue.js', 'frontend'),
  ('Angular', 'frontend'),
  ('Svelte', 'frontend'),
  ('TypeScript', 'frontend'),
  ('Tailwind CSS', 'frontend'),
  ('HTML/CSS', 'frontend'),

  -- Backend
  ('Node.js', 'backend'),
  ('Express', 'backend'),
  ('FastAPI', 'backend'),
  ('Django', 'backend'),
  ('Spring Boot', 'backend'),
  ('Go', 'backend'),
  ('Rust', 'backend'),
  ('NestJS', 'backend'),
  ('GraphQL', 'backend'),

  -- Full-Stack
  ('PostgreSQL', 'fullstack'),
  ('MongoDB', 'fullstack'),
  ('Redis', 'fullstack'),
  ('Docker', 'fullstack'),
  ('Kubernetes', 'fullstack'),
  ('AWS', 'fullstack'),
  ('Supabase', 'fullstack'),
  ('Firebase', 'fullstack'),

  -- Mobile
  ('Flutter', 'mobile'),
  ('React Native', 'mobile'),
  ('Swift', 'mobile'),
  ('Kotlin', 'mobile'),
  ('Dart', 'mobile'),

  -- AI/ML
  ('Python', 'ai_ml'),
  ('PyTorch', 'ai_ml'),
  ('TensorFlow', 'ai_ml'),
  ('LangChain', 'ai_ml'),
  ('NLP', 'ai_ml'),
  ('Computer Vision', 'ai_ml'),
  ('Reinforcement Learning', 'ai_ml'),
  ('Scikit-learn', 'ai_ml'),

  -- Design
  ('Figma', 'design'),
  ('UI/UX', 'design'),
  ('Prototyping', 'design'),
  ('Design Systems', 'design'),
  ('Motion Design', 'design'),

  -- DevOps
  ('CI/CD', 'devops'),
  ('GitHub Actions', 'devops'),
  ('Terraform', 'devops'),
  ('Linux', 'devops'),
  ('Nginx', 'devops'),

  -- Blockchain
  ('Solidity', 'blockchain'),
  ('Ethereum', 'blockchain'),
  ('Web3.js', 'blockchain'),
  ('Smart Contracts', 'blockchain'),

  -- Game Dev
  ('Unity', 'game_dev'),
  ('Unreal Engine', 'game_dev'),
  ('Godot', 'game_dev'),
  ('C#', 'game_dev'),
  ('C++', 'game_dev');


-- ============================================================================
-- SEED DATA: Badges
-- ============================================================================

INSERT INTO badges (name, description, xp_reward, criteria) VALUES
  ('First Blood', 'Joined your first team', 50, '{"type": "team_joins", "count": 1}'),
  ('Hackathon Rookie', 'Participated in your first hackathon', 100, '{"type": "hackathons_joined", "count": 1}'),
  ('Hackathon Veteran', 'Participated in 5+ hackathons', 500, '{"type": "hackathons_joined", "count": 5}'),
  ('Ship It', 'Shipped your first project', 200, '{"type": "projects_shipped", "count": 1}'),
  ('Builder x10', 'Completed 10 projects', 1000, '{"type": "projects_completed", "count": 10}'),
  ('Open Source Hero', 'Made 50+ contributions', 500, '{"type": "contributions", "count": 50}'),
  ('Team Captain', 'Led a team to hackathon submission', 300, '{"type": "teams_led", "count": 1}'),
  ('Winner', 'Won a hackathon', 1000, '{"type": "wins", "count": 1}'),
  ('Serial Winner', 'Won 3+ hackathons', 3000, '{"type": "wins", "count": 3}'),
  ('Streak Master', 'Maintained a 30-day activity streak', 500, '{"type": "streak_days", "count": 30}'),
  ('Mentor', 'Mentored 5+ builders', 400, '{"type": "mentored", "count": 5}'),
  ('Full Stack', 'Added skills across 3+ categories', 200, '{"type": "skill_categories", "count": 3}');


-- ============================================================================
-- VIEWS: Useful query shortcuts
-- ============================================================================

-- Builder directory view with stats
CREATE VIEW builder_directory AS
SELECT
  u.id,
  u.username,
  u.full_name,
  u.avatar_url,
  u.bio,
  u.college,
  u.looking_for_team,
  u.availability_status,
  COALESCE(us.xp, 0) AS xp,
  COALESCE(us.hackathons_joined, 0) AS hackathons_joined,
  COALESCE(us.projects_completed, 0) AS projects_completed,
  COALESCE(us.contributions, 0) AS contributions,
  COALESCE(us.wins, 0) AS wins,
  ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS skills,
  ARRAY_AGG(DISTINCT s.category) FILTER (WHERE s.category IS NOT NULL) AS skill_categories,
  COUNT(DISTINCT tm.team_id) AS active_teams
FROM users u
LEFT JOIN user_stats us ON us.user_id = u.id
LEFT JOIN user_skills usk ON usk.user_id = u.id
LEFT JOIN skills s ON s.id = usk.skill_id
LEFT JOIN team_members tm ON tm.user_id = u.id
GROUP BY u.id, us.xp, us.hackathons_joined, us.projects_completed, us.contributions, us.wins;

-- Team recruitment view
CREATE VIEW team_recruitment AS
SELECT
  t.id AS team_id,
  t.name AS team_name,
  t.description,
  t.status,
  t.max_members,
  u.full_name AS leader_name,
  COUNT(DISTINCT tm.user_id) AS current_members,
  ARRAY_AGG(DISTINCT to2.title) FILTER (WHERE to2.status = 'open') AS open_positions,
  ARRAY_AGG(DISTINCT h.name) FILTER (WHERE h.name IS NOT NULL) AS target_hackathons
FROM teams t
JOIN users u ON u.id = t.leader_id
LEFT JOIN team_members tm ON tm.team_id = t.id
LEFT JOIN team_openings to2 ON to2.team_id = t.id
LEFT JOIN team_hackathons th ON th.team_id = t.id
LEFT JOIN hackathons h ON h.id = th.hackathon_id
WHERE t.status = 'recruiting'
GROUP BY t.id, u.full_name;

-- Hackathon dashboard view
CREATE VIEW hackathon_dashboard AS
SELECT
  h.id,
  h.name,
  h.organizer,
  h.mode,
  h.location,
  h.start_date,
  h.end_date,
  h.registration_deadline,
  h.prize_pool,
  COUNT(DISTINCT th.team_id) AS teams_forming,
  COUNT(DISTINCT uhi.user_id) AS builders_interested,
  h.themes
FROM hackathons h
LEFT JOIN team_hackathons th ON th.hackathon_id = h.id
LEFT JOIN user_hackathon_interest uhi ON uhi.hackathon_id = h.id
GROUP BY h.id;

-- Recent activity feed
CREATE VIEW recent_activity AS
SELECT
  a.id,
  a.activity_type,
  a.entity_type,
  a.entity_id,
  a.metadata,
  a.created_at,
  u.username,
  u.full_name,
  u.avatar_url
FROM activities a
JOIN users u ON u.id = a.user_id
ORDER BY a.created_at DESC;


-- ============================================================================
-- DONE.
-- Schema version: 1.0.0
-- Tables: 18
-- Enums: 16
-- Views: 4
-- Indexes: 30+
-- ============================================================================
