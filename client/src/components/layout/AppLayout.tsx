'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
  notificationCount?: number;
}

const trends = [
  { rank: 1, tag: 'NextJS', desc: 'Building modern web apps', slug: 'nextjs' },
  { rank: 2, tag: 'TypeScript', desc: 'Type-safe development', slug: 'typescript' },
  { rank: 3, tag: 'AI', desc: 'Content creation with AI', slug: 'ai' },
  { rank: 4, tag: 'React', desc: 'UI library ecosystem', slug: 'react' },
  { rank: 5, tag: 'Design', desc: 'UI/UX trends 2026', slug: 'design' },
];

export default function AppLayout({ children, notificationCount = 0 }: AppLayoutProps) {
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <AppHeader notificationCount={notificationCount} />
      <main className={cn(styles.main, !sidebarOpen && styles.mainExpanded)}>
        <div className={styles.content}>{children}</div>
        <aside className={styles.rightPanel}>
          <div className={styles.widgetCard}>
            <h3 className={styles.widgetTitle}>Trending Topics</h3>
            {trends.map((t) => (
              <div
                key={t.slug}
                className={styles.trendItem}
                onClick={() => router.push(`/search?q=${t.slug}`)}
              >
                <span className={styles.trendRank}>{t.rank}</span>
                <div className={styles.trendContent}>
                  <span className={styles.trendName}>#{t.tag}</span>
                  <span className={styles.trendCount}>{t.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.widgetCard}>
            <h3 className={styles.widgetTitle}>PixelThread</h3>
            <p className={styles.widgetText}>
              AI-powered blogging platform for thinkers, creators, and storytellers.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
