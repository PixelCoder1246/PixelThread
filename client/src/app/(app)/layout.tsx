'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsService.getUnreadCount()
        .then(setNotificationCount)
        .catch(() => setNotificationCount(0));
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <AuthLoader fullPage message="Checking your session" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AppLayout notificationCount={notificationCount}>{children}</AppLayout>;
}
