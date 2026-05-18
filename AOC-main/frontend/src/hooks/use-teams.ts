import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsService, type TeamSearchParams } from '@/services/teams.service';

// ── QUERY KEYS ──────────────────────────────────────────────────────────

export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (params: TeamSearchParams) => [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// ── QUERIES ─────────────────────────────────────────────────────────────

/** Search teams with filters. Powers /teams page. */
export function useTeams(params: TeamSearchParams = {}) {
  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: () => teamsService.search(params),
    staleTime: 15_000,
  });
}

/** Get team details. Powers /teams/[id]. */
export function useTeam(teamId: string) {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => teamsService.getTeam(teamId),
    enabled: !!teamId,
  });
}

// ── MUTATIONS ───────────────────────────────────────────────────────────

/** Create a new team. */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamsService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

/** Create a recruitment opening on a team. */
export function useCreateOpening(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; description?: string; requiredSkills?: string[]; slots?: number }) =>
      teamsService.createOpening(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
    },
  });
}

/** Apply to join a team through an opening. */
export function useApplyToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ openingId, message }: { openingId: string; message?: string }) =>
      teamsService.applyToTeam(openingId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** Accept a team application (leader action). */
export function useAcceptApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamsService.acceptApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** Reject a team application (leader action). */
export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamsService.rejectApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
