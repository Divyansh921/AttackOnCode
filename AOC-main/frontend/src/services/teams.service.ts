import { api } from '@/lib/api';
import type { Team, TeamOpening, TeamApplication, PaginatedResponse, TeamStatus } from '@/types';

export interface TeamSearchParams {
  search?: string;
  status?: TeamStatus;
  needsRole?: string;
  hackathonId?: string;
  page?: number;
  limit?: number;
}

export const teamsService = {
  search(params: TeamSearchParams) {
    return api.get<PaginatedResponse<Team>>('/teams', params as any);
  },

  getTeam(teamId: string) {
    return api.get<Team>(`/teams/${teamId}`);
  },

  createTeam(data: {
    name: string;
    description?: string;
    maxMembers?: number;
  }) {
    return api.post<Team>('/teams', data);
  },

  createOpening(teamId: string, data: {
    title: string;
    description?: string;
    requiredSkills?: string[];
    slots?: number;
  }) {
    return api.post<TeamOpening>(`/teams/${teamId}/openings`, data);
  },

  applyToTeam(openingId: string, message?: string) {
    return api.post<TeamApplication>(`/teams/openings/${openingId}/apply`, { message });
  },

  acceptApplication(applicationId: string) {
    return api.patch(`/teams/applications/${applicationId}/accept`);
  },

  rejectApplication(applicationId: string) {
    return api.patch(`/teams/applications/${applicationId}/reject`);
  },
};
