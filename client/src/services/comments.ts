import api from '@/lib/api';
import type { Comment, ApiResponse } from '@/types';

export const commentsService = {
  async getByPost(postId: string): Promise<Comment[]> {
    const res = await api.get<ApiResponse<{ comments: Comment[] }>>(
      `/posts/${postId}/comments`
    );
    return res.data.data.comments;
  },

  async create(postId: string, content: string): Promise<Comment> {
    const res = await api.post<ApiResponse<{ comment: Comment }>>(
      `/posts/${postId}/comments`,
      { content }
    );
    return res.data.data.comment;
  },

  async reply(commentId: string, content: string): Promise<Comment> {
    const res = await api.post<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}/replies`,
      { content }
    );
    return res.data.data.comment;
  },

  async update(commentId: string, content: string): Promise<Comment> {
    const res = await api.patch<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}`,
      { content }
    );
    return res.data.data.comment;
  },

  async delete(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },

  async getReplies(commentId: string): Promise<Comment> {
    const res = await api.get<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}/replies`
    );
    return res.data.data.comment;
  },
};
