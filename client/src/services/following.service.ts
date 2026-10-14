import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type { UserProfile } from '@/types/user';

export interface FollowersResponse {
  users: UserProfile[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface FollowingResponse {
  users: UserProfile[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface FollowResponse {
  following: boolean;
  followerCount: number;
  followingCount: number;
}

export const followService = {
  async getFollowers(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<FollowersResponse> {
    return api.get(API_ENDPOINTS.follow.followers(userId), { page, limit });
  },

  async getFollowing(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<FollowingResponse> {
    return api.get(API_ENDPOINTS.follow.following(userId), { page, limit });
  },

  async followUser(userId: string): Promise<FollowResponse> {
    return api.post(API_ENDPOINTS.follow.follow(userId));
  },

  async unfollowUser(userId: string): Promise<FollowResponse> {
    return api.delete(API_ENDPOINTS.follow.unfollow(userId));
  },
};
