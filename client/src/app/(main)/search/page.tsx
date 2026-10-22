'use client';

import { useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Users,
  Hash,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  useSearch,
  useSearchSuggestions,
  useTrendingSearches,
  usePopularTags,
} from '@/features/search/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { PostCard } from '@/components/post/PostCard';
import { FollowButton } from '@/components/user/FollowButton';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import type { PostListItem } from '@/types/post';
import styles from './page.module.css';

type SearchType = 'all' | 'posts' | 'users' | 'tags';
type SortMode = 'relevance' | 'newest' | 'oldest' | 'mostViewed' | 'mostLiked';

function adaptPost(p: unknown): PostListItem {
  const post = p as Record<string, unknown>;
  return {
    id: post.id as string,
    title: post.title as string,
    slug: post.slug as string,
    excerpt: post.excerpt as string | null,
    content: [],
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    authorId: (post.author as { id?: string })?.id ?? '',
    author: post.author as PostListItem['author'],
    tags: (post.tags as { tag: { id: string; name: string } }[]) ?? [],
    createdAt: post.createdAt as string,
    updatedAt: post.createdAt as string,
    featured: false,
    pinned: false,
    analytics: { views: (post.views as number) ?? 0 },
    _count: {
      likes: (post.likesCount as number) ?? 0,
      comments: 0,
    },
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [activeType, setActiveType] = useState<SearchType>('all');
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const { data: searchData, isLoading: searchLoading } = useSearch(
    { q: debouncedQuery, type: activeType, sort: sortMode, limit: 20 },
    debouncedQuery.trim().length >= 2
  );
  const { data: suggestions } = useSearchSuggestions(
    debouncedQuery,
    debouncedQuery.length >= 2 && !searchData
  );
  const { data: trending } = useTrendingSearches();
  const { data: popularTags } = usePopularTags();

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const handleClear = useCallback(() => {
    setQuery('');
    router.replace('/search');
  }, [router]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  const handleTrendingClick = useCallback(
    (keyword: string) => {
      setQuery(keyword);
      router.replace(`/search?q=${encodeURIComponent(keyword)}`);
    },
    [router]
  );

  const hasResults = !!searchData;
  const posts = useMemo(
    () => (searchData?.posts ?? []).map(adaptPost),
    [searchData?.posts]
  );
  const users = searchData?.users ?? [];
  const tags = searchData?.tags ?? [];

  const tabCounts = {
    all: posts.length + users.length + tags.length,
    posts: posts.length,
    users: users.length,
    tags: tags.length,
  };

  const showEmpty =
    hasResults &&
    !searchLoading &&
    posts.length === 0 &&
    users.length === 0 &&
    tags.length === 0;

  return (
    <div className={styles.searchPage}>
      {/* Search Header */}
      <div className={styles.searchHeader}>
        <h1 className={styles.pageTitle}>Search</h1>
        <p className={styles.pageSubtitle}>
          Discover posts, authors, and topics
        </p>

        {/* Search Form */}
        <form
          className={styles.searchForm}
          onSubmit={handleSearch}
          role="search"
        >
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              id="search-input"
              type="search"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search posts, authors, tags..."
              className={styles.searchInput}
              autoComplete="off"
              autoFocus={!initialQ}
            />
            {query && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClear}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ''}`}
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </form>

        {/* Filters panel */}
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort by</label>
              <div className={styles.filterOptions}>
                {(
                  [
                    'relevance',
                    'newest',
                    'oldest',
                    'mostViewed',
                    'mostLiked',
                  ] as SortMode[]
                ).map((s) => (
                  <button
                    key={s}
                    className={`${styles.filterOption} ${sortMode === s ? styles.filterOptionActive : ''}`}
                    onClick={() => setSortMode(s)}
                  >
                    {s === 'relevance'
                      ? 'Relevance'
                      : s === 'newest'
                        ? 'Newest'
                        : s === 'oldest'
                          ? 'Oldest'
                          : s === 'mostViewed'
                            ? 'Most Viewed'
                            : 'Most Liked'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      {debouncedQuery.trim().length >= 2 ? (
        <div className={styles.resultsArea}>
          {/* Type Tabs */}
          <div className={styles.typeTabs}>
            {(['all', 'posts', 'users', 'tags'] as SearchType[]).map((type) => (
              <button
                key={type}
                className={`${styles.typeTab} ${activeType === type ? styles.typeTabActive : ''}`}
                onClick={() => setActiveType(type)}
              >
                {type === 'all' && <Search size={14} />}
                {type === 'posts' && <FileText size={14} />}
                {type === 'users' && <Users size={14} />}
                {type === 'tags' && <Hash size={14} />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {hasResults && tabCounts[type] > 0 && (
                  <span className={styles.tabCount}>{tabCounts[type]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {searchLoading && (
            <div className={styles.skeletonList}>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          )}

          {/* Empty */}
          {showEmpty && (
            <div className={styles.emptyResults}>
              <Search size={40} className={styles.emptyIcon} />
              <h3>No results for &ldquo;{debouncedQuery}&rdquo;</h3>
              <p>Try different keywords or browse popular tags below.</p>
            </div>
          )}

          {/* Posts */}
          {!searchLoading &&
            (activeType === 'all' || activeType === 'posts') &&
            posts.length > 0 && (
              <section className={styles.resultsSection}>
                {activeType === 'all' && (
                  <h2 className={styles.sectionTitle}>
                    <FileText size={16} /> Posts
                  </h2>
                )}
                <div className={styles.postsList}>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

          {/* Users */}
          {!searchLoading &&
            (activeType === 'all' || activeType === 'users') &&
            users.length > 0 && (
              <section className={styles.resultsSection}>
                {activeType === 'all' && (
                  <h2 className={styles.sectionTitle}>
                    <Users size={16} /> Authors
                  </h2>
                )}
                <div className={styles.usersList}>
                  {users.map((user) => (
                    <div key={user.id} className={styles.userCard}>
                      <Link
                        href={`/users/${user.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flex: 1,
                          minWidth: 0,
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                      >
                        <Avatar
                          src={user.image ?? undefined}
                          alt={user.name}
                          fallback={user.name}
                          size="md"
                        />
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{user.name}</span>
                          <span className={styles.userMeta}>
                            {user.postsCount} posts · {user.followersCount}{' '}
                            followers
                          </span>
                        </div>
                      </Link>
                      <FollowButton
                        userId={user.id}
                        userName={user.name}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Tags */}
          {!searchLoading &&
            (activeType === 'all' || activeType === 'tags') &&
            tags.length > 0 && (
              <section className={styles.resultsSection}>
                {activeType === 'all' && (
                  <h2 className={styles.sectionTitle}>
                    <Hash size={16} /> Tags
                  </h2>
                )}
                <div className={styles.tagsList}>
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.name}`}
                      className={styles.tagCard}
                    >
                      <Badge variant="default" className={styles.tagCardBadge}>
                        #{tag.name}
                      </Badge>
                      <span className={styles.tagCount}>
                        {tag.postCount} posts
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
        </div>
      ) : (
        /* Discovery state when no query */
        <div className={styles.discoveryArea}>
          {/* Trending searches */}
          {trending && trending.length > 0 && (
            <section className={styles.discoverySection}>
              <h2 className={styles.discoverySectionTitle}>
                <TrendingUp size={16} /> Trending Searches
              </h2>
              <div className={styles.trendingList}>
                {trending.slice(0, 8).map((item, i) => (
                  <button
                    key={i}
                    className={styles.trendingItem}
                    onClick={() => handleTrendingClick(item.keyword)}
                  >
                    <TrendingUp size={13} className={styles.trendingIcon} />
                    <span>{item.keyword}</span>
                    <span className={styles.trendingCount}>{item.count}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Popular Tags */}
          {popularTags && popularTags.length > 0 && (
            <section className={styles.discoverySection}>
              <h2 className={styles.discoverySectionTitle}>
                <Hash size={16} /> Popular Tags
              </h2>
              <div className={styles.popularTagsGrid}>
                {popularTags.slice(0, 16).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.name}`}
                    className={styles.popularTagItem}
                  >
                    <span className={styles.popularTagName}>#{tag.name}</span>
                    <span className={styles.popularTagCount}>
                      {tag.postCount}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(!trending || trending.length === 0) &&
            (!popularTags || popularTags.length === 0) && (
              <div className={styles.searchPrompt}>
                <Search size={48} className={styles.promptIcon} />
                <h2>Start searching</h2>
                <p>
                  Type at least 2 characters to search for posts, authors, and
                  tags.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}
        >
          <Spinner size="lg" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
