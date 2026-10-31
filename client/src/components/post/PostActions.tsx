'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';
import { usePostLikeInfo } from '@/features/likes/useLike';
import { usePostCommentsCount } from '@/features/comments/useComments';
import {
  useBookmarkStatus,
  useToggleBookmark,
} from '@/features/bookmarks/useBookmark';
import { useDeletePost } from '@/features/posts/usePosts';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/components/ui/Toast';
import type { PostListItem } from '@/types/post';
import styles from './PostActions.module.css';

interface PostActionsProps {
  post: PostListItem;
  onCommentsClick?: () => void;
}

export function PostActions({ post, onCommentsClick }: PostActionsProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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
  const deletePost = useDeletePost();
  const commentCount = usePostCommentsCount(post.id, fallbackComments);

  const isBookmarked =
    bookmarkStatus?.isBookmarked ?? post.isBookmarked ?? false;
  const isAuthor = user?.id === post.authorId || user?.role === 'ADMIN';
  const views = post.analytics?.views ?? 0;

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        message: 'Please sign in to like this post.',
        type: 'info',
      });
      return;
    }
    toggleLike.mutate();
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        message: 'Please sign in to bookmark this post.',
        type: 'info',
      });
      return;
    }
    toggleBookmark.mutate(isBookmarked);
    toast({
      title: isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks',
      message: isBookmarked
        ? 'Post removed from your library.'
        : 'Post saved to your bookmarks.',
      type: 'success',
    });
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt ?? '',
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Link copied',
        message: 'Post link copied to clipboard.',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      )
    ) {
      return;
    }
    try {
      await deletePost.mutateAsync(post.id);
      toast({
        title: 'Post deleted',
        message: 'Your post has been successfully removed.',
        type: 'success',
      });
      router.push('/posts');
    } catch (err) {
      toast({
        title: 'Delete failed',
        message: err instanceof Error ? err.message : 'Could not delete post.',
        type: 'error',
      });
    }
  };

  return (
    <div className={styles.actionsBar}>
      <div className={styles.leftGroup}>
        <button
          onClick={handleLike}
          className={`${styles.actionBtn} ${isLiked ? styles.actionBtnActiveLike : ''}`}
          title={isLiked ? 'Unlike' : 'Like'}
          aria-label="Like post"
        >
          <Heart
            className={styles.icon}
            fill={isLiked ? 'currentColor' : 'none'}
          />
          <span>{likeCount}</span>
        </button>

        {onCommentsClick ? (
          <button
            onClick={onCommentsClick}
            className={styles.actionBtn}
            title="Comments"
            aria-label="Jump to comments"
          >
            <MessageSquare className={styles.icon} />
            <span>{commentCount}</span>
          </button>
        ) : (
          <div className={styles.statItem} title={`${commentCount} comments`}>
            <MessageSquare className={styles.icon} />
            <span>{commentCount}</span>
          </div>
        )}

        {views > 0 && (
          <div className={styles.statItem} title={`${views} views`}>
            <Eye className={styles.icon} />
            <span>{views}</span>
          </div>
        )}
      </div>

      <div className={styles.rightGroup}>
        <button
          onClick={handleBookmark}
          className={`${styles.actionBtn} ${isBookmarked ? styles.actionBtnActiveBookmark : ''}`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          aria-label="Bookmark post"
        >
          <Bookmark
            className={styles.icon}
            fill={isBookmarked ? 'currentColor' : 'none'}
          />
        </button>

        <button
          onClick={handleShare}
          className={styles.actionBtn}
          title="Share post"
          aria-label="Share post"
        >
          {copied ? (
            <Check className={styles.icon} style={{ color: '#10b981' }} />
          ) : (
            <Share2 className={styles.icon} />
          )}
        </button>

        {isAuthor && (
          <div className={styles.authorActions}>
            <Link
              href={`/posts/${post.slug}/edit`}
              className={styles.editBtn}
              title="Edit post"
            >
              <Edit size={14} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className={styles.deleteBtn}
              title="Delete post"
              aria-label="Delete post"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
