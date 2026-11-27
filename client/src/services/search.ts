import api from '@/lib/api';
import type { Post, User, Tag } from '@/types';

interface SearchResults {
  posts: Post[];
  users: User[];
  tags: Tag[];
}

interface SearchSuggestions {
  queries: string[];
  tags: Tag[];
}

export const searchService = {
  async search(params: {
    q: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResults & { pagination: unknown }> {
    const res = await api.get('/search', { params });
    return res.data.data;
  },

  async getSuggestions(params: { q: string }): Promise<SearchSuggestions> {
    const res = await api.get('/search/suggestions', { params });
    return res.data.data;
  },

  async getTrending(): Promise<{ queries: string[] }> {
    const res = await api.get('/search/trending');
    return res.data.data;
  },

  async getSearchHistory(): Promise<{
    queries: { query: string; createdAt: string }[];
  }> {
    const res = await api.get('/search/history');
    return res.data.data;
  },

  async clearSearchHistory(): Promise<void> {
    await api.delete('/search/history');
  },

  async getPopularTags(): Promise<Tag[]> {
    const res = await api.get('/search/popular-tags');
    return res.data.data;
  },

  async getAuthors(params: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<{ authors: User[]; pagination: unknown }> {
    const res = await api.get('/search/authors', { params });
    return res.data.data;
  },
};
