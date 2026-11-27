'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';
import { searchService } from '@/services/search';
import { tagsService } from '@/services/tags';
import type { Tag } from '@/types';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
  notificationCount?: number;
}

interface TrendItem {
  keyword: string;
  count: number;
}

const DEFAULT_TRENDS: TrendItem[] = [
  { keyword: 'Artificial Intelligence', count: 48 },
  { keyword: 'Web Engineering', count: 36 },
  { keyword: 'Next.js & React', count: 29 },
  { keyword: 'Design Systems', count: 24 },
  { keyword: 'Future of Work', count: 18 },
  { keyword: 'Cloud & DevOps', count: 15 },
];

const DEFAULT_TAGS = [
  { id: '1', name: 'ai' },
  { id: '2', name: 'react' },
  { id: '3', name: 'nextjs' },
  { id: '4', name: 'typescript' },
  { id: '5', name: 'design' },
  { id: '6', name: 'webdev' },
  { id: '7', name: 'productivity' },
  { id: '8', name: 'tech' },
];

export default function AppLayout({
  children,
  notificationCount = 0,
}: AppLayoutProps) {
  const { sidebarOpen } = useUIStore();
  const router = useRouter();
  const [trends, setTrends] = useState<TrendItem[]>(DEFAULT_TRENDS);
  const [popularTags, setPopularTags] = useState<Tag[]>(DEFAULT_TAGS);

  useEffect(() => {
    let mounted = true;

    searchService
      .getTrending()
      .then((data: unknown) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setTrends(data);
        } else if (
          data &&
          typeof data === 'object' &&
          'queries' in data &&
          Array.isArray((data as { queries: string[] }).queries)
        ) {
          const list = (data as { queries: string[] }).queries.map(
            (q, idx) => ({
              keyword: q,
              count: 30 - idx * 3,
            })
          );
          if (list.length > 0) setTrends(list);
        }
      })
      .catch(() => {});

    tagsService
      .getAll({ limit: 12, sort: 'mostUsed' })
      .then((res) => {
        if (!mounted) return;
        if (res?.tags?.length > 0) {
          setPopularTags(res.tags);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <AppHeader notificationCount={notificationCount} />
      <main className={cn(styles.main, !sidebarOpen && styles.mainExpanded)}>
        <div className={styles.content}>{children}</div>
        <aside className={styles.rightPanel}>
          <div className={styles.widgetCard}>
            <h3 className={styles.widgetTitle}>Trending Topics</h3>
            {trends.slice(0, 6).map((t, idx) => (
              <div
                key={t.keyword}
                className={styles.trendItem}
                onClick={() =>
                  router.push(`/search?q=${encodeURIComponent(t.keyword)}`)
                }
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.trendRank}>{idx + 1}</span>
                <div className={styles.trendContent}>
                  <span className={styles.trendName}>{t.keyword}</span>
                  <span className={styles.trendCount}>
                    {t.count} posts & discussions
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.widgetCard}>
            <h3 className={styles.widgetTitle}>Popular Tags</h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginTop: '10px',
              }}
            >
              {popularTags.slice(0, 10).map((tag) => (
                <button
                  key={tag.id || tag.name}
                  type="button"
                  onClick={() =>
                    router.push(`/explore?tag=${encodeURIComponent(tag.name)}`)
                  }
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-400)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.widgetCard}>
            <h3 className={styles.widgetTitle}>About PixelThread</h3>
            <p className={styles.widgetText}>
              A minimalist, AI-assisted publication platform designed for deep
              writing, clear ideas, and thoughtful stories.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
