'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import RouteProgress from '@/components/common/RouteProgress';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store';

interface ProvidersProps {
  children: ReactNode;
}

const AUTH_INIT_TIMEOUT = 10000;

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    async function initAuth() {
      useAuthStore.getState().setLoading(true);

      timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.warn('Auth initialization timed out, clearing auth state');
          useAuthStore.getState().clearAuth();
        }
      }, AUTH_INIT_TIMEOUT);

      try {
        const userData = await authService.getMe();
        if (!cancelled) {
          clearTimeout(timeoutId);
          useAuthStore.getState().setUser(userData);
        }
      } catch (_error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _ = _error;
        if (!cancelled) {
          clearTimeout(timeoutId);
          useAuthStore.getState().clearAuth();
        }
      }
    }

    initAuth();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <RouteProgress />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--fs-sm)',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
