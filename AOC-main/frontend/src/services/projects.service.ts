import { api } from '@/lib/api';
import type { Project, ProjectNeed, PaginatedResponse, ProjectStatus } from '@/types';

export const projectsService = {
  list(params?: {
    status?: ProjectStatus;
    needsContributors?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return api.get<PaginatedResponse<Project>>('/projects', params as any);
  },

  getProject(id: string) {
    return api.get<Project>(`/projects/${id}`);
  },

  create(data: {
    name: string;
    description?: string;
    githubRepo?: string;
    demoUrl?: string;
    techStack?: string[];
    ownerTeamId?: string;
  }) {
    return api.post<Project>('/projects', data);
  },

  update(projectId: string, data: Partial<{
    name: string;
    description: string;
    githubRepo: string;
    demoUrl: string;
    techStack: string[];
    status: ProjectStatus;
  }>) {
    return api.patch<Project>(`/projects/${projectId}`, data);
  },

  addNeed(projectId: string, data: {
    roleTitle: string;
    description?: string;
    skills?: string[];
  }) {
    return api.post<ProjectNeed>(`/projects/${projectId}/needs`, data);
  },
};
