'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Clock, ArrowUpDown } from 'lucide-react';
import { useSearchPosts } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import { tagsService } from '@/services/tags';
import { cn, formatNumber, formatRelativeDate } from '@/lib/utils';
import { DEBOUNCE_DELAY, SEARCH_MIN_QUERY, SORT_OPTIONS } from '@/constants';
import type { Tag } from '@/types';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/common/SearchInput';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import styles from './page.module.css';

const SORT_OPTIONS_LIST = [
  { value: SORT_OPTIONS.RELEVANCE, label: 'Relevance' },
  { value: SORT_OPTIONS.NEWEST, label: 'Newest' },
  { value: SORT_OPTIONS.OLDEST, label: 'Oldest' },
  { value: SORT_OPTIONS.MOST_VIEWED, label: 'Most Viewed' },
  { value: SORT_OPTIONS.MOST_LIKED, label: 'Most Liked' },
];

const RECENT_SEARCHES_KEY = 'pixelthread_recent_searches';
const MAX_RECENT = 8;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT))
    );
  } catch {
    // silently fail
  }
}

function removeRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  } catch {
    // silently fail
  }
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(
    searchParams.get('tag') ?? undefined
  );
  const [sort, setSort] = useState<string>(SORT_OPTIONS.RELEVANCE);
  const [tags, setTags] = useState<Tag[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(!!searchParams.get('q'));

  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    tagsService
      .getAll({ limit: 30 })
      .then((res) => setTags(res.tags))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    if (q) {
      setQuery(q);
      setHasSubmitted(true);
    }
    if (tag) setSelectedTag(tag);
  }, [searchParams]);

  const searchEnabled =
    hasSubmitted && debouncedQuery.length >= SEARCH_MIN_QUERY;
  const { data, isLoading, isError, error } = useSearchPosts(
    searchEnabled
      ? { q: debouncedQuery, tag: selectedTag, sort }
      : { q: '', tag: undefined, sort: undefined }
  );

  const posts = data?.posts ?? [];

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (query.trim().length >= SEARCH_MIN_QUERY) {
      saveRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
      setHasSubmitted(true);
      const params = new URLSearchParams({ q: query.trim() });
      if (selectedTag) params.set('tag', selectedTag);
      router.push(`/search?${params.toString()}`);
    }
  }, [query, selectedTag, router]);

  const handleRecentClick = useCallback(
    (q: string) => {
      setQuery(q);
      saveRecentSearch(q);
      setRecentSearches(getRecentSearches());
      setHasSubmitted(true);
      const params = new URLSearchParams({ q });
      if (selectedTag) params.set('tag', selectedTag);
      router.push(`/search?${params.toString()}`);
    },
    [selectedTag, router]
  );

  const handleTagFilter = useCallback((tagName: string) => {
    setSelectedTag((prev) => (prev === tagName ? undefined : tagName));
  }, []);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSort(e.target.value);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setSelectedTag(undefined);
    setSort(SORT_OPTIONS.RELEVANCE);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Search</h1>
        <div className={styles.searchWrapper}>
          <SearchInput
            value={query}
            onChange={handleSearch}
            placeholder="Search posts..."
            onClear={() => {
              setQuery('');
              setHasSubmitted(false);
            }}
          />
        </div>
        <p className={styles.prompt}>
          Search by title, content, or tags. Minimum {SEARCH_MIN_QUERY}{' '}
          characters.
        </p>
      </div>

      {!hasSubmitted && recentSearches.length > 0 && (
        <section className={styles.recentSearches}>
          <h2 className={styles.recentTitle}>
            <Clock
              size={14}
              style={{
                display: 'inline',
                marginRight: 'var(--space-1)',
                verticalAlign: 'middle',
              }}
            />
            Recent Searches
          </h2>
          <div className={styles.recentList}>
            {recentSearches.map((q) => (
              <span
                key={q}
                className={styles.recentItem}
                onClick={() => handleRecentClick(q)}
              >
                {q}
                <button
                  type="button"
                  className={styles.recentRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(q);
                    setRecentSearches(getRecentSearches());
                  }}
                  aria-label={`Remove ${q}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      {hasSubmitted && (
        <div className={styles.filters}>
          <span className={styles.filterLabel}>Tags:</span>
          <div className={styles.filterTags}>
            {tags.slice(0, 10).map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTag === tag.name ? 'primary' : 'default'}
                size="sm"
                onClick={() => handleTagFilter(tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          <select
            className={styles.sortSelect}
            value={sort}
            onChange={handleSortChange}
            aria-label="Sort by"
          >
            {SORT_OPTIONS_LIST.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading && hasSubmitted ? (
        <LoadingState message="Searching..." />
      ) : isError ? (
        <div className={styles.error}>
          <p
            style={{
              color: 'var(--color-error)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {(error as Error)?.message || 'Search failed'}
          </p>
          <Button variant="secondary" onClick={handleSearchSubmit}>
            Try Again
          </Button>
        </div>
      ) : hasSubmitted && posts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`No posts match "${query}"${selectedTag ? ` in #${selectedTag}` : ''}. Try different keywords or filters.`}
          action={
            selectedTag || sort !== SORT_OPTIONS.RELEVANCE ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : hasSubmitted ? (
        <div className={styles.results}>
          {posts.map((post) => (
            <article
              key={post.id}
              className={styles.resultCard}
              onClick={() => router.push(`/posts/${post.slug}`)}
            >
              <h3 className={styles.resultTitle}>{post.title}</h3>
              {post.excerpt && (
                <p className={styles.resultExcerpt}>{post.excerpt}</p>
              )}
              {post.tags?.length > 0 && (
                <div className={styles.resultTags}>
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="default" size="sm">
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              <div className={styles.resultMeta}>
                <span>{post.author.name}</span>
                <span>&middot;</span>
                <span>
                  {formatRelativeDate(post.publishedAt ?? post.createdAt)}
                </span>
                <span>&middot;</span>
                <span className={styles.metaCount}>
                  {formatNumber(post.analytics.views)} views
                </span>
                <span>&middot;</span>
                <span className={styles.metaCount}>
                  {formatNumber(post.analytics.likes)} likes
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
