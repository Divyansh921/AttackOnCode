import { api } from '@/lib/api';
import type { Hackathon, PaginatedResponse } from '@/types';

export const hackathonsService = {
  list(filter: 'upcoming' | 'ongoing' | 'past' = 'upcoming', page?: number, limit?: number) {
    return api.get<PaginatedResponse<Hackathon>>('/hackathons', { filter, page, limit });
  },

  getHackathon(id: string) {
    return api.get<Hackathon>(`/hackathons/${id}`);
  },

  create(data: {
    name: string;
    organizer?: string;
    mode?: string;
    location?: string;
    registrationDeadline?: string;
    startDate: string;
    endDate: string;
    prizePool?: string;
    websiteUrl?: string;
    description?: string;
    themes?: string[];
  }) {
    return api.post<Hackathon>('/hackathons', data);
  },

  expressInterest(hackathonId: string) {
    return api.post(`/hackathons/${hackathonId}/interest`);
  },

  registerTeam(hackathonId: string, teamId: string) {
    return api.post(`/hackathons/${hackathonId}/register`, { teamId });
  },
};
