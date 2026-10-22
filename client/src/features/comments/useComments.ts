import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/services/comments.service';
import { queryKeys } from '@/lib/queryKeys';
import type { Comment } from '@/types/comment';

export function countTotalComments(comments: Comment[]): number {
  if (!comments || !Array.isArray(comments)) return 0;
  let count = 0;
  for (const c of comments) {
    count += 1;
    if (c.replies && c.replies.length > 0) {
      count += countTotalComments(c.replies);
    }
  }
  return count;
}

export function useThreadedComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.comments.list(postId),
    queryFn: async () => {
      const res = await commentsService.getThreadedComments(postId);
      // Handles both { comments: Comment[] } and direct Comment[]
      if (Array.isArray(res)) return res as Comment[];
      return res?.comments ?? [];
    },
    enabled: !!postId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function usePostCommentsCount(postId: string, fallbackCount = 0) {
  const { data: comments } = useThreadedComments(postId);
  if (!comments) return fallbackCount;
  return countTotalComments(comments);
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      commentsService.createComment(postId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookmarks.all,
      });
    },
  });
}

export function useCreateReply(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) =>
      commentsService.createReply(commentId, { content, parentId: commentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookmarks.all,
      });
    },
  });
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => commentsService.updateComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(postId),
      });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookmarks.all,
      });
    },
  });
}
