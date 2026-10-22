import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyService } from '@/services/history.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/features/auth/useAuth';

export function useHistory(page = 1, limit = 10) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.history.list(page, limit),
    queryFn: () => historyService.getHistory(page, limit),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
}

export function useDeleteHistoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => historyService.deleteHistoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
    },
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => historyService.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
    },
  });
}
