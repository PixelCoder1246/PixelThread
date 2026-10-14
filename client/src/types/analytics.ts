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