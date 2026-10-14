import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500 && status !== 401 && status !== 403) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});