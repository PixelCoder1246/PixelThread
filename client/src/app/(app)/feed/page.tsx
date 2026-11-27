'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, Eye, MessageCircle, Clock, Plus } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useTogglePostLike } from '@/hooks/useLikes';
import { bookmarksService } from '@/services/bookmarks';
import {
  cn,
  formatRelativeDate,
  formatNumber,
  calculateReadingTime,
} from '@/lib/utils';
import { PAGINATION, ROUTES } from '@/constants';
import type { Post } from '@/types';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import styles from './page.module.css';

const FEED_TABS = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'latest', label: 'Latest' },
];

function FeedSkeleton() {
  return (
    <div className={styles.feed}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeleton}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonAvatar} />
            <div
              className={cn(styles.skeletonLine, styles.skeletonLineShort)}
            />
          </div>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonExcerpt}>
            <div
              className={cn(styles.skeletonLine, styles.skeletonLineMedium)}
            />
            <div
              className={cn(styles.skeletonLine, styles.skeletonLineShort)}
            />
          </div>
          <div className={styles.skeletonTags}>
            <div className={styles.skeletonTag} />
            <div className={styles.skeletonTag} />
            <div className={styles.skeletonTag} />
          </div>
          <div className={styles.skeletonFooter}>
            <div
              className={cn(styles.skeletonLine, styles.skeletonLineShort)}
            />
            <div
              className={cn(styles.skeletonLine, styles.skeletonLineShort)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PostCard({
  post,
  onLike,
  onBookmark,
}: {
  post: Post;
  onLike: (id: string) => void;
  onBookmark: (id: string, bookmarked: boolean) => void;
}) {
  const router = useRouter();
  const readingTime = calculateReadingTime(post.content || post.excerpt || '');

  return (
    <article
      className={styles.card}
      onClick={() => router.push(ROUTES.POST(post.slug))}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardAuthor}>
          <Avatar
            src={post.author.image ?? undefined}
            name={post.author.name}
            size="sm"
          />
          <span className={styles.cardAuthorName}>{post.author.name}</span>
        </div>
        <span className={styles.cardDate}>
          {formatRelativeDate(post.publishedAt ?? post.createdAt)}
        </span>
      </div>

      <h3 className={styles.cardTitle}>{post.title}</h3>

      {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}

      {post.tags?.length > 0 && (
        <div className={styles.cardTags}>
          {post.tags.map((tag) => (
            <Badge key={tag.id} variant="primary" size="sm">
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className={styles.cardFooter}>
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
          <span className={styles.readingTime}>
            <Clock size={14} />
            {readingTime} min read
          </span>
        </div>

        <div className={styles.cardActions}>
          <button
            type="button"
            className={cn(
              styles.actionButton,
              post.isLiked && styles.actionButtonLiked
            )}
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            aria-label={post.isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            className={cn(
              styles.actionButton,
              post.isBookmarked && styles.actionButtonBookmarked
            )}
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(post.id, !!post.isBookmarked);
            }}
            aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark
              size={16}
              fill={post.isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('for-you');
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);

  const { data, isLoading, isError, error, refetch } = usePosts({
    page,
    limit: PAGINATION.DEFAULT_LIMIT,
  });
  const toggleLike = useTogglePostLike();

  const posts = data?.posts ?? [];
  const pagination = data?.pagination as
    | { totalPages: number; total: number; page: number }
    | undefined;

  const handleLike = useCallback(
    (postId: string) => {
      toggleLike.mutate(postId);
    },
    [toggleLike]
  );

  const handleBookmark = useCallback(
    async (postId: string, currentlyBookmarked: boolean) => {
      try {
        await bookmarksService.toggle(postId);
      } catch {
        // silently fail
      }
    },
    []
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setPage(PAGINATION.DEFAULT_PAGE);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Feed</h1>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} />}
          className={styles.createButton}
          onClick={() => router.push(ROUTES.CREATE_POST)}
        >
          New Post
        </Button>
      </div>

      <div className={styles.tabs}>
        <Tabs
          tabs={FEED_TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <div className={styles.error}>
          <h2 className={styles.errorTitle}>Failed to load feed</h2>
          <p className={styles.errorMessage}>
            {(error as Error)?.message ||
              'Something went wrong. Please try again.'}
          </p>
          <Button variant="secondary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No posts yet"
          description="Follow users or check back later for new content."
          action={
            <Button
              variant="primary"
              onClick={() => router.push(ROUTES.EXPLORE)}
            >
              Explore Posts
            </Button>
          }
        />
      ) : (
        <>
          <div className={styles.feed}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onBookmark={handleBookmark}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
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
