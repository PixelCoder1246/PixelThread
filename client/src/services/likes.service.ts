import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface LikesListResponse {
  likeCount: number;
  users: Array<{
    id: string;
    name: string;
    image?: string | null;
  }>;
}

export interface LikeStatusResponse {
  liked: boolean;
}

export const likesService = {
  async togglePostLike(postId: string): Promise<LikeResponse> {
    return api.post(API_ENDPOINTS.likes.togglePost(postId));
  },

  async toggleCommentLike(commentId: string): Promise<LikeResponse> {
    return api.post(API_ENDPOINTS.likes.toggleComment(commentId));
  },

  async getPostLikes(postId: string, page = 1, limit = 20): Promise<LikesListResponse> {
    return api.get(API_ENDPOINTS.likes.postLikes(postId), { page, limit });
  },

  async getCommentLikes(commentId: string, page = 1, limit = 20): Promise<LikesListResponse> {
    return api.get(API_ENDPOINTS.likes.commentLikes(commentId), { page, limit });
  },

  async getPostLikeStatus(postId: string): Promise<LikeStatusResponse> {
    return api.get(API_ENDPOINTS.likes.postStatus(postId));
  },

  async getCommentLikeStatus(commentId: string): Promise<LikeStatusResponse> {
    return api.get(API_ENDPOINTS.likes.commentStatus(commentId));
  },
};