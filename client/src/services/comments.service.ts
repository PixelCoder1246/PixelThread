import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
} from '@/types/comment';

export interface ThreadedCommentsResponse {
  comments: Comment[];
}

export interface RepliesResponse {
  comment: Comment;
}

export const commentsService = {
  async getThreadedComments(postId: string): Promise<ThreadedCommentsResponse> {
    return api.get(API_ENDPOINTS.comments.list(postId));
  },

  async getReplies(commentId: string): Promise<RepliesResponse> {
    return api.get(API_ENDPOINTS.comments.replies(commentId));
  },

  async createComment(
    postId: string,
    data: CreateCommentInput
  ): Promise<{ comment: Comment }> {
    return api.post(API_ENDPOINTS.comments.create(postId), data);
  },

  async createReply(
    commentId: string,
    data: CreateCommentInput
  ): Promise<{ comment: Comment }> {
    return api.post(API_ENDPOINTS.comments.reply(commentId), data);
  },

  async updateComment(
    id: string,
    data: UpdateCommentInput
  ): Promise<{ comment: Comment }> {
    return api.patch(API_ENDPOINTS.comments.update(id), data);
  },

  async deleteComment(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.comments.delete(id));
  },
};
