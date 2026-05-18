// ============================================================================
// ATTACK ON CODE — FRONTEND TYPE DEFINITIONS
// These types mirror the Prisma schema / backend API responses.
// ============================================================================

// ── ENUMS ───────────────────────────────────────────────────────────────

export type AvailabilityStatus = 'looking_for_team' | 'exploring' | 'busy' | 'inactive';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type TeamStatus = 'recruiting' | 'active' | 'submitted' | 'archived';
export type OpeningStatus = 'open' | 'filled' | 'closed';
export type HackathonMode = 'online' | 'offline' | 'hybrid';
export type ParticipationStatus = 'interested' | 'preparing' | 'registered' | 'participating' | 'submitted' | 'winner' | 'completed';
export type ProjectStatus = 'idea' | 'in_development' | 'beta' | 'live' | 'shipped' | 'archived';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ActivityType =
  | 'joined_team' | 'left_team' | 'created_team'
  | 'created_project' | 'joined_project'
  | 'registered_hackathon' | 'submitted_hackathon' | 'won_hackathon'
  | 'earned_badge' | 'updated_profile'
  | 'pushed_commits' | 'merged_pr'
  | 'status_changed' | 'invited_member' | 'applied_to_team';
export type EntityType = 'user' | 'team' | 'project' | 'hackathon' | 'badge';
export type SkillCategory =
  | 'frontend' | 'backend' | 'fullstack' | 'mobile'
  | 'ai_ml' | 'data_science' | 'devops' | 'design'
  | 'blockchain' | 'game_dev' | 'cybersecurity' | 'other';

// ── CORE ENTITIES ───────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  college: string | null;
  year: number | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  lookingForTeam: boolean;
  availabilityStatus: AvailabilityStatus;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface UserSkill {
  proficiency: ProficiencyLevel;
  yearsExperience: number;
  skill: Skill;
}

export interface UserStats {
  xp: number;
  hackathonsJoined: number;
  projectsCompleted: number;
  wins: number;
  contributions: number;
  streakDays: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

export interface UserBadge {
  earnedAt: string;
  badge: Badge;
}

// ── BUILDER (search result / card) ──────────────────────────────────────

export interface BuilderCard {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  college: string | null;
  lookingForTeam: boolean;
  availabilityStatus: AvailabilityStatus;
  skills: Array<{ proficiency: ProficiencyLevel; skill: { name: string; category: SkillCategory } }>;
  stats: UserStats | null;
  _count: { teamMemberships: number; badges: number };
}

// ── BUILDER PROFILE (full) ──────────────────────────────────────────────

export interface BuilderProfile extends User {
  skills: UserSkill[];
  stats: UserStats | null;
  preferences: UserPreferences | null;
  badges: UserBadge[];
  teamMemberships: Array<{ role: string; team: { id: string; name: string; status: TeamStatus } }>;
  projectMemberships: Array<{ role: string; project: { id: string; name: string; status: ProjectStatus } }>;
}

export interface UserPreferences {
  preferredRoles: string[];
  preferredTeamSize: number | null;
  interestedDomains: string[];
  hackathonFrequency: string;
  openToMentoring: boolean;
  preferredMode: HackathonMode;
}

// ── TEAMS ───────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  description: string | null;
  maxMembers: number;
  status: TeamStatus;
  createdAt: string;
  leader: { id: string; username: string; fullName: string; avatarUrl: string | null };
  members: TeamMember[];
  openings: TeamOpening[];
  hackathons: Array<{
    status: ParticipationStatus;
    hackathon: { id: string; name: string; startDate: string };
  }>;
  _count: { members: number };
}

export interface TeamMember {
  role: string;
  user: { id: string; username: string; avatarUrl: string | null };
}

export interface TeamOpening {
  id: string;
  title: string;
  description: string | null;
  requiredSkills: string[];
  slots: number;
  status: OpeningStatus;
}

export interface TeamApplication {
  id: string;
  openingId: string;
  userId: string;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
}

// ── HACKATHONS ──────────────────────────────────────────────────────────

export interface Hackathon {
  id: string;
  name: string;
  organizer: string | null;
  mode: HackathonMode;
  location: string | null;
  registrationDeadline: string | null;
  startDate: string;
  endDate: string;
  prizePool: string | null;
  websiteUrl: string | null;
  description: string | null;
  bannerUrl: string | null;
  themes: string[];
  teamsForming: number;
  buildersInterested: number;
}

// ── PROJECTS ────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string | null;
  githubRepo: string | null;
  demoUrl: string | null;
  techStack: string[];
  status: ProjectStatus;
  stars: number;
  forks: number;
  createdAt: string;
  ownerTeam: { id: string; name: string } | null;
  members: Array<{ role: string; user: { id: string; username: string; avatarUrl: string | null } }>;
  needs: ProjectNeed[];
  _count: { members: number };
}

export interface ProjectNeed {
  id: string;
  roleTitle: string;
  description: string | null;
  skills: string[];
  isFilled: boolean;
}

// ── ACTIVITY ────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  activityType: ActivityType;
  entityType: EntityType;
  entityId: string;
  metadata: Record<string, any>;
  createdAt: string;
  user: { id: string; username: string; fullName: string; avatarUrl: string | null };
}

// ── NOTIFICATIONS ───────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

// ── AUTH ─────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: string;
  };
}

// ── PAGINATION ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
