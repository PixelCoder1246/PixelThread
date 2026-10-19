'use client';

import { FileText, AlertCircle } from 'lucide-react';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import type { PostListItem } from '@/types/post';
import styles from './PostList.module.css';

interface PostListProps {
  posts: PostListItem[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonCount?: number;
  viewMode?: 'grid' | 'list';
}

export function PostList({
  posts,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle = 'No posts found',
  emptyDescription = 'There are no stories published here yet.',
  skeletonCount = 3,
  viewMode = 'list',
}: PostListProps) {
  if (isLoading) {
    return (
      <div className={viewMode === 'grid' ? styles.grid : styles.list}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorState}>
        <AlertCircle size={32} style={{ marginBottom: '0.75rem' }} />
        <p>{errorMessage || 'Failed to load posts.'}</p>
        {onRetry && (
          <button onClick={onRetry} className={styles.retryBtn}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FileText className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>{emptyTitle}</h3>
        <p className={styles.emptyDesc}>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? styles.grid : styles.list}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
