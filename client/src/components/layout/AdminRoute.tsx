'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Spinner, Button } from '@/components/ui';
import styles from './AdminRoute.module.css';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const queryString = searchParams?.toString();
      const callbackUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [isLoading, isAuthenticated, pathname, searchParams, router]);

  if (isLoading) {
    return (
      <div className={styles.adminRouteLoading}>
        <Spinner className="h-8 w-8 text-primary" />
        <span>Verifying security credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  if (!isAdmin) {
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <div className={styles.shieldIconWrap}>
            <ShieldAlert size={36} />
          </div>
          <h2 className={styles.title}>Access Denied</h2>
          <p className={styles.description}>
            This zone is restricted to platform administrators and moderators.
            Your account does not have sufficient permissions to view this area.
          </p>
          <div className={styles.roleBadge}>
            <span>Current Role:</span>
            <strong>{user?.role || 'USER'}</strong>
          </div>
          <div className={styles.actions}>
            <Link href="/posts">
              <Button variant="outline" className="w-full">
                <ArrowLeft size={16} />
                <span>Return to Feed</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="primary" className="w-full">
                <Home size={16} />
                <span>Home Page</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
