import api from '@/lib/api';

export const reportsService = {
  async reportPost(postId: string, data: { reason: string; details?: string }): Promise<void> {
    await api.post(`/posts/${postId}/report`, data);
  },

  async reportComment(commentId: string, data: { reason: string; details?: string }): Promise<void> {
    await api.post(`/comments/${commentId}/report`, data);
  },

  async reportUser(userId: string, data: { reason: string; details?: string }): Promise<void> {
    await api.post(`/users/${userId}/report`, data);
  },
};
