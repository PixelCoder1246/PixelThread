import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followService } from '@/services/following.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/features/auth/useAuth';

export function useFollowers(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.follow.followers(userId, page, limit),
    queryFn: () => followService.getFollowers(userId, page, limit),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useFollowing(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.follow.following(userId, page, limit),
    queryFn: () => followService.getFollowing(userId, page, limit),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

/**
 * Checks whether the current user is following the given userId
 * by inspecting the current user's following list.
 */
export function useIsFollowing(targetUserId: string) {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading } = useFollowing(user?.id ?? '', 1, 100);

  const isFollowing =
    isAuthenticated && !!targetUserId && user?.id !== targetUserId
      ? (data?.users?.some((u) => u.id === targetUserId) ?? false)
      : false;

  return { isFollowing, isLoading };
}

export function useToggleFollow(targetUserId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (isCurrentlyFollowing: boolean) => {
      if (isCurrentlyFollowing) {
        return followService.unfollowUser(targetUserId);
      }
      return followService.followUser(targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.all });
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.follow.following(user.id, 1, 100),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.follow.followers(targetUserId, 1, 20),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
