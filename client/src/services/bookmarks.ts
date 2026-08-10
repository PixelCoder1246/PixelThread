import api from '@/lib/api';
import type { Post, ApiResponse } from '@/types';

export const bookmarksService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<{ posts: Post[]; pagination: unknown }> {
    const res = await api.get('/me/bookmarks', { params });
    return res.data.data;
  },

  async toggle(postId: string): Promise<{ bookmarked: boolean }> {
    const res = await api.post<ApiResponse<{ bookmarked: boolean }>>(`/posts/${postId}/bookmark`);
    return res.data.data;
  },

  async getStatus(postId: string): Promise<{ isBookmarked: boolean }> {
    const res = await api.get<ApiResponse<{ isBookmarked: boolean }>>(`/posts/${postId}/bookmark/status`);
    return res.data.data;
  },
};
