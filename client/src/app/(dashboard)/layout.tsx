'use client';

import AuthLoader from '@/components/common/AuthLoader';
import { useAuthStore } from '@/store';

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return <AuthLoader fullPage message="Checking your session" />;
  }

  return <>{children}</>;
}
