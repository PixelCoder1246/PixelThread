import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookmarksService } from '@/services/bookmarks.service';
import { queryKeys } from '@/lib/queryKeys';

export function useBookmarkStatus(postId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookmarks.status(postId),
    queryFn: () => bookmarksService.getBookmarkStatus(postId),
    enabled: enabled && !!postId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useToggleBookmark(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const status = queryClient.getQueryData(
        queryKeys.bookmarks.status(postId)
      ) as { isBookmarked: boolean } | undefined;
      if (status?.isBookmarked) {
        return bookmarksService.removeBookmark(postId);
      }
      return bookmarksService.bookmarkPost(postId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.bookmarks.status(postId),
      });
      const prev = queryClient.getQueryData(
        queryKeys.bookmarks.status(postId)
      ) as { isBookmarked: boolean } | undefined;
      if (prev !== undefined) {
        queryClient.setQueryData(queryKeys.bookmarks.status(postId), {
          isBookmarked: !prev.isBookmarked,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(queryKeys.bookmarks.status(postId), ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookmarks.status(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
    },
  });
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => bookmarksService.removeBookmark(postId),
    onSuccess: (_data, postId) => {
      queryClient.setQueryData(queryKeys.bookmarks.status(postId), {
        isBookmarked: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
    },
  });
}

export function useMyBookmarks(page = 1, limit = 10, sort = 'newest') {
  return useQuery({
    queryKey: queryKeys.bookmarks.list(page, limit, sort),
    queryFn: () => bookmarksService.getMyBookmarks(page, limit, sort),
    staleTime: 1000 * 60 * 2,
  });
}
