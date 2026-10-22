import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type { Notification } from '@/types/notification';

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadResponse {
  notification: Notification;
}

export interface MarkAllReadResponse {
  count: number;
}

export interface DeleteResponse {
  count: number;
}

export const notificationsService = {
  async getNotifications(
    page = 1,
    limit = 20,
    filters?: { type?: string; isRead?: boolean; read?: string }
  ): Promise<NotificationsResponse> {
    const params: Record<string, string | number | boolean | undefined> = {
      page,
      limit,
    };
    if (filters?.type) params.type = filters.type;
    if (filters?.read !== undefined) params.read = filters.read;
    else if (filters?.isRead !== undefined)
      params.read = String(filters.isRead);
    return api.get(API_ENDPOINTS.notifications.list, params);
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return api.get(API_ENDPOINTS.notifications.unreadCount);
  },

  async markAsRead(id: string): Promise<MarkReadResponse> {
    return api.patch(API_ENDPOINTS.notifications.markRead(id));
  },

  async markAllAsRead(): Promise<MarkAllReadResponse> {
    return api.patch(API_ENDPOINTS.notifications.markAllRead);
  },

  async deleteNotification(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.notifications.delete(id));
  },

  async deleteAllRead(): Promise<DeleteResponse> {
    return api.delete(API_ENDPOINTS.notifications.deleteAllRead);
  },
};
