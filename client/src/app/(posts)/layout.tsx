'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLoader from '@/components/common/AuthLoader';
import { useAuthStore } from '@/store';

export default function PostsRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AuthLoader fullPage message="Checking your session" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
