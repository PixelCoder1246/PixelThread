'use client';

import Link from 'next/link';
import { Heart, MessageSquare, Bookmark, Eye, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/date';
import { useAuth } from '@/features/auth/useAuth';
import { usePostLikeInfo } from '@/features/likes/useLike';
import { usePostCommentsCount } from '@/features/comments/useComments';
import {
  useBookmarkStatus,
  useToggleBookmark,
} from '@/features/bookmarks/useBookmark';
import type { PostListItem } from '@/types/post';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: PostListItem;
  variant?: 'default' | 'compact';
}

function estimateReadTime(content: unknown): number {
  if (!content) return 1;
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getTagName(tag: unknown): string {
  if (!tag) return '';
  if (typeof tag === 'string') return tag;
  const t = tag as Record<string, unknown>;
  if (t.tag && typeof t.tag === 'object') {
    return ((t.tag as Record<string, unknown>).name as string) ?? '';
  }
  return (t.name as string) ?? '';
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const { isAuthenticated } = useAuth();

  const fallbackLikes =
    (post as unknown as { likes?: number })?.likes ?? post._count?.likes ?? 0;
  const fallbackComments =
    (post as unknown as { comments?: number })?.comments ??
    post._count?.comments ??
    0;

  const { isLiked, likeCount, toggleLike } = usePostLikeInfo(
    post.id,
    fallbackLikes
  );
  const { data: bookmarkStatus } = useBookmarkStatus(post.id, isAuthenticated);
  const toggleBookmark = useToggleBookmark(post.id);
  const isBookmarked =
    bookmarkStatus?.isBookmarked ?? post.isBookmarked ?? false;
  const commentCount = usePostCommentsCount(post.id, fallbackComments);
  const readTime = estimateReadTime(post.content);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      toggleLike.mutate();
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      toggleBookmark.mutate();
    }
  };

  return (
    <article
      className={`${styles.postCard} ${variant === 'compact' ? styles.compact : ''}`}
    >
      <Link href={`/posts/${post.slug}`} className={styles.postCardLink}>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.slice(0, 3).map((t, idx) => {
              const name = getTagName(t);
              return name ? (
                <Badge key={idx} variant="default" className={styles.tag}>
                  #{name}
                </Badge>
              ) : null;
            })}
          </div>
        )}

        {/* Title */}
        <h2 className={styles.title}>{post.title}</h2>

        {/* Excerpt */}
        {variant === 'default' && post.excerpt && (
          <p className={styles.excerpt}>{post.excerpt}</p>
        )}

        {/* Meta row */}
        <div className={styles.meta}>
          <div className={styles.authorRow}>
            <Avatar
              src={post.author?.image ?? undefined}
              alt={post.author?.name ?? 'Author'}
              fallback={post.author?.name ?? 'A'}
              size="xs"
            />
            <span className={styles.authorName}>
              {post.author?.name ?? 'Anonymous'}
            </span>
            <span className={styles.dot}>·</span>
            <time className={styles.date} dateTime={post.createdAt}>
              {formatDate(post.createdAt)}
            </time>
            <span className={styles.dot}>·</span>
            <span className={styles.readTime}>
              <Clock size={12} />
              {readTime} min read
            </span>
          </div>
        </div>
      </Link>

      {/* Actions row — outside Link to prevent propagation */}
      <div className={styles.actions}>
        <div className={styles.statsLeft}>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
            disabled={!isAuthenticated || toggleLike.isPending}
          >
            <Heart
              size={15}
              className={styles.actionIcon}
              fill={isLiked ? 'currentColor' : 'none'}
            />
            <span>{likeCount}</span>
          </button>

          <Link
            href={`/posts/${post.slug}#comments`}
            className={styles.actionBtn}
            aria-label="View comments"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageSquare size={15} className={styles.actionIcon} />
            <span>{commentCount}</span>
          </Link>

          {post.analytics?.views !== undefined && (
            <span className={styles.viewStat}>
              <Eye size={13} />
              {post.analytics.views}
            </span>
          )}
        </div>

        <button
          className={`${styles.actionBtn} ${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarked : ''}`}
          onClick={handleBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          disabled={!isAuthenticated || toggleBookmark.isPending}
        >
          <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
}
