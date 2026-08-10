'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { postsService } from '@/services/posts';
import { cn, formatNumber, formatRelativeDate } from '@/lib/utils';
import { ROUTES, PAGINATION } from '@/constants';
import type { Post } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/common/EmptyState';
import styles from './page.module.css';

type SortMode = 'views' | 'likes';

function TrendingSkeleton() {
  return (
    <div className={styles.loadingGrid}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonRank} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonMeta} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrendingPage() {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<SortMode>('views');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await postsService.getAll({ page: 1, limit: 20 });
      const sorted = [...res.posts].sort((a, b) => {
        if (sortMode === 'views') return b.analytics.views - a.analytics.views;
        return b.analytics.likes - a.analytics.likes;
      });
      setPosts(sorted);
    } catch {
      setError('Failed to load trending posts');
    } finally {
      setIsLoading(false);
    }
  }, [sortMode]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const getRankClass = (index: number) => {
    if (index === 0) return styles.rankTop1;
    if (index === 1) return styles.rankTop2;
    if (index === 2) return styles.rankTop3;
    return '';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Flame size={32} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Trending</h1>
            <p className={styles.subtitle}>Most popular posts right now</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={cn(styles.tab, sortMode === 'views' && styles.tabActive)}
          onClick={() => setSortMode('views')}
        >
          <Eye size={14} style={{ display: 'inline', marginRight: 'var(--space-1_5)', verticalAlign: 'middle' }} />
          Most Viewed
        </button>
        <button
          type="button"
          className={cn(styles.tab, sortMode === 'likes' && styles.tabActive)}
          onClick={() => setSortMode('likes')}
        >
          <Heart size={14} style={{ display: 'inline', marginRight: 'var(--space-1_5)', verticalAlign: 'middle' }} />
          Most Liked
        </button>
      </div>

      {isLoading ? (
        <TrendingSkeleton />
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }}>{error}</p>
          <button
            type="button"
            className={styles.tab}
            style={{ color: 'var(--primary-500)', cursor: 'pointer' }}
            onClick={fetchPosts}
          >
            Try Again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nothing trending yet"
          description="Posts with high engagement will appear here."
        />
      ) : (
        <div className={styles.grid}>
          {posts.map((post, index) => (
            <article
              key={post.id}
              className={styles.card}
              onClick={() => router.push(ROUTES.POST(post.slug))}
            >
              <div className={cn(styles.rank, getRankClass(index))}>
                {index + 1}
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{post.title}</h3>

                <div className={styles.cardMeta}>
                  <Avatar
                    src={post.author.image ?? undefined}
                    name={post.author.name}
                    size="sm"
                  />
                  <span>{post.author.name}</span>
                  <span>&middot;</span>
                  <span>{formatRelativeDate(post.publishedAt ?? post.createdAt)}</span>
                </div>

                <div className={styles.cardStats}>
                  <span className={styles.stat}>
                    <Eye size={14} className={styles.statIcon} />
                    {formatNumber(post.analytics.views)}
                  </span>
                  <span className={styles.stat}>
                    <Heart size={14} className={styles.statIcon} />
                    {formatNumber(post.analytics.likes)}
                  </span>
                  <span className={styles.stat}>
                    <MessageCircle size={14} className={styles.statIcon} />
                    {formatNumber(post.analytics.comments)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
