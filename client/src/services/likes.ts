import api from '@/lib/api';
import type { ApiResponse } from '@/types';

export const likesService = {
  async togglePost(
    postId: string
  ): Promise<{ liked: boolean; likeCount: number }> {
    const res = await api.post<
      ApiResponse<{ liked: boolean; likeCount: number }>
    >(`/posts/${postId}/like`);
    return res.data.data;
  },

  async toggleComment(
    commentId: string
  ): Promise<{ liked: boolean; likeCount: number }> {
    const res = await api.post<
      ApiResponse<{ liked: boolean; likeCount: number }>
    >(`/comments/${commentId}/like`);
    return res.data.data;
  },

  async getPostLikes(postId: string): Promise<
    {
      id: string;
      userId: string;
      user: { id: string; name: string; image: string | null };
      createdAt: string;
    }[]
  > {
    const res = await api.get<ApiResponse<{ likes: unknown[] }>>(
      `/posts/${postId}/likes`
    );
    return res.data.data.likes as never;
  },

  async getPostLikeStatus(postId: string): Promise<{ isLiked: boolean }> {
    const res = await api.get<ApiResponse<{ isLiked: boolean }>>(
      `/posts/${postId}/like-status`
    );
    return res.data.data;
  },

  async getCommentLikeStatus(commentId: string): Promise<{ isLiked: boolean }> {
    const res = await api.get<ApiResponse<{ isLiked: boolean }>>(
      `/comments/${commentId}/like-status`
    );
    return res.data.data;
  },
};
