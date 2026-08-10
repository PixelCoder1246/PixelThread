import api from '@/lib/api';
import type { User, Post, ApiResponse } from '@/types';

export const adminService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    role?: string;
  }): Promise<{ users: User[]; pagination: unknown }> {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },

  async getUserById(userId: string): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>(`/admin/users/${userId}`);
    return res.data.data.user;
  },

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
    const res = await api.patch<ApiResponse<{ user: User }>>(`/admin/users/${userId}/role`, { role });
    return res.data.data.user;
  },

  async banUser(userId: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/ban`);
  },

  async unbanUser(userId: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/unban`);
  },

  async verifyUser(userId: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/verify`);
  },

  async getPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ posts: Post[]; pagination: unknown }> {
    const res = await api.get('/admin/posts', { params });
    return res.data.data;
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/admin/posts/${postId}`);
  },

  async archivePost(postId: string): Promise<void> {
    await api.patch(`/admin/posts/${postId}/archive`);
  },

  async restorePost(postId: string): Promise<void> {
    await api.patch(`/admin/posts/${postId}/restore`);
  },

  async featurePost(postId: string): Promise<void> {
    await api.patch(`/admin/posts/${postId}/feature`);
  },

  async unfeaturePost(postId: string): Promise<void> {
    await api.patch(`/admin/posts/${postId}/unfeature`);
  },

  async pinPost(postId: string): Promise<void> {
    await api.patch(`/admin/posts/${postId}/pin`);
  },

  async unpinPost(postId: string): Promise<void> {
    await api.patch(`/admin/posts/${postId}/unpin`);
  },

  async getComments(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ comments: unknown[]; pagination: unknown }> {
    const res = await api.get('/admin/comments', { params });
    return res.data.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/admin/comments/${commentId}`);
  },

  async hideComment(commentId: string): Promise<void> {
    await api.patch(`/admin/comments/${commentId}/hide`);
  },

  async approveComment(commentId: string): Promise<void> {
    await api.patch(`/admin/comments/${commentId}/approve`);
  },

  async getReports(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ reports: unknown[]; pagination: unknown }> {
    const res = await api.get('/admin/reports', { params });
    return res.data.data;
  },

  async getReportById(reportId: string): Promise<unknown> {
    const res = await api.get(`/admin/reports/${reportId}`);
    return res.data.data;
  },

  async updateReportStatus(reportId: string, status: string): Promise<void> {
    await api.patch(`/admin/reports/${reportId}/status`, { status });
  },

  async resolveReport(reportId: string): Promise<void> {
    await api.patch(`/admin/reports/${reportId}/resolve`);
  },

  async rejectReport(reportId: string): Promise<void> {
    await api.patch(`/admin/reports/${reportId}/reject`);
  },

  async getReportAnalytics(): Promise<unknown> {
    const res = await api.get('/admin/reports/analytics');
    return res.data.data;
  },

  async getLogs(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ logs: unknown[]; pagination: unknown }> {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data.data;
  },

  async getLogStats(): Promise<unknown> {
    const res = await api.get('/admin/audit-logs/stats');
    return res.data.data;
  },

  async getMedia(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ media: unknown[]; pagination: unknown }> {
    const res = await api.get('/admin/media', { params });
    return res.data.data;
  },

  async deleteMedia(mediaId: string): Promise<void> {
    await api.delete(`/admin/media/${mediaId}`);
  },

  async getOrphanedMedia(): Promise<unknown[]> {
    const res = await api.get('/admin/media/orphaned');
    return res.data.data;
  },

  async deleteOrphanedMedia(): Promise<void> {
    await api.delete('/admin/media/orphaned');
  },

  async getSettings(): Promise<unknown> {
    const res = await api.get('/admin/settings');
    return res.data.data;
  },

  async updateSettings(data: unknown): Promise<unknown> {
    const res = await api.patch('/admin/settings', data);
    return res.data.data;
  },

  async getAnnouncements(): Promise<unknown[]> {
    const res = await api.get('/admin/announcements');
    return res.data.data;
  },

  async createAnnouncement(data: { title: string; content: string }): Promise<void> {
    await api.post('/admin/announcements', data);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await api.delete(`/admin/announcements/${id}`);
  },

  async adminSearch(params: { q: string }): Promise<unknown> {
    const res = await api.get('/admin/search', { params });
    return res.data.data;
  },
};
