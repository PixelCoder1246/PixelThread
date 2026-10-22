'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  History,
  Trash2,
  BookOpen,
  ArrowRight,
  Eye,
  Clock,
  RotateCcw,
} from 'lucide-react';
import {
  useHistory,
  useDeleteHistoryItem,
  useClearHistory,
} from '@/features/history/useHistory';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import styles from './page.module.css';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading } = useHistory(page, 10);
  const deleteItem = useDeleteHistoryItem();
  const clearHistory = useClearHistory();

  const posts = data?.posts ?? [];
  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems ?? posts.length;

  const handleDeleteItem = async (id: string, title: string) => {
    try {
      await deleteItem.mutateAsync(id);
      toast({
        title: 'Removed from history',
        message: `"${title}" was removed from your reading history.`,
        type: 'info',
      });
    } catch {
      toast({
        title: 'Action failed',
        message: 'Could not remove story from reading history.',
        type: 'error',
      });
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear your entire reading history?'
      )
    ) {
      return;
    }
    try {
      await clearHistory.mutateAsync();
      toast({
        title: 'History cleared',
        message: 'Your reading history has been completely cleared.',
        type: 'success',
      });
    } catch {
      toast({
        title: 'Action failed',
        message: 'Could not clear history.',
        type: 'error',
      });
    }
  };

  return (
    <div className={styles.historyPage}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Reading History</h1>
          <p className={styles.subtitle}>
            {totalItems > 0
              ? `${totalItems} ${totalItems === 1 ? 'story' : 'stories'} recently read by you`
              : 'Keep track of the stories and tech articles you read'}
          </p>
        </div>

        {totalItems > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            disabled={clearHistory.isPending}
            className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </Button>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.emptyState}>
          <History size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No reading history yet</h2>
          <p className={styles.emptyText}>
            Stories you read on PixelThread will automatically be saved here so
            you can easily pick up where you left off.
          </p>
          <div className="mt-4">
            <Link href="/posts">
              <Button size="lg" className="gap-2">
                <span>Explore Stories</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.historyList}>
            {posts.map((item) => {
              const formattedDate = item.lastReadAt
                ? formatDistanceToNow(new Date(item.lastReadAt), {
                    addSuffix: true,
                  })
                : '';

              return (
                <div key={item.id} className={styles.historyCard}>
                  <div className={styles.cardContent}>
                    <div className={styles.authorMeta}>
                      <Avatar
                        src={item.author?.image ?? undefined}
                        alt={item.author?.name ?? 'Author'}
                        fallback={(item.author?.name || 'A')
                          .charAt(0)
                          .toUpperCase()}
                        size="sm"
                      />
                      <Link
                        href={`/profile/${item.author?.username || item.author?.id}`}
                        className={styles.authorName}
                      >
                        {item.author?.name ?? 'Author'}
                      </Link>
                      {formattedDate && (
                        <span className={styles.readDate}>
                          · Read {formattedDate}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/posts/${item.slug}`}
                      className={styles.cardTitle}
                    >
                      {item.title}
                    </Link>

                    {item.excerpt && (
                      <p className={styles.cardExcerpt}>{item.excerpt}</p>
                    )}

                    <div className={styles.metaRow}>
                      <span className={styles.readBadge}>
                        <RotateCcw size={11} />
                        <span>
                          Read {item.readCount || 1}{' '}
                          {item.readCount === 1 ? 'time' : 'times'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className={styles.removeBtn}
                      title="Remove from history"
                      aria-label={`Remove ${item.title} from history`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
