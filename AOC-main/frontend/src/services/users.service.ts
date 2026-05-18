import { api } from '@/lib/api';
import type {
  BuilderCard, BuilderProfile, Skill,
  PaginatedResponse, AvailabilityStatus, SkillCategory,
} from '@/types';

export interface BuilderSearchParams {
  search?: string;
  skills?: string[];
  availability?: AvailabilityStatus;
  lookingForTeam?: boolean;
  category?: SkillCategory;
  college?: string;
  page?: number;
  limit?: number;
}

export const usersService = {
  search(params: BuilderSearchParams) {
    return api.get<PaginatedResponse<BuilderCard>>('/users', params as any);
  },

  getProfile(userId: string) {
    return api.get<BuilderProfile>(`/users/${userId}`);
  },

  updateMyProfile(data: Partial<{
    fullName: string;
    bio: string;
    college: string;
    year: number;
    githubUrl: string;
    linkedinUrl: string;
    portfolioUrl: string;
    lookingForTeam: boolean;
    availabilityStatus: AvailabilityStatus;
  }>) {
    return api.patch('/users/me', data);
  },

  updateMySkills(skills: Array<{
    skillId: string;
    proficiency: string;
    yearsExperience?: number;
  }>) {
    return api.patch('/users/me/skills', { skills });
  },

  getAllSkills(category?: SkillCategory) {
    return api.get<Skill[]>('/users/skills', category ? { category } : undefined);
  },
};
