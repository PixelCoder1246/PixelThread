import { useQuery } from '@tanstack/react-query';
import { tagsService } from '@/services/tags.service';
import { queryKeys } from '@/lib/queryKeys';

export function useAllTags(page = 1, limit = 20, sort = 'mostUsed') {
  return useQuery({
    queryKey: queryKeys.tags.list(page, limit, sort),
    queryFn: () => tagsService.getAllTags(page, limit, sort),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTagPosts(name: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: queryKeys.tags.posts(name, page, limit),
    queryFn: () => tagsService.getTagPosts(name, page, limit),
    enabled: !!name,
    staleTime: 1000 * 60 * 2,
  });
}
