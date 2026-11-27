import api from '@/lib/api';
import type { Tag, Post, ApiResponse } from '@/types';

export const tagsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ tags: Tag[]; pagination: unknown }> {
    const res = await api.get('/tags', { params });
    return res.data.data;
  },

  async getPosts(
    name: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ tag: Tag; posts: Post[]; pagination: unknown }> {
    const res = await api.get(`/tags/${name}/posts`, { params });
    return res.data.data;
  },

  async create(name: string): Promise<Tag> {
    const res = await api.post<ApiResponse<{ tag: Tag }>>('/tags', { name });
    return res.data.data.tag;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};
