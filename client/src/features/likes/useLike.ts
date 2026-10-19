import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { likesService } from '@/services/likes.service';
import { queryKeys } from '@/lib/queryKeys';

export function usePostLikeStatus(postId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.likes.postStatus(postId),
    queryFn: () => likesService.getPostLikeStatus(postId),
    enabled: enabled && !!postId,
    staleTime: 1000 * 60,
  });
}

export function useTogglePostLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => likesService.togglePostLike(postId),
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.likes.postStatus(postId),
      });
      const prev = queryClient.getQueryData(
        queryKeys.likes.postStatus(postId)
      ) as { liked: boolean } | undefined;
      if (prev) {
        queryClient.setQueryData(queryKeys.likes.postStatus(postId), {
          ...prev,
          liked: !prev.liked,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.likes.postStatus(postId), ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.likes.postStatus(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useToggleCommentLike(commentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => likesService.toggleCommentLike(commentId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.likes.commentStatus(commentId),
      });
    },
  });
}

export function usePostLikes(postId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.likes.postLikes(postId, page, limit),
    queryFn: () => likesService.getPostLikes(postId, page, limit),
    enabled: !!postId,
    staleTime: 1000 * 60,
  });
}
