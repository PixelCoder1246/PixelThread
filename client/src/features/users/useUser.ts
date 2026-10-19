import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { queryKeys } from '@/lib/queryKeys';

export function useUserPosts(
  userId: string,
  page = 1,
  limit = 10,
  sort = 'newest',
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.users.posts(userId, page, limit, sort),
    queryFn: () => usersService.getUserPosts(userId, page, limit, sort),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
