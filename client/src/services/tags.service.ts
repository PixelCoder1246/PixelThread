import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type { PostListItem } from '@/types/post';

export interface Tag {
  id: string;
  name: string;
  postCount: number;
}

export interface TagsResponse {
  tags: Tag[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TagPostsResponse {
  tag: { id: string; name: string };
  posts: PostListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const tagsService = {
  async getAllTags(page = 1, limit = 20, sort = 'alphabetical'): Promise<TagsResponse> {
    return api.get(API_ENDPOINTS.tags.list, { page, limit, sort });
  },

  async getTagPosts(name: string, page = 1, limit = 10): Promise<TagPostsResponse> {
    return api.get(API_ENDPOINTS.tags.posts(name), { page, limit });
  },
};