'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/store';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import UserMenu from '@/components/common/UserMenu';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  notificationCount?: number;
  className?: string;
}

export default function AppHeader({
  notificationCount = 0,
  className,
}: AppHeaderProps) {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        styles.header,
        !sidebarOpen && styles.headerCollapsed,
        className
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
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search stories, topics, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search PixelThread"
            />
          </form>
        </div>

        <div className={styles.right}>
          {isAuthenticated ? (
            <>
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
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
