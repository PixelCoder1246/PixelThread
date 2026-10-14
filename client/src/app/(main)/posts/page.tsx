'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, PenTool, Sparkles, Compass, MessageSquare, Heart, Clock } from 'lucide-react';
import styles from './page.module.css';
import { postsService } from '@/services/posts.service';
import { queryKeys } from '@/lib/queryKeys';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/date';

const s = styles as Record<string, string>;

export default function PostsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.posts.list(1, 10),
    queryFn: () => postsService.getAllPosts(1, 10),
  });

  const posts = data?.posts ?? [];
  const hasPosts = posts.length > 0;

  return (
    <div className={s.postsPage}>
      <header className={s.postsHeader}>
        <div className={s.headerTitleGroup}>
          <h1>Explore Posts</h1>
          <span className={s.headerSubtitle}>
            Discover stories, tech insights, and creative ideas from our community
          </span>
        </div>
        <Link href="/posts/new" className={s.createBtn}>
          <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
          <span>Write a Post</span>
        </Link>
      </header>

      {isLoading ? (
        <div className={s.postsList}>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : isError ? (
        <div className={s.errorState}>
          <p>{error instanceof Error ? error.message : 'Failed to load posts.'}</p>
          <button onClick={() => refetch()} className={s.exploreBtn} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      ) : hasPosts ? (
        <div className={s.postsList}>
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className={s.postCard}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {post.tags?.map((t, idx) => (
                  <Badge key={idx} variant="default">
                    #{typeof t === 'string' ? t : (t as any).name || (t as any).tag?.name}
                  </Badge>
                ))}
              </div>
              <h2 className={s.postCardTitle}>{post.title}</h2>
              {post.excerpt && <p className={s.postCardExcerpt}>{post.excerpt}</p>}
              <div className={s.postCardMeta}>
                <div className={s.postAuthorGroup}>
                  <Avatar alt={post.author?.name || 'Author'} fallback={post.author?.name || 'A'} src={post.author?.image || undefined} size="sm" />
                  <span>{post.author?.name || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className={s.postCardStats}>
                  <span className={s.statItem}>
                    <Heart style={{ width: '0.875rem', height: '0.875rem' }} />
                    {post._count?.likes ?? 0}
                  </span>
                  <span className={s.statItem}>
                    <MessageSquare style={{ width: '0.875rem', height: '0.875rem' }} />
                    {post._count?.comments ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={s.emptyState}>
          <div className={s.emptyStateGlow} />
          <div className={s.emptyIconWrapper}>
            <PenTool className={s.emptyIcon} />
            <Sparkles className={s.emptySparkle} />
          </div>
          <h2 className={s.emptyTitle}>No posts here yet</h2>
          <p className={s.emptyDescription}>
            Be the first creator to share your story or dive into topics with our community.
            Start writing or explore trending tags.
          </p>
          <div className={s.emptyActions}>
            <Link href="/posts/new" className={s.createBtn}>
              <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
              <span>Create First Post</span>
            </Link>
            <Link href="/search" className={s.exploreBtn}>
              <Compass style={{ width: '1.125rem', height: '1.125rem' }} />
              <span>Explore Topics</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}