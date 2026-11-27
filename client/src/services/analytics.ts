import api from '@/lib/api';
import type {
  Analytics,
  PostAnalyticsItem,
  TopPost,
  AdminAnalytics,
} from '@/types';

export const analyticsService = {
  async getMyAnalytics(): Promise<Analytics> {
    const res = await api.get('/me/analytics');
    return res.data.data;
  },

  async getMyPostsAnalytics(params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ posts: PostAnalyticsItem[]; pagination: unknown }> {
    const res = await api.get('/me/posts/analytics', { params });
    return res.data.data;
  },

  async getTopPosts(params?: {
    limit?: number;
    sort?: string;
  }): Promise<TopPost[]> {
    const res = await api.get('/me/posts/top', { params });
    return res.data.data;
  },

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await api.get('/admin/analytics');
    return res.data.data;
  },

  async getPublicAnalytics(): Promise<AdminAnalytics> {
    const res = await api.get('/analytics/public');
    return res.data.data;
  },
};
