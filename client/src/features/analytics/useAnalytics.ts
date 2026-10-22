import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/features/auth/useAuth';

export function useOverallAnalytics() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.myOverall,
    queryFn: () => analyticsService.getMyOverallAnalytics(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePostsAnalytics(page = 1, limit = 10, sort = 'newest') {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.myPosts(page, limit, sort),
    queryFn: () => analyticsService.getMyPostsAnalytics(page, limit, sort),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTopPosts(limit = 5, sort = 'views') {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics.topPosts(limit, sort),
    queryFn: () => analyticsService.getTopPosts(limit, sort),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePostAnalytics(postId: string) {
  return useQuery({
    queryKey: ['analytics', 'post', postId],
    queryFn: () => analyticsService.getPostAnalytics(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  });
}
