'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}