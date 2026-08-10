'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Clock,
  ArrowUp,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { usePost, useRecordView } from '@/hooks/usePosts';
import { useComments, useCreateComment, useReplyToComment } from '@/hooks/useComments';
import { useTogglePostLike } from '@/hooks/useLikes';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { bookmarksService } from '@/services/bookmarks';
import { formatDate, formatRelativeDate, formatNumber, getInitials, getRandomColor, cn, extractTextFromContent, blocksToMarkdown } from '@/lib/utils';
import type { Post, Comment } from '@/types';
import styles from './page.module.css';

interface PostDetailClientProps {
  post: Post;
}

export default function PostDetailClient({ post: initialPost }: PostDetailClientProps) {
  const { data: post, isLoading, isError } = usePost(initialPost.slug);
  const { user } = useAuth();
  const recordView = useRecordView(initialPost.id);
  const toggleLike = useTogglePostLike();
  const { data: comments, isLoading: commentsLoading } = useComments(initialPost.id);
  const createComment = useCreateComment(initialPost.id);
  const replyToComment = useReplyToComment(initialPost.id);

  const currentPost = post || initialPost;

  const author = currentPost?.author;

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(initialPost.isBookmarked || false);
  const [activeHeading, setActiveHeading] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const postText = extractTextFromContent(currentPost.content);
  const wordCount = postText ? postText.trim().split(/\s+/).length : 0;

  const markdownContent = useMemo(() => {
    return blocksToMarkdown(currentPost.content);
  }, [currentPost.content]);

  useEffect(() => {
    recordView.mutate();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
      const headings = document.querySelectorAll('h1, h2, h3');
      let current = '';
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          current = heading.textContent || '';
        }
      });
      setActiveHeading(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tocItems = useMemo(() => {
    if (!markdownContent) return [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: { level: number; text: string; id: string }[] = [];
    let match;
    while ((match = headingRegex.exec(markdownContent)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      items.push({ level, text, id });
    }
    return items;
  }, [markdownContent]);

  const handleLike = useCallback(async () => {
    try {
      await toggleLike.mutateAsync(currentPost.id);
    } catch {
      toast.error('Failed to like post');
    }
  }, [currentPost.id, toggleLike]);

  const handleBookmark = useCallback(async () => {
    try {
      const result = await bookmarksService.toggle(currentPost.id);
      setIsBookmarked(result.bookmarked);
      toast.success(result.bookmarked ? 'Bookmarked' : 'Removed bookmark');
    } catch {
      toast.error('Failed to toggle bookmark');
    }
  }, [currentPost.id]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: currentPost.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  }, [currentPost.title]);

  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync(commentText.trim());
      setCommentText('');
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    }
  }, [commentText, createComment]);

  const handleSubmitReply = useCallback(
    async (commentId: string) => {
      if (!replyText.trim()) return;
      try {
        await replyToComment.mutateAsync({ commentId, content: replyText.trim() });
        setReplyText('');
        setReplyingTo(null);
        toast.success('Reply posted');
      } catch {
        toast.error('Failed to post reply');
      }
    },
    [replyText, replyToComment],
  );

  const renderComment = (comment: Comment, isReply = false) => {
    const initials = getInitials(comment.author.name);
    const avatarBg = getRandomColor(comment.author.name);

    return (
      <div key={comment.id}>
        <div className={styles.comment}>
          {comment.author.image ? (
            <img src={comment.author.image} alt={comment.author.name} className={styles.commentAvatar} />
          ) : (
            <div className={styles.commentAvatarPlaceholder} style={{ background: avatarBg }}>
              {initials}
            </div>
          )}
          <div className={styles.commentBody}>
            <div className={styles.commentHeader}>
              <span className={styles.commentAuthor}>{comment.author.name}</span>
              <span className={styles.commentTime}>{formatRelativeDate(comment.createdAt)}</span>
            </div>
            <p className={styles.commentContent}>{comment.content}</p>
            <div className={styles.commentActions}>
              <button type="button" className={cn(styles.commentActionBtn, comment.isLiked && styles.liked)}>
                <Heart size={12} />
                {formatNumber(comment.likeCount)}
              </button>
              {!isReply && (
                <button
                  type="button"
                  className={styles.commentActionBtn}
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <MessageCircle size={12} />
                  Reply
                </button>
              )}
            </div>
          </div>
        </div>

        {replyingTo === comment.id && (
          <div className={styles.replyForm}>
            <textarea
              className={styles.replyTextarea}
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
            />
            <div className={styles.replyFormActions}>
              <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                isLoading={replyToComment.isPending}
                disabled={!replyText.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className={styles.replies}>
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.skeleton}>
        <div className={styles.skeletonCover} />
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonMeta} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState fullPage message="Failed to load post" />;
  }

  return (
    <div className={styles.page}>
      <article>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            {currentPost.tags && currentPost.tags.length > 0 && (
              <span className={styles.category}>{currentPost.tags[0].name}</span>
            )}
            <h1 className={styles.title}>{currentPost.title}</h1>
            <div className={styles.meta}>
              <div className={styles.authorInfo}>
                {author?.image ? (
                  <img src={author.image} alt={author.name} className={styles.authorAvatar} />
                ) : author ? (
                  <div
                    className={styles.authorAvatarPlaceholder}
                    style={{ background: getRandomColor(author.name) }}
                  >
                    {getInitials(author.name)}
                  </div>
                ) : null}
                {author && <span className={styles.authorName}>{author.name}</span>}
              </div>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>
                {currentPost.publishedAt ? formatDate(currentPost.publishedAt) : formatDate(currentPost.createdAt)}
              </span>
              <span className={styles.metaDot} />
              <span className={styles.metaText}>
                <Clock size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                {Math.max(1, Math.ceil(wordCount / 200))} min read
              </span>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={cn(styles.actionButton, currentPost.isLiked && styles.liked)}
                onClick={handleLike}
              >
                <Heart size={16} fill={currentPost.isLiked ? 'currentColor' : 'none'} />
                {formatNumber(currentPost.analytics?.likes || 0)}
              </button>
              <button
                type="button"
                className={cn(styles.actionButton, isBookmarked && styles.bookmarked)}
                onClick={handleBookmark}
              >
                <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              <button type="button" className={styles.actionButton} onClick={handleShare}>
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.content}>
            <div className={styles.contentBody}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ children, ...props }) => {
                    const text = extractTextFromContent(children);
                    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                    return <h1 id={id} {...props}>{children}</h1>;
                  },
                  h2: ({ children, ...props }) => {
                    const text = extractTextFromContent(children);
                    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                    return <h2 id={id} {...props}>{children}</h2>;
                  },
                  h3: ({ children, ...props }) => {
                    const text = extractTextFromContent(children);
                    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                    return <h3 id={id} {...props}>{children}</h3>;
                  },
                  code: ({ className, children, ...props }) => {
                    const text = extractTextFromContent(children);
                    return <code className={className}>{text}</code>;
                  },
                  pre: ({ children }) => <pre>{children}</pre>,
                  a: ({ href, children, ...props }) => (
                    <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" {...props}>
                      {children}
                    </a>
                  ),
                  img: ({ src, alt, ...props }) => (
                    <img src={src} alt={alt || ''} loading="lazy" {...props} />
                  ),
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>

            {currentPost.tags && currentPost.tags.length > 0 && (
              <div className={styles.tags}>
                {currentPost.tags.map((tag) => (
                  <Link key={tag.id} href={`/explore?tag=${tag.name}`} className={styles.tag}>
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            <div className={styles.commentsSection}>
              <h2 className={styles.commentsTitle}>
                Comments ({comments?.length || currentPost.analytics?.comments || 0})
              </h2>

              <div className={styles.commentForm}>
                <textarea
                  className={styles.commentTextarea}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                />
                <div className={styles.commentFormActions}>
                  <Button
                    onClick={handleSubmitComment}
                    isLoading={createComment.isPending}
                    disabled={!commentText.trim()}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>

              {commentsLoading ? (
                <LoadingState message="Loading comments..." />
              ) : comments && comments.length > 0 ? (
                <div className={styles.commentsList}>
                  {comments.map((comment) => renderComment(comment))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>

          <aside className={styles.sidebar}>
            {tocItems.length > 0 && (
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarTitle}>Table of Contents</h3>
                <nav className={styles.toc}>
                  {tocItems.map((item) => (
                    <a
                      key={item.text}
                      href={`#${item.id}`}
                      className={cn(styles.tocItem, activeHeading === item.text && styles.active)}
                      style={{ paddingLeft: `${item.level * 12 + 8}px` }}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Author</h3>
              {author && (
                <div className={styles.authorCard}>
                  {author.image ? (
                    <img src={author.image} alt={author.name} className={styles.authorCardAvatar} />
                  ) : (
                    <div
                      className={styles.authorCardAvatarPlaceholder}
                      style={{ background: getRandomColor(author.name) }}
                    >
                      {getInitials(author.name)}
                    </div>
                  )}
                  <span className={styles.authorCardName}>{author.name}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            zIndex: 50,
          }}
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
