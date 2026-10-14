import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';

export interface SearchResultPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  tags: { tag: { id: string; name: string } }[];
  author: { id: string; name: string; image?: string | null };
  views: number;
  likesCount: number;
  createdAt: string;
  publishedAt?: string | null;
}

export interface SearchResultUser {
  id: string;
  name: string;
  image?: string | null;
  postsCount: number;
  followersCount: number;
  createdAt: string;
}

export interface SearchResultTag {
  id: string;
  name: string;
  postCount: number;
}

export interface GlobalSearchResponse {
  posts: SearchResultPost[];
  users: SearchResultUser[];
  tags: SearchResultTag[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
}

export interface SuggestionsResponse {
  posts: Array<{ id: string; title: string; slug: string; excerpt?: string | null }>;
  users: Array<{ id: string; name: string; image?: string | null }>;
  tags: Array<{ id: string; name: string }>;
}

export interface TrendingResponse {
  keyword: string;
  count: number;
}

export interface SearchHistoryResponse {
  id: string;
  query: string;
  createdAt: string;
}

export interface PopularTagResponse {
  id: string;
  name: string;
  postCount: number;
}

export interface AuthorResponse {
  id: string;
  name: string;
  image?: string | null;
  postsCount: number;
  followersCount: number;
}

export interface AuthorsResponse {
  authors: AuthorResponse[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const searchService = {
  async globalSearch(params: {
    q: string;
    type?: 'all' | 'posts' | 'users' | 'tags';
    sort?: 'newest' | 'oldest' | 'mostViewed' | 'mostLiked' | 'relevance';
    page?: number;
    limit?: number;
  }): Promise<GlobalSearchResponse> {
    return api.get(API_ENDPOINTS.search.global, params);
  },

  async getSuggestions(q: string): Promise<SuggestionsResponse> {
    return api.get(API_ENDPOINTS.search.suggestions, { q });
  },

  async getTrending(): Promise<TrendingResponse[]> {
    return api.get(API_ENDPOINTS.search.trending);
  },

  async getHistory(): Promise<SearchHistoryResponse[]> {
    return api.get(API_ENDPOINTS.search.history);
  },

  async deleteHistory(): Promise<void> {
    return api.delete(API_ENDPOINTS.search.deleteHistory);
  },

  async getPopularTags(): Promise<PopularTagResponse[]> {
    return api.get(API_ENDPOINTS.search.popularTags);
  },

  async getDiscoverAuthors(page = 1, limit = 20): Promise<AuthorsResponse> {
    return api.get(API_ENDPOINTS.search.authors, { page, limit });
  },
};