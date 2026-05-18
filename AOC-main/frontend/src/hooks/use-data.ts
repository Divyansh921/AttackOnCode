import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hackathonsService } from '@/services/hackathons.service';
import { projectsService } from '@/services/projects.service';
import { activityService, notificationsService } from '@/services/activity.service';
import type { ProjectStatus, EntityType } from '@/types';
import { usersService } from '@/services/users.service';

// ============================================================================
// BUILDERS / USERS
// ============================================================================

export const builderKeys = {
  all: ['builders'] as const,
  lists: () => [...builderKeys.all, 'list'] as const,
  list: (params?: any) => [...builderKeys.lists(), params] as const,
  details: () => [...builderKeys.all, 'detail'] as const,
  detail: (id: string) => [...builderKeys.details(), id] as const,
};

export function useBuilders(params?: any) {
  return useQuery({
    queryKey: builderKeys.list(params),
    queryFn: () => usersService.search(params || {}),
    staleTime: 60_000,
  });
}

// ============================================================================
// HACKATHONS
// ============================================================================

export const hackathonKeys = {
  all: ['hackathons'] as const,
  lists: () => [...hackathonKeys.all, 'list'] as const,
  list: (filter: string) => [...hackathonKeys.lists(), filter] as const,
  details: () => [...hackathonKeys.all, 'detail'] as const,
  detail: (id: string) => [...hackathonKeys.details(), id] as const,
};

export function useHackathons(filter: 'upcoming' | 'ongoing' | 'past' = 'upcoming') {
  return useQuery({
    queryKey: hackathonKeys.list(filter),
    queryFn: () => hackathonsService.list(filter),
    staleTime: 60_000,
  });
}

export function useHackathon(id: string) {
  return useQuery({
    queryKey: hackathonKeys.detail(id),
    queryFn: () => hackathonsService.getHackathon(id),
    enabled: !!id,
  });
}

export function useExpressInterest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hackathonsService.expressInterest,
    onSuccess: () => qc.invalidateQueries({ queryKey: hackathonKeys.all }),
  });
}

export function useRegisterTeamForHackathon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hackathonId, teamId }: { hackathonId: string; teamId: string }) =>
      hackathonsService.registerTeam(hackathonId, teamId),
    onSuccess: () => qc.invalidateQueries({ queryKey: hackathonKeys.all }),
  });
}

// ============================================================================
// PROJECTS
// ============================================================================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params: any) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects(params?: {
  status?: ProjectStatus;
  needsContributors?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsService.list(params),
    staleTime: 30_000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsService.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.lists() }),
  });
}

// ============================================================================
// ACTIVITY FEED
// ============================================================================

export const activityKeys = {
  global: (page?: number) => ['activity', 'global', page] as const,
  user: (userId: string, page?: number) => ['activity', 'user', userId, page] as const,
  entity: (type: EntityType, id: string) => ['activity', 'entity', type, id] as const,
};

export function useGlobalFeed(page = 1) {
  return useQuery({
    queryKey: activityKeys.global(page),
    queryFn: () => activityService.getGlobalFeed(page),
    staleTime: 10_000, // activity feeds refresh faster
  });
}

export function useUserFeed(userId: string, page = 1) {
  return useQuery({
    queryKey: activityKeys.user(userId, page),
    queryFn: () => activityService.getUserFeed(userId, page),
    enabled: !!userId,
  });
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: any) => [...notificationKeys.all, params] as const,
};

export function useNotifications(params?: { unreadOnly?: boolean; page?: number }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsService.getNotifications(params),
    staleTime: 5_000, // notifications check frequently
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
