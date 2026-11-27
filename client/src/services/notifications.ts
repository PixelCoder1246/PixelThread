import api from '@/lib/api';
import type { Notification, ApiResponse } from '@/types';

export const notificationsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ notifications: Notification[]; pagination: unknown }> {
    const res = await api.get('/notifications', { params });
    return res.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return res.data.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async deleteRead(): Promise<void> {
    await api.delete('/notifications/read');
  },
};
