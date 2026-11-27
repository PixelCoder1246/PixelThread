'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { History, Clock, Trash2 } from 'lucide-react';
import { historyService } from '@/services/history';
import { formatRelativeDate, formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/common/EmptyState';
import styles from './page.module.css';

import type { HistoryEntry } from '@/services/history';

interface GroupedEntries {
  date: string;
  label: string;
  entries: HistoryEntry[];
}

function groupByDate(entries: HistoryEntry[]): GroupedEntries[] {
  const groups: Record<string, HistoryEntry[]> = {};

  for (const entry of entries) {
    const date = new Date(entry.viewedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    let label: string;

    if (date.toDateString() === today.toDateString()) {
      key = 'today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'yesterday';
    } else {
      key = date.toDateString();
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }

  const order = ['today', 'yesterday'];
  return Object.entries(groups)
    .sort(([a], [b]) => {
      const aIdx = order.indexOf(a);
      const bIdx = order.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    })
    .map(([date, entries]) => ({
      date,
      label: order.includes(date)
        ? date === 'today'
          ? 'Today'
          : 'Yesterday'
        : formatDate(date),
      entries: entries.sort(
        (a, b) =>
          new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
      ),
    }));
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await historyService.getAll({ limit: 50 });
      setEntries(res.entries);
    } catch {
      setError('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClearHistory = useCallback(async () => {
    try {
      await historyService.clearAll();
      setEntries([]);
    } catch {
      setError('Failed to clear history');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchHistory();
  }, [fetchHistory]);

  const grouped = useMemo(() => groupByDate(entries), [entries]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Clock size={28} className={styles.headerIcon} />
        <div>
          <h1 className={styles.title}>History</h1>
          <p className={styles.subtitle}>Posts you&apos;ve read</p>
        </div>
        {entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={handleClearHistory}
          >
            Clear All
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.timeline}>
          {Array.from({ length: 3 }).map((_, groupIdx) => (
            <div key={groupIdx} className={styles.dateGroup}>
              <div className={styles.dateHeader}>
                <div className={styles.dateDot} />
                <span className={styles.dateLabel}>
                  <div
                    style={{
                      height: 14,
                      width: 80,
                      borderRadius: 'var(--radius-base)',
                      background: 'var(--skeleton-base)',
                      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </span>
              </div>
              <div className={styles.loadingSkeleton}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.skeletonItem} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p
            style={{
              color: 'var(--color-error)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {error}
          </p>
          <Button variant="secondary" onClick={fetchHistory}>
            Try Again
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={History}
          title="No reading history yet"
          description="Posts you view will appear here."
          action={
            <Button variant="primary" onClick={() => router.push(ROUTES.FEED)}>
              Start Reading
            </Button>
          }
        />
      ) : (
        <div className={styles.timeline}>
          {grouped.map((group) => (
            <div key={group.date} className={styles.dateGroup}>
              <div className={styles.dateHeader}>
                <div className={styles.dateDot} />
                <span className={styles.dateLabel}>{group.label}</span>
              </div>
              <div className={styles.posts}>
                {group.entries.map((entry) => {
                  const post = entry.post;
                  const author = post?.author;
                  return (
                    <div
                      key={entry.id ?? post?.id}
                      className={styles.postItem}
                      onClick={() =>
                        post?.slug && router.push(ROUTES.POST(post.slug))
                      }
                    >
                      <Avatar
                        src={author?.image ?? undefined}
                        name={author?.name ?? 'Unknown'}
                        size="sm"
                      />
                      <div className={styles.postContent}>
                        <div className={styles.postTitle}>{post?.title}</div>
                        <div className={styles.postMeta}>
                          {author?.name ?? 'Unknown'}
                          {post?.tags &&
                            post.tags.length > 0 &&
                            ` · #${post.tags[0].name}`}
                        </div>
                      </div>
                      <span className={styles.postTime}>
                        {formatRelativeDate(entry.viewedAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
