import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';

export interface OverallAnalytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageViewsPerPost: number;
  averageLikesPerPost: number;
}

export interface PostAnalyticsItem {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
  views: number;
  likes: number;
  comments: number;
}

export interface PostsAnalyticsResponse {
  posts: PostAnalyticsItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TopPostAnalytics {
  id: string;
  title: string;
  slug: string;
  views: number;
  likes: number;
  comments: number;
}

export interface PostAnalyticsDetail {
  views: number;
  likes: number;
  comments: number;
}

export const analyticsService = {
  async getMyOverallAnalytics(): Promise<OverallAnalytics> {
    return api.get(API_ENDPOINTS.analytics.myOverall);
  },

  async getMyPostsAnalytics(
    page = 1,
    limit = 10,
    sort = 'newest'
  ): Promise<PostsAnalyticsResponse> {
    return api.get(API_ENDPOINTS.analytics.myPosts, { page, limit, sort });
  },

  async getTopPosts(limit = 5, sort = 'views'): Promise<TopPostAnalytics[]> {
    return api.get(API_ENDPOINTS.analytics.topPosts, { limit, sort });
  },

  async getPostAnalytics(postId: string): Promise<PostAnalyticsDetail> {
    return api.get(API_ENDPOINTS.posts.analytics(postId));
  },

  async recordView(postId: string): Promise<void> {
    return api.post(API_ENDPOINTS.posts.view(postId));
  },
};
