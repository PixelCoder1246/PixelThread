'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  Heart,
  Bookmark,
  Share2,
  Clock,
  Eye,
  ArrowLeft,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  usePost,
  useRecordView,
  useDeletePost,
} from '@/features/posts/usePosts';
import { usePostLikeStatus, useTogglePostLike } from '@/features/likes/useLike';
import {
  useBookmarkStatus,
  useToggleBookmark,
} from '@/features/bookmarks/useBookmark';
import { useAuth } from '@/features/auth/useAuth';
import { PostContent } from '@/components/post/PostContent';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Dropdown } from '@/components/ui/Dropdown';
import { formatDate } from '@/lib/date';
import type { PostListItem } from '@/types/post';
import styles from './page.module.css';

function getTagName(tag: unknown): string {
  if (!tag) return '';
  if (typeof tag === 'string') return tag;
  const t = tag as Record<string, unknown>;
  if (t.tag && typeof t.tag === 'object') {
    return ((t.tag as Record<string, unknown>).name as string) ?? '';
  }
  return (t.name as string) ?? '';
}

function estimateReadTime(content: unknown): number {
  if (!content) return 1;
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function handleShare(post: PostListItem) {
  if (navigator.share) {
    navigator.share({
      title: post.title,
      text: post.excerpt ?? '',
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
  }
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, isError } = usePost(slug);
  const post = data?.post;

  const recordView = useRecordView();
  const deletePost = useDeletePost();
  const { data: likeStatus } = usePostLikeStatus(
    post?.id ?? '',
    isAuthenticated && !!post?.id
  );
  const { data: bookmarkStatus } = useBookmarkStatus(
    post?.id ?? '',
    isAuthenticated && !!post?.id
  );
  const toggleLike = useTogglePostLike(post?.id ?? '');
  const toggleBookmark = useToggleBookmark(post?.id ?? '');

  // Record view on mount
  useEffect(() => {
    if (post?.id) {
      recordView.mutate(post.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const isLiked = likeStatus?.liked ?? post?.isLiked ?? false;
  const isBookmarked =
    bookmarkStatus?.isBookmarked ?? post?.isBookmarked ?? false;
  const isOwner = user?.id === post?.authorId;
  const readTime = estimateReadTime(post?.content);

  const handleDelete = async () => {
    if (!post?.id) return;
    if (
      !confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      )
    )
      return;
    await deletePost.mutateAsync(post.id);
    router.push('/posts');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner size="lg" />
        <p>Loading post...</p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.errorCard}>
          <h1>Post Not Found</h1>
          <p>
            The post you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/posts" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Posts
          </Link>
        </div>
      </div>
    );
  }

  const tags = post.tags ?? [];

  return (
    <div className={styles.postPage}>
      {/* Back nav */}
      <Link href="/posts" className={styles.backNav}>
        <ArrowLeft size={16} />
        Back to Feed
      </Link>

      <div className={styles.layout}>
        {/* Main content */}
        <main className={styles.main}>
          {/* Tags */}
          {tags.length > 0 && (
            <div className={styles.tagRow}>
              {tags.map((t, i) => {
                const name = getTagName(t);
                return name ? (
                  <Link key={i} href={`/tags/${name}`}>
                    <Badge variant="default" className={styles.tagBadge}>
                      #{name}
                    </Badge>
                  </Link>
                ) : null;
              })}
            </div>
          )}

          {/* Title */}
          <h1 className={styles.postTitle}>{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && <p className={styles.postExcerpt}>{post.excerpt}</p>}

          {/* Author & Meta */}
          <div className={styles.postMeta}>
            <Link
              href={`/users/${post.author?.id}`}
              className={styles.authorLink}
            >
              <Avatar
                src={post.author?.image ?? undefined}
                alt={post.author?.name ?? 'Author'}
                fallback={post.author?.name ?? 'A'}
                size="md"
              />
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>
                  {post.author?.name ?? 'Anonymous'}
                </span>
                <span className={styles.authorEmail}>{post.author?.email}</span>
              </div>
            </Link>

            <div className={styles.metaStats}>
              <span className={styles.metaStat}>
                <Calendar size={13} />
                {formatDate(post.createdAt)}
              </span>
              <span className={styles.metaDot}>·</span>
              <span className={styles.metaStat}>
                <Clock size={13} />
                {readTime} min read
              </span>
              {post.analytics?.views !== undefined && (
                <>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.metaStat}>
                    <Eye size={13} />
                    {post.analytics.views} views
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Content */}
          <div className={styles.contentWrapper}>
            <PostContent content={post.content} />
          </div>

          {/* Post Actions Bar */}
          <div className={styles.actionsBar} id="actions">
            <div className={styles.actionsLeft}>
              <button
                className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
                onClick={() => isAuthenticated && toggleLike.mutate()}
                disabled={!isAuthenticated || toggleLike.isPending}
                aria-label={isLiked ? 'Unlike post' : 'Like post'}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{post._count?.likes ?? 0} likes</span>
              </button>

              <a href="#comments" className={styles.actionBtn}>
                <MessageSquare size={18} />
                <span>{post._count?.comments ?? 0} comments</span>
              </a>
            </div>

            <div className={styles.actionsRight}>
              <button
                className={`${styles.actionBtn} ${isBookmarked ? styles.bookmarked : ''}`}
                onClick={() => isAuthenticated && toggleBookmark.mutate()}
                disabled={!isAuthenticated || toggleBookmark.isPending}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
              >
                <Bookmark
                  size={18}
                  fill={isBookmarked ? 'currentColor' : 'none'}
                />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => handleShare(post)}
                aria-label="Share post"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>

              {(isOwner || user?.role === 'ADMIN') && (
                <Dropdown
                  trigger={
                    <button
                      className={styles.moreBtn}
                      aria-label="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  }
                  items={[
                    {
                      label: 'Edit Post',
                      icon: <Edit size={14} />,
                      onClick: () => router.push(`/posts/${post.slug}/edit`),
                    },
                    {
                      label: 'Delete Post',
                      icon: <Trash2 size={14} />,
                      onClick: handleDelete,
                      variant: 'danger' as const,
                    },
                  ]}
                />
              )}
            </div>
          </div>

          {/* Comments placeholder */}
          <div className={styles.commentsSection} id="comments">
            <h2 className={styles.commentsSectionTitle}>
              <MessageSquare size={20} />
              Comments ({post._count?.comments ?? 0})
            </h2>
            <div className={styles.commentsComingSoon}>
              <p>Comments section — coming in Phase 3</p>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Author card */}
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>About the Author</h3>
            <Link
              href={`/users/${post.author?.id}`}
              className={styles.sidebarAuthor}
            >
              <Avatar
                src={post.author?.image ?? undefined}
                alt={post.author?.name ?? 'Author'}
                fallback={post.author?.name ?? 'A'}
                size="lg"
              />
              <span className={styles.sidebarAuthorName}>
                {post.author?.name ?? 'Anonymous'}
              </span>
            </Link>
          </div>

          {/* Tags cloud */}
          {tags.length > 0 && (
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Tags</h3>
              <div className={styles.sidebarTags}>
                {tags.map((t, i) => {
                  const name = getTagName(t);
                  return name ? (
                    <Link key={i} href={`/tags/${name}`}>
                      <Badge
                        variant="outline"
                        className={styles.sidebarTagBadge}
                      >
                        #{name}
                      </Badge>
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Status info for owner */}
          {isOwner && (
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Post Status</h3>
              <div className={styles.statusInfo}>
                <Badge
                  variant={post.status === 'PUBLISHED' ? 'success' : 'warning'}
                >
                  {post.status}
                </Badge>
                <Badge
                  variant={post.visibility === 'PUBLIC' ? 'info' : 'default'}
                >
                  {post.visibility}
                </Badge>
              </div>
              <Link
                href={`/posts/${post.slug}/edit`}
                className={styles.editLink}
              >
                <Edit size={14} /> Edit Post
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
