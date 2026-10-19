'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Hash, ArrowLeft, FileText } from 'lucide-react';
import { useTagPosts } from '@/features/tags/useTags';
import { PostCard } from '@/components/post/PostCard';
import { Pagination } from '@/components/ui/Pagination';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import type { PostListItem } from '@/types/post';
import styles from './page.module.css';

function adaptTagPost(p: unknown): PostListItem {
  const post = p as Record<string, unknown>;
  const tags = (post.tags as unknown[]) ?? [];
  // normalize tags — backend returns {id, name} or {tag: {id, name}}
  const normalizedTags = tags.map((t) => {
    const tag = t as Record<string, unknown>;
    if (tag.tag) return tag as { tag: { id: string; name: string } };
    return { tag: { id: tag.id as string, name: tag.name as string } };
  });

  return {
    id: post.id as string,
    title: post.title as string,
    slug: post.slug as string,
    excerpt: post.excerpt as string | null,
    content: (post.content as PostListItem['content']) ?? [],
    status: (post.status as PostListItem['status']) ?? 'PUBLISHED',
    visibility: (post.visibility as PostListItem['visibility']) ?? 'PUBLIC',
    authorId:
      (post.author as { id?: string })?.id ?? (post.authorId as string) ?? '',
    author: post.author as PostListItem['author'],
    tags: normalizedTags,
    createdAt: post.createdAt as string,
    updatedAt: (post.updatedAt as string) ?? (post.createdAt as string),
    featured: false,
    pinned: false,
    analytics: (post.analytics as PostListItem['analytics']) ?? undefined,
    _count: (post._count as PostListItem['_count']) ?? undefined,
  };
}

export default function TagPage() {
  const params = useParams();
  const rawName = params.name as string;
  const name = decodeURIComponent(rawName);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useTagPosts(name, page, 10);

  const tag = data?.tag;
  const posts = (data?.posts ?? []).map(adaptTagPost);
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className={styles.tagPage}>
      <Link href="/tags" className={styles.backNav}>
        <ArrowLeft size={16} />
        All Tags
      </Link>

      <header className={styles.header}>
        <div className={styles.tagHero}>
          <div className={styles.tagIcon}>
            <Hash size={24} />
          </div>
          <div>
            <h1 className={styles.tagTitle}>#{tag?.name ?? name}</h1>
            <p className={styles.tagMeta}>
              {pagination
                ? `${(pagination as { total?: number }).total ?? posts.length} posts tagged with this topic`
                : 'Posts tagged with this topic'}
            </p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.postsList}>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : isError ? (
        <div className={styles.errorState}>
          <p>Failed to load posts for this tag. It may not exist.</p>
          <Link href="/tags" className={styles.browseLink}>
            Browse all tags
          </Link>
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={40} className={styles.emptyIcon} />
          <h3>No posts yet</h3>
          <p>
            Be the first to write about <strong>#{name}</strong>!
          </p>
          <Link href="/posts/new" className={styles.writeBtn}>
            Write a Post
          </Link>
        </div>
      ) : (
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
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
