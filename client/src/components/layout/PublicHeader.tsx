'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import styles from './PublicHeader.module.css';

export default function PublicHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(styles.header, scrolled && styles.scrolled)}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          PixelThread
        </Link>
        <div className={styles.actions}>
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/feed')}
            >
              Go to Feed
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
              >
                Log in
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/register')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
