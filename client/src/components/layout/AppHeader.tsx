'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import UserMenu from '@/components/common/UserMenu';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  notificationCount?: number;
  className?: string;
}

export default function AppHeader({ notificationCount = 0, className }: AppHeaderProps) {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, toggleCommandPalette } = useUIStore();

  return (
    <header
      className={cn(
        styles.header,
        !sidebarOpen && styles.headerCollapsed,
        className,
      )}
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <button
            type="button"
            className={styles.searchButton}
            onClick={toggleCommandPalette}
          >
            <Search size={16} />
            <span>Search...</span>
            <span className={styles.searchHint}>
              <kbd>Ctrl</kbd> <kbd>K</kbd>
            </span>
          </button>
        </div>

        <div className={styles.right}>
          <Link
            href="/notifications"
            className={styles.notificationBtn}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className={styles.badge}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Link>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => router.push('/posts/create')}
          >
            Create Post
          </Button>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
