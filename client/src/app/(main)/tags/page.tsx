'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Hash, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useAllTags } from '@/features/tags/useTags';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

type SortMode = 'mostUsed' | 'alphabetical';

export default function TagsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortMode>('mostUsed');

  const { data, isLoading, isError } = useAllTags(page, 30, sort);

  const tags = data?.tags ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const total = data?.pagination?.total ?? 0;

  return (
    <div className={styles.tagsPage}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Hash size={28} className={styles.titleIcon} />
            Explore Tags
          </h1>
          <p className={styles.subtitle}>
            {total > 0
              ? `${total} tags from the community`
              : 'Browse topics from the community'}
          </p>
        </div>

        {/* Sort controls */}
        <div className={styles.sortControls}>
          <button
            className={`${styles.sortBtn} ${sort === 'mostUsed' ? styles.sortBtnActive : ''}`}
            onClick={() => {
              setSort('mostUsed');
              setPage(1);
            }}
          >
            <TrendingUp size={14} />
            Most Used
          </button>
          <button
            className={`${styles.sortBtn} ${sort === 'alphabetical' ? styles.sortBtnActive : ''}`}
            onClick={() => {
              setSort('alphabetical');
              setPage(1);
            }}
          >
            <ArrowUpDown size={14} />
            A–Z
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.loadingWrapper}>
          <Spinner size="md" />
        </div>
      ) : isError ? (
        <div className={styles.errorState}>
          <p>Failed to load tags.</p>
        </div>
      ) : tags.length === 0 ? (
        <div className={styles.emptyState}>
          <Hash size={40} className={styles.emptyIcon} />
          <p>
            No tags yet. Tags are created automatically when posts are
            published.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tagsGrid}>
            {tags.map((tag) => {
              const size = Math.min(Math.max(tag.postCount / 5, 0), 1);
              return (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.name}`}
                  className={styles.tagCard}
                >
                  <div
                    className={styles.tagGlow}
                    style={{ opacity: 0.3 + size * 0.7 }}
                  />
                  <span className={styles.tagName}>#{tag.name}</span>
                  <span className={styles.tagCount}>
                    {tag.postCount} {tag.postCount === 1 ? 'post' : 'posts'}
                  </span>
                </Link>
              );
            })}
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
