'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postsService } from '@/services/posts';
import type { PostFormData } from '@/types';

export function usePosts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => postsService.getAll(params),
  });
}

export function useInfinitePosts(limit = 10) {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => postsService.getAll({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination as { hasNextPage: boolean; page: number };
      return pagination.hasNextPage ? pagination.page + 1 : undefined;
    },
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsService.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostFormData) => postsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PostFormData>) => postsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useSearchPosts(params: {
  q: string;
  tag?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['posts', 'search', params],
    queryFn: () => postsService.search(params),
    enabled: !!params.q && params.q.length >= 2,
  });
}

export function usePostSeo(id: string) {
  return useQuery({
    queryKey: ['post', id, 'seo'],
    queryFn: () => postsService.getSeo(id),
    enabled: !!id,
  });
}

export function useUpdatePostSeo(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof postsService.updateSeo>[1]) => postsService.updateSeo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id, 'seo'] });
    },
  });
}

export function useRecordView(id: string) {
  return useMutation({
    mutationFn: () => postsService.recordView(id),
  });
}

export function usePostAnalytics(id: string) {
  return useQuery({
    queryKey: ['post', id, 'analytics'],
    queryFn: () => postsService.getAnalytics(id),
    enabled: !!id,
  });
}
