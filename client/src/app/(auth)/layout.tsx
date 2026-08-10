'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLoader from '@/components/common/AuthLoader';
import { useAuthStore } from '@/store';

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/feed');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AuthLoader fullPage message="Loading" />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
