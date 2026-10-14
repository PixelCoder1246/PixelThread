'use client';

import { ReactNode, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import { useAuth } from '@/features/auth/useAuth';
import { Spinner } from '@/components/ui';
import styles from './AuthLayout.module.css';

const s = styles as Record<string, string>;

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const alreadyAuthOnMount = useRef<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (alreadyAuthOnMount.current === null) {
      alreadyAuthOnMount.current = isAuthenticated;
    }
    if (alreadyAuthOnMount.current && isAuthenticated) {
      const rawCallbackUrl = searchParams.get('callbackUrl');
      const callbackUrl = (rawCallbackUrl && rawCallbackUrl !== '/') ? rawCallbackUrl : '/posts';
      router.replace(callbackUrl);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className={s['auth-layout-loading']}>
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (alreadyAuthOnMount.current && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <Suspense fallback={
      <div className={s['auth-layout-loading']}>
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <AuthGuard>
        <div className={s['auth-layout']}>
          {/* Background */}
          <div className={s['auth-layout-bg']}>
            <div className={s['auth-layout-gradient']} />
            <div className={s['auth-layout-glow-1']} />
            <div className={s['auth-layout-glow-2']} />
            <div className={s['auth-layout-glow-3']} />
            <div className={s['auth-layout-grid']} />
            <FloatingParticles count={10} />
          </div>

          <div className={s['auth-layout-main']}>
            {/* Left panel – branding */}
            <div className={s['auth-layout-left']}>
              <Link href="/" className={s['auth-layout-brand']}>
                <Image
                  src="/PTfavicon.png"
                  alt="PixelThread"
                  width={48}
                  height={48}
                  className={s['auth-layout-brand-image']}
                />
                <span className={s['auth-layout-brand-text']}>PixelThread</span>
              </Link>

              <div className={s['auth-layout-marketing']}>
                <h1 className={s['auth-layout-title']}>
                  Write smarter,<br />
                  publish <span className={s['auth-layout-title-highlight']}>faster</span>.
                </h1>
                <p className={s['auth-layout-description']}>
                  The AI-powered blogging platform built for creators and developers who want to grow their audience.
                </p>
                <ul className={s['auth-layout-features']}>
                  <li className={s['auth-layout-feature-item']}>
                    <span className={s['auth-layout-feature-dot']} />
                    AI writing assistant &amp; blog generator
                  </li>
                  <li className={s['auth-layout-feature-item']}>
                    <span className={s['auth-layout-feature-dot']} />
                    Rich TipTap editor with code blocks
                  </li>
                  <li className={s['auth-layout-feature-item']}>
                    <span className={s['auth-layout-feature-dot']} />
                    Analytics, SEO tools &amp; community
                  </li>
                </ul>
              </div>

              <div className={s['auth-layout-copyright']}>
                &copy; {new Date().getFullYear()} PixelThread. All rights reserved.
              </div>
            </div>

            {/* Right panel – form */}
            <div className={s['auth-layout-right']}>
              <div className={s['auth-layout-mobile-brand']}>
                <Link href="/" className={s['auth-layout-brand']}>
                  <Image
                    src="/PTfavicon.png"
                    alt="PixelThread"
                    width={36}
                    height={36}
                    className={s['auth-layout-brand-image']}
                  />
                  <span className={s['auth-layout-brand-text']}>PixelThread</span>
                </Link>
              </div>
              <div className={s['auth-layout-card']}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    </Suspense>
  );
}