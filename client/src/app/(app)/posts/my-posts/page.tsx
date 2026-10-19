'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useUserPosts } from '@/features/users/useUser';
import { PostList } from '@/components/post/PostList';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
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

export default function MyPostsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const LIMIT = 10;

  const { data, isLoading, isError, error, refetch } = useUserPosts(
    user?.id ?? '',
    page,
    LIMIT,
    'newest',
    !!user?.id
  );

  const allPosts = (data?.posts ?? []).map(adaptPost);
  const filteredPosts = allPosts.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className={styles.myPostsPage}>
      <div className={styles.myPostsHeader}>
        <div>
          <h1>My Posts</h1>
          <p
            style={{
              color: 'var(--muted-foreground)',
              marginTop: '0.25rem',
              fontSize: '0.9375rem',
            }}
          >
            Manage and edit all your published stories and drafts
          </p>
        </div>
        <Link href="/posts/new">
          <Button
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            New Story
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
        }}
      >
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          style={{
            padding: '0.375rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            background: filter === 'ALL' ? 'var(--primary)' : 'transparent',
            color:
              filter === 'ALL'
                ? 'var(--primary-foreground)'
                : 'var(--muted-foreground)',
          }}
        >
          All ({allPosts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('PUBLISHED')}
          style={{
            padding: '0.375rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            background:
              filter === 'PUBLISHED' ? 'var(--primary)' : 'transparent',
            color:
              filter === 'PUBLISHED'
                ? 'var(--primary-foreground)'
                : 'var(--muted-foreground)',
          }}
        >
          Published ({allPosts.filter((p) => p.status === 'PUBLISHED').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('DRAFT')}
          style={{
            padding: '0.375rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            background: filter === 'DRAFT' ? 'var(--primary)' : 'transparent',
            color:
              filter === 'DRAFT'
                ? 'var(--primary-foreground)'
                : 'var(--muted-foreground)',
          }}
        >
          Drafts ({allPosts.filter((p) => p.status === 'DRAFT').length})
        </button>
      </div>

      <div className={styles.myPostsList}>
        <PostList
          posts={filteredPosts}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          emptyTitle={
            filter === 'DRAFT' ? 'No drafts found' : 'No stories found'
          }
          emptyDescription={
            filter === 'DRAFT'
              ? 'You do not have any saved drafts right now.'
              : 'You have not written any stories yet. Start writing your first story!'
          }
        />

        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '2rem',
            }}
          >
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
