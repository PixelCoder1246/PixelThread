import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { postsService } from '@/services/posts.service';
import { queryKeys } from '@/lib/queryKeys';
import type { PostSearchParams } from '@/types/post';

export function usePosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: queryKeys.posts.list(page, limit),
    queryFn: () => postsService.getAllPosts(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useInfinitePosts(limit = 10) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.posts.lists(), 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      postsService.getAllPosts(pageParam as number, limit),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(slug),
    queryFn: () => postsService.getPostBySlug(slug),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });
}

export function useSearchPosts(params: PostSearchParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.search(
      params as unknown as Record<string, unknown>
    ),
    queryFn: () => postsService.searchPosts(params),
    staleTime: 1000 * 30,
    enabled: enabled && !!params.q,
  });
}

export function usePostAnalytics(postId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.analytics(postId),
    queryFn: () => postsService.getPostAnalytics(postId),
    staleTime: 1000 * 60,
    enabled: enabled && !!postId,
  });
}

export function useRecordView() {
  return useMutation({
    mutationFn: (postId: string) => postsService.recordView(postId),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
