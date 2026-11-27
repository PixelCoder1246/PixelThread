'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import AuthLoader from '@/components/common/AuthLoader';
import { useAuthStore } from '@/store';
import { notificationsService } from '@/services/notifications';

export default function AppRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(0);

  const isPublicRoute =
    pathname.startsWith('/feed') ||
    pathname.startsWith('/explore') ||
    pathname.startsWith('/trending') ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/bookmarks') ||
    pathname.startsWith('/history') ||
    (pathname.startsWith('/profile/') && pathname !== '/profile');

  const requiresAuth = !isPublicRoute;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && requiresAuth) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, requiresAuth, pathname, router]);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsService
        .getUnreadCount()
        .then(setNotificationCount)
        .catch(() => setNotificationCount(0));
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <AuthLoader fullPage message="Loading..." />;
  }

  if (!isAuthenticated && requiresAuth) {
    return null;
  }

  return (
    <AppLayout notificationCount={notificationCount}>{children}</AppLayout>
  );
}
