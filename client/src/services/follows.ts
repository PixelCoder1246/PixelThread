import api from '@/lib/api';
import type { User } from '@/types';

export const followsService = {
  async getFollowers(userId: string, params?: { page?: number; limit?: number }): Promise<{ followers: User[]; pagination: unknown }> {
    const res = await api.get(`/users/${userId}/followers`, { params });
    return res.data.data;
  },

  async getFollowing(userId: string, params?: { page?: number; limit?: number }): Promise<{ following: User[]; pagination: unknown }> {
    const res = await api.get(`/users/${userId}/following`, { params });
    return res.data.data;
  },

  async follow(userId: string): Promise<void> {
    await api.post(`/users/${userId}/follow`);
  },

  async unfollow(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/follow`);
  },
};
