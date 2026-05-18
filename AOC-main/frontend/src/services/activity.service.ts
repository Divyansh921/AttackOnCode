import { api } from '@/lib/api';
import type { Activity, Notification, PaginatedResponse, EntityType } from '@/types';

export const activityService = {
  getGlobalFeed(page?: number, limit?: number) {
    return api.get<PaginatedResponse<Activity>>('/activity', { page, limit });
  },

  getUserFeed(userId: string, page?: number, limit?: number) {
    return api.get<PaginatedResponse<Activity>>(`/activity/user/${userId}`, { page, limit });
  },

  getEntityFeed(entityType: EntityType, entityId: string, page?: number, limit?: number) {
    return api.get<PaginatedResponse<Activity>>(`/activity/${entityType}/${entityId}`, { page, limit });
  },
};

export const notificationsService = {
  getNotifications(params?: { unreadOnly?: boolean; page?: number; limit?: number }) {
    return api.get<PaginatedResponse<Notification> & { unreadCount: number }>(
      '/notifications',
      params as any,
    );
  },

  markAsRead(notificationId: string) {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead() {
    return api.patch('/notifications/read-all');
  },
};
