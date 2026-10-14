import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type { PostListItem, CreatePostInput, UpdatePostInput, PostSearchParams } from '@/types/post';
import type { ApiClient } from '@/lib/api';

const typedApi = api as ApiClient;

export interface PostsResponse {
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

export interface SearchPostsResponse {
  posts: PostListItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const postsService = {
  async getAllPosts(page = 1, limit = 10): Promise<PostsResponse> {
    return typedApi.get<PostsResponse>(API_ENDPOINTS.posts.list, { page, limit });
  },

  async getPostBySlug(slug: string): Promise<{ post: PostListItem }> {
    return typedApi.get(API_ENDPOINTS.posts.detail(slug));
  },

  async searchPosts(params: PostSearchParams): Promise<SearchPostsResponse> {
    return typedApi.get<SearchPostsResponse>(API_ENDPOINTS.posts.search, params as Record<string, string | number | boolean | undefined>);
  },

  async createPost(data: CreatePostInput): Promise<{ post: PostListItem }> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', JSON.stringify(data.content));
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    if (data.status) formData.append('status', data.status);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    return typedApi.postForm(API_ENDPOINTS.posts.create, formData);
  },

  async updatePost(id: string, data: UpdatePostInput): Promise<{ post: PostListItem }> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', JSON.stringify(data.content));
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    if (data.status) formData.append('status', data.status);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    return typedApi.putForm(API_ENDPOINTS.posts.update(id), formData);
  },

  async deletePost(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.posts.delete(id));
  },

  async recordView(postId: string): Promise<void> {
    return api.post(API_ENDPOINTS.posts.view(postId));
  },

  async getPostAnalytics(postId: string): Promise<{ views: number; likes: number; comments: number }> {
    return api.get(API_ENDPOINTS.posts.analytics(postId));
  },

  async getPostSeo(postId: string): Promise<{ metaTitle?: string; metaDescription?: string; keywords?: string[] }> {
    return api.get(API_ENDPOINTS.posts.seo(postId));
  },

  async updatePostSeo(postId: string, data: { metaTitle?: string; metaDescription?: string; keywords?: string[] }): Promise<{ metaTitle?: string; metaDescription?: string; keywords?: string[] }> {
    return api.patch(API_ENDPOINTS.posts.seo(postId), data);
  },
};