import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type { PostListItem } from '@/types/post';
import type { UserProfile } from '@/types/user';

export interface UserPostsResponse {
  posts: PostListItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const usersService = {
  async getUserPosts(
    userId: string,
    page = 1,
    limit = 10,
    sort = 'newest'
  ): Promise<UserPostsResponse> {
    return api.get(API_ENDPOINTS.users.posts(userId), { page, limit, sort });
  },
};