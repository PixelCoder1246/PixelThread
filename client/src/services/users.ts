import api from '@/lib/api';
import type { User, Post, ApiResponse, ProfileFormData } from '@/types';

export const usersService = {
  async getProfile(id: string): Promise<User> {
    const res = await api.get<ApiResponse<{ posts: Post[]; pagination: unknown }>>(`/users/${id}/posts`, { params: { limit: 1 } });
    const author = res.data.data.posts?.[0]?.author;
    if (author) return { ...author, email: '', role: 'USER', isEmailVerified: false, bio: null, updatedAt: '' } as User;
    throw new Error('User not found');
  },

  async updateProfile(data: ProfileFormData): Promise<User> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.bio) formData.append('bio', data.bio);
    if (data.image) formData.append('image', data.image);

    const res = await api.patch<ApiResponse<{ user: User }>>('/me/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.user;
  },

  async getUserPosts(id: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ posts: Post[]; pagination: unknown }> {
    const res = await api.get(`/users/${id}/posts`, { params });
    return res.data.data;
  },

  async getSettings(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/me/settings');
    return res.data.data.user;
  },

  async updateProfileSettings(data: {
    name?: string;
    bio?: string;
  }): Promise<User> {
    const res = await api.patch<ApiResponse<{ user: User }>>('/me/profile', data);
    return res.data.data.user;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.patch('/me/password', data);
  },

  async updateEmail(data: { email: string; currentPassword: string }): Promise<void> {
    await api.patch('/me/email', data);
  },

  async updatePrivacy(data: Record<string, boolean>): Promise<void> {
    await api.patch('/me/privacy', data);
  },

  async updateNotificationPreferences(data: Record<string, boolean>): Promise<void> {
    await api.patch('/me/notifications', data);
  },

  async updatePreferences(data: Record<string, unknown>): Promise<void> {
    await api.patch('/me/preferences', data);
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post<ApiResponse<{ user: User }>>('/me/avatar', formData);
    return res.data.data.user;
  },

  async deleteAvatar(): Promise<void> {
    await api.delete('/me/avatar');
  },

  async uploadCover(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('cover', file);
    const res = await api.post<ApiResponse<{ user: User }>>('/me/cover', formData);
    return res.data.data.user;
  },

  async deleteCover(): Promise<void> {
    await api.delete('/me/cover');
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/me');
  },
};
