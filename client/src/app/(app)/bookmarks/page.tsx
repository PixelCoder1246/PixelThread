'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Bookmark,
  BookmarkX,
  LayoutGrid,
  List,
  Heart,
  MessageSquare,
  Eye,
  ArrowRight,
} from 'lucide-react';
import {
  useMyBookmarks,
  useRemoveBookmark,
} from '@/features/bookmarks/useBookmark';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function BookmarksPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { data, isLoading } = useMyBookmarks(page, 10, sort);
  const removeBookmark = useRemoveBookmark();

  const posts = data?.posts ?? [];
  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems ?? posts.length;
  const totalPages = pagination?.totalPages ?? 1;

  const handleRemove = async (postId: string) => {
    await removeBookmark.mutateAsync(postId);
  };

  return (
    <div className={styles.bookmarksPage}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Saved Stories</h1>
          <p className={styles.subtitle}>
            {totalItems > 0
              ? `${totalItems} ${totalItems === 1 ? 'story' : 'stories'} saved in your library`
              : 'Keep track of articles you want to read again'}
          </p>
        </div>

        {totalItems > 0 && (
          <div className={styles.controls}>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as 'newest' | 'oldest');
                setPage(1);
              }}
              className={styles.sortSelect}
              aria-label="Sort bookmarks"
            >
              <option value="newest">Recently Saved</option>
              <option value="oldest">Oldest Saved</option>
            </select>

            <div
              className={styles.viewToggle}
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleBtnActive : ''}`}
                title="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleBtnActive : ''}`}
                title="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      {isLoading ? (
        <div
          className={
            viewMode === 'grid' ? styles.bookmarksGrid : styles.bookmarksList
          }
        >
          {[1, 2, 3].map((i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.emptyState}>
          <Bookmark size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Your library is empty</h2>
          <p className={styles.emptySubtitle}>
            When reading stories, tap the bookmark icon to save them here for
            later.
          </p>
          <Link href="/posts">
            <Button size="lg" className="gap-2">
              <span>Explore Stories</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid' ? styles.bookmarksGrid : styles.bookmarksList
            }
          >
            {posts.map((post) => {
              const formattedDate = post.publishedAt
                ? formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                  })
                : '';

              return (
                <article key={post.id} className={styles.bookmarkCard}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div className={styles.authorMeta}>
                        <Avatar
                          src={post.author?.image ?? undefined}
                          fallback={(post.author?.name || 'A')
                            .charAt(0)
                            .toUpperCase()}
                          size="sm"
                        />
                        <div>
                          <Link
                            href={`/users/${post.author?.name}`}
                            className={styles.authorName}
                          >
                            {post.author?.name ?? 'Author'}
                          </Link>
                          {formattedDate && (
                            <span className={styles.cardDate}>
                              {' '}
                              · {formattedDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/posts/${post.slug}`}
                      className={styles.cardTitle}
                    >
                      {post.title}
                    </Link>

                    {post.excerpt && (
                      <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.cardStats}>
                      <span className={styles.statItem} title="Likes">
                        <Heart size={14} />
                        <span>{post.likes ?? post._count?.likes ?? 0}</span>
                      </span>
                      <span className={styles.statItem} title="Responses">
                        <MessageSquare size={14} />
                        <span>
                          {post.comments ?? post._count?.comments ?? 0}
                        </span>
                      </span>
                      {(post.views !== undefined ||
                        post.analytics?.views !== undefined) && (
                        <span className={styles.statItem} title="Views">
                          <Eye size={14} />
                          <span>
                            {post.views ?? post.analytics?.views ?? 0}
                          </span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(post.id)}
                      className={styles.removeBtn}
                      title="Remove from saved stories"
                      aria-label={`Remove ${post.title} from bookmarks`}
                    >
                      <BookmarkX size={15} />
                      <span>Remove</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
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
