'use client';

import { useAuth } from '@/features/auth/useAuth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui';
import styles from './ProtectedRoute.module.css';

const s = styles as Record<string, string>;

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export function ProtectedRoute({
  children,
  requireVerified = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const callbackUrl = searchParams
          ? `${pathname}?${searchParams.toString()}`
          : pathname;
        router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else if (requireVerified && user && !user.isEmailVerified) {
        router.replace('/verify-email');
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    requireVerified,
    pathname,
    searchParams,
    router,
  ]);

  if (isLoading) {
    return (
      <div className={s['protected-route-loading']}>
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated || (requireVerified && user && !user.isEmailVerified)) {
    return null;
  }

  return <div className={s['protected-route']}>{children}</div>;
}
