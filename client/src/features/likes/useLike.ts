import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  likesService,
  type LikeResponse,
  type LikesListResponse,
} from '@/services/likes.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/features/auth/useAuth';

export function usePostLikeStatus(postId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.likes.postStatus(postId),
    queryFn: () => likesService.getPostLikeStatus(postId),
    enabled: enabled && !!postId,
    staleTime: 1000 * 60,
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

export function useTogglePostLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => likesService.togglePostLike(postId),
    onMutate: async () => {
      // Cancel ongoing queries for this post's like status and likes count
      await queryClient.cancelQueries({
        queryKey: queryKeys.likes.postStatus(postId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.likes.postLikes(postId, 1, 20),
      });

      const prevStatus = queryClient.getQueryData(
        queryKeys.likes.postStatus(postId)
      ) as { liked: boolean } | undefined;

      const prevLikes = queryClient.getQueryData(
        queryKeys.likes.postLikes(postId, 1, 20)
      ) as LikesListResponse | undefined;

      const wasLiked = prevStatus?.liked ?? false;
      const newLiked = !wasLiked;

      // Optimistically set like status
      queryClient.setQueryData(queryKeys.likes.postStatus(postId), {
        liked: newLiked,
      });

      // Optimistically update like count if cached
      if (prevLikes) {
        queryClient.setQueryData(queryKeys.likes.postLikes(postId, 1, 20), {
          ...prevLikes,
          likeCount: Math.max(0, prevLikes.likeCount + (newLiked ? 1 : -1)),
        });
      }

      return { prevStatus, prevLikes };
    },
    onSuccess: (res: LikeResponse) => {
      if (res) {
        // Set exact status and count returned from server
        queryClient.setQueryData(queryKeys.likes.postStatus(postId), {
          liked: res.liked,
        });

        queryClient.setQueriesData(
          { queryKey: ['likes', 'post', postId] },
          (old: unknown) => {
            if (!old || typeof old !== 'object') return old;
            const typedOld = old as LikesListResponse;
            return {
              ...typedOld,
              likeCount: res.likeCount,
            };
          }
        );
      }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevStatus) {
        queryClient.setQueryData(
          queryKeys.likes.postStatus(postId),
          ctx.prevStatus
        );
      }
      if (ctx?.prevLikes) {
        queryClient.setQueryData(
          queryKeys.likes.postLikes(postId, 1, 20),
          ctx.prevLikes
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.likes.postStatus(postId),
      });
      queryClient.invalidateQueries({
        queryKey: ['likes', 'post', postId],
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
    },
  });
}

export function usePostLikeInfo(postId: string, fallbackLikes = 0) {
  const { isAuthenticated } = useAuth();
  const { data: statusData } = usePostLikeStatus(postId, isAuthenticated);
  const { data: likesData } = usePostLikes(postId, 1, 20);
  const toggleLike = useTogglePostLike(postId);

  const isLiked = statusData?.liked ?? false;
  const likeCount =
    likesData?.likeCount !== undefined ? likesData.likeCount : fallbackLikes;

  return {
    isLiked,
    likeCount,
    toggleLike,
  };
}

export function useToggleCommentLike(commentId: string, postId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => likesService.toggleCommentLike(commentId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.likes.commentStatus(commentId),
      });
      if (postId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.list(postId),
        });
      }
    },
  });
}
