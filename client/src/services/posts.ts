import api from '@/lib/api';
import type { Post, PostFormData, ApiResponse, SeoMetadata } from '@/types';

export const postsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ posts: Post[]; pagination: unknown }> {
    const res = await api.get('/posts', { params });
    return res.data.data;
  },

  async getBySlug(slug: string): Promise<Post> {
    const res = await api.get<ApiResponse<{ post: Post }>>(`/posts/${slug}`);
    return res.data.data.post;
  },

  async create(data: PostFormData): Promise<Post> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    formData.append('status', data.status);
    formData.append('visibility', data.visibility);
    formData.append('tags', JSON.stringify(data.tags));
    if (data.files) {
      data.files.forEach((file) => formData.append('files', file));
    }

    const res = await api.post<ApiResponse<{ post: Post }>>(
      '/posts',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data.data.post;
  },

  async update(id: string, data: Partial<PostFormData>): Promise<Post> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'tags' && value) {
        formData.append('tags', JSON.stringify(value));
      } else if (key === 'files' && value) {
        (value as File[]).forEach((file) => formData.append('files', file));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const res = await api.put<ApiResponse<{ post: Post }>>(
      `/posts/${id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data.data.post;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async search(params: {
    q: string;
    tag?: string;
    authorId?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ posts: Post[]; pagination: unknown }> {
    const res = await api.get('/posts/search', { params });
    return res.data.data;
  },

  async getSeo(id: string): Promise<SeoMetadata> {
    const res = await api.get<ApiResponse<SeoMetadata>>(`/posts/${id}/seo`);
    return res.data.data;
  },

  async updateSeo(
    id: string,
    data: Partial<SeoMetadata>
  ): Promise<SeoMetadata> {
    const res = await api.patch<ApiResponse<SeoMetadata>>(
      `/posts/${id}/seo`,
      data
    );
    return res.data.data;
  },

  async recordView(id: string): Promise<void> {
    await api.post(`/posts/${id}/view`);
  },

  async getAnalytics(
    id: string
  ): Promise<{ views: number; likes: number; comments: number }> {
    const res = await api.get(`/posts/${id}/analytics`);
    return res.data;
  },
};
