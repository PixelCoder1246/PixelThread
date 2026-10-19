import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/search.service';
import { queryKeys } from '@/lib/queryKeys';

export interface UseSearchParams {
  q: string;
  type?: 'all' | 'posts' | 'users' | 'tags';
  sort?: 'newest' | 'oldest' | 'mostViewed' | 'mostLiked' | 'relevance';
  page?: number;
  limit?: number;
}

export function useSearch(params: UseSearchParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.global(
      params as unknown as Record<string, unknown>
    ),
    queryFn: () => searchService.globalSearch(params),
    enabled: enabled && params.q.trim().length >= 2,
    staleTime: 1000 * 30,
  });
}

export function useSearchSuggestions(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.suggestions(q),
    queryFn: () => searchService.getSuggestions(q),
    enabled: enabled && q.trim().length >= 2,
    staleTime: 1000 * 60,
  });
}

export function useTrendingSearches() {
  return useQuery({
    queryKey: queryKeys.search.trending,
    queryFn: () => searchService.getTrending(),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePopularTags() {
  return useQuery({
    queryKey: queryKeys.search.popularTags,
    queryFn: () => searchService.getPopularTags(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDiscoverAuthors(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.search.authors(page, limit),
    queryFn: () => searchService.getDiscoverAuthors(page, limit),
    staleTime: 1000 * 60 * 5,
  });
}
