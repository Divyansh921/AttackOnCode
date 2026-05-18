import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type BuilderSearchParams } from '@/services/users.service';
import type { SkillCategory } from '@/types';

// ── QUERY KEYS ──────────────────────────────────────────────────────────

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: BuilderSearchParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  skills: (category?: SkillCategory) => [...userKeys.all, 'skills', category] as const,
};

// ── QUERIES ─────────────────────────────────────────────────────────────

/** Search builders with filters. Powers the /builders page. */
export function useBuilders(params: BuilderSearchParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersService.search(params),
    staleTime: 30_000, // 30 seconds before refetch
  });
}

/** Get a single builder profile. Powers /builders/[id]. */
export function useBuilderProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => usersService.getProfile(userId),
    enabled: !!userId,
  });
}

/** Get all available skills for filter dropdowns. */
export function useSkills(category?: SkillCategory) {
  return useQuery({
    queryKey: userKeys.skills(category),
    queryFn: () => usersService.getAllSkills(category),
    staleTime: 5 * 60_000, // skills rarely change — cache 5 min
  });
}

// ── MUTATIONS ───────────────────────────────────────────────────────────

/** Update own profile. Invalidates profile cache on success. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/** Update own skills. */
export function useUpdateSkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.updateMySkills,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
