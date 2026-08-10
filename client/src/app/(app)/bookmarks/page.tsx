'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkX } from 'lucide-react';
import { bookmarksService } from '@/services/bookmarks';
import { cn, formatRelativeDate } from '@/lib/utils';
import { ROUTES, PAGINATION } from '@/constants';
import type { Post } from '@/types';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import Pagination from '@/components/common/Pagination';
import styles from './page.module.css';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [pagination, setPagination] = useState<{ totalPages: number; page: number } | null>(null);

  const fetchBookmarks = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await bookmarksService.getAll({ page: p, limit: PAGINATION.DEFAULT_LIMIT });
      setBookmarks(res.posts);
      setPagination(res.pagination as { totalPages: number; page: number });
    } catch {
      setError('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks(page);
  }, [page, fetchBookmarks]);

  const handleRemoveBookmark = useCallback(async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await bookmarksService.toggle(postId);
      setBookmarks((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      // silently fail
    }
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Bookmark size={28} style={{ color: 'var(--primary-500)' }} />
          <div>
            <h1 className={styles.title}>Bookmarks</h1>
            <p className={styles.subtitle}>Posts you&apos;ve saved for later</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonExcerpt}>
                <div className={styles.skeletonLine} style={{ width: '90%' }} />
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
              </div>
              <div className={styles.skeletonFooter}>
                <div className={styles.skeletonLine} style={{ width: 100 }} />
                <div className={styles.skeletonLine} style={{ width: 60 }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }}>{error}</p>
          <Button variant="secondary" onClick={() => fetchBookmarks(page)}>
            Try Again
          </Button>
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={BookmarkX}
          title="No bookmarks yet"
          description="Save posts you love by tapping the bookmark icon on any post."
          action={
            <Button variant="primary" onClick={() => router.push(ROUTES.FEED)}>
              Browse Feed
            </Button>
          }
        />
      ) : (
        <>
          <div className={styles.grid}>
            {bookmarks.map((post) => (
              <article
                key={post.id}
                className={styles.card}
                onClick={() => router.push(ROUTES.POST(post.slug))}
              >
                <button
                  type="button"
                  className={styles.cardBookmark}
                  onClick={(e) => handleRemoveBookmark(post.id, e)}
                  aria-label="Remove bookmark"
                >
                  <Bookmark size={16} fill="currentColor" />
                </button>

                <h3 className={styles.cardTitle}>{post.title}</h3>

                {post.excerpt && (
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                )}

                {post.tags?.length > 0 && (
                  <div className={styles.cardTags}>
                    {post.tags.map((tag) => (
                      <Badge key={tag.id} variant="default" size="sm">#{tag.name}</Badge>
                    ))}
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.cardAuthor}>
                    <Avatar
                      src={post.author.image ?? undefined}
                      name={post.author.name}
                      size="sm"
                    />
                    <span>{post.author.name}</span>
                  </div>
                  <span className={styles.cardDate}>
                    {formatRelativeDate(post.publishedAt ?? post.createdAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div style={{ marginTop: 'var(--space-8)' }}>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
