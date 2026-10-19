'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, PenTool, Sparkles, Compass } from 'lucide-react';
import { usePosts } from '@/features/posts/usePosts';
import { usePopularTags } from '@/features/search/useSearch';
import { PostCard } from '@/components/post/PostCard';
import { Pagination } from '@/components/ui/Pagination';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import type { PostListItem } from '@/types/post';
import styles from './page.module.css';

function adaptPost(p: unknown): PostListItem {
  const post = p as Record<string, unknown>;
  const tags = (post.tags as unknown[]) ?? [];
  const normalizedTags = tags.map((t) => {
    const tag = t as Record<string, unknown>;
    if (tag.tag) return tag as { tag: { id: string; name: string } };
    return {
      tag: { id: (tag.id as string) ?? '', name: (tag.name as string) ?? '' },
    };
  });

  return {
    id: post.id as string,
    title: post.title as string,
    slug: post.slug as string,
    excerpt: (post.excerpt as string | null) ?? null,
    content: (post.content as PostListItem['content']) ?? [],
    status: (post.status as PostListItem['status']) ?? 'PUBLISHED',
    visibility: (post.visibility as PostListItem['visibility']) ?? 'PUBLIC',
    authorId: (post.authorId as string) ?? '',
    author: post.author as PostListItem['author'],
    tags: normalizedTags,
    createdAt: post.createdAt as string,
    updatedAt: (post.updatedAt as string) ?? (post.createdAt as string),
    featured: (post.featured as boolean) ?? false,
    pinned: (post.pinned as boolean) ?? false,
    analytics: (post.analytics as PostListItem['analytics']) ?? undefined,
    _count: (post._count as PostListItem['_count']) ?? undefined,
  };
}

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { data, isLoading, isError, error, refetch } = usePosts(page, LIMIT);
  const { data: popularTagsData } = usePopularTags();

  const posts = (data?.posts ?? []).map(adaptPost);
  const totalPages = data?.pagination?.totalPages ?? 1;
  const hasPosts = posts.length > 0;

  return (
    <div className={styles.postsPage}>
      <header className={styles.postsHeader}>
        <div className={styles.headerTitleGroup}>
          <h1>Explore Posts</h1>
          <span className={styles.headerSubtitle}>
            Discover stories, tech insights, and creative ideas from our
            community
          </span>
        </div>
        <Link href="/posts/new" className={styles.createBtn}>
          <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
          <span>Write a Post</span>
        </Link>
      </header>

      <div className={styles.feedLayout}>
        {/* Main feed */}
        <div className={styles.feedMain}>
          {isLoading ? (
            <div className={styles.postsList}>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : isError ? (
            <div className={styles.errorState}>
              <p>
                {error instanceof Error
                  ? error.message
                  : 'Failed to load posts.'}
              </p>
              <button
                onClick={() => refetch()}
                className={styles.exploreBtn}
                style={{ marginTop: '1rem' }}
              >
                Try Again
              </button>
            </div>
          ) : hasPosts ? (
            <>
              <div className={styles.postsList}>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className={styles.emptyState}>
              <div className={styles.emptyStateGlow} />
              <div className={styles.emptyIconWrapper}>
                <PenTool className={styles.emptyIcon} />
                <Sparkles className={styles.emptySparkle} />
              </div>
              <h2 className={styles.emptyTitle}>No posts here yet</h2>
              <p className={styles.emptyDescription}>
                Be the first creator to share your story or dive into topics
                with our community. Start writing or explore trending tags.
              </p>
              <div className={styles.emptyActions}>
                <Link href="/posts/new" className={styles.createBtn}>
                  <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
                  <span>Create First Post</span>
                </Link>
                <Link href="/search" className={styles.exploreBtn}>
                  <Compass style={{ width: '1.125rem', height: '1.125rem' }} />
                  <span>Explore Topics</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.feedSidebar}>
          {/* Popular tags */}
          {popularTagsData && popularTagsData.length > 0 && (
            <div className={styles.sidebarWidget}>
              <h3 className={styles.widgetTitle}>Popular Tags</h3>
              <div className={styles.widgetTags}>
                {popularTagsData.slice(0, 10).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.name}`}
                    className={styles.widgetTag}
                  >
                    #{tag.name}
                    <span className={styles.widgetTagCount}>
                      {tag.postCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Explore link */}
          <div className={styles.sidebarWidget}>
            <Link href="/search" className={styles.discoverLink}>
              <Compass size={16} />
              Discover Authors
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
