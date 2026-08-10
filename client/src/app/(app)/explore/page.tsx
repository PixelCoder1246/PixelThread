'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Compass } from 'lucide-react';
import { postsService } from '@/services/posts';
import { tagsService } from '@/services/tags';
import { cn, formatRelativeDate, formatNumber } from '@/lib/utils';
import { ROUTES, DEBOUNCE_DELAY } from '@/constants';
import type { Post, Tag } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/common/SearchInput';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import styles from './page.module.css';

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tagsService.getAll({ limit: 30 })
      .then((res) => setTags(res.tags))
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(async (tag?: string | null) => {
    setIsPostsLoading(true);
    setError(null);
    try {
      if (tag) {
        const res = await tagsService.getPosts(tag);
        setPosts(res.posts);
      } else {
        const res = await postsService.getAll({ limit: 20 });
        setPosts(res.posts);
      }
    } catch {
      setError('Failed to load posts');
    } finally {
      setIsPostsLoading(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeTag);
  }, [activeTag, fetchPosts]);

  const handleTagClick = (tagName: string) => {
    setActiveTag((prev) => (prev === tagName ? null : tagName));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length >= 2) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <LoadingState message="Discovering content..." />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Compass size={40} style={{ color: 'var(--primary-500)', margin: '0 auto var(--space-4)' }} />
        <h1 className={styles.heroTitle}>Explore</h1>
        <p className={styles.heroDescription}>
          Discover posts, follow topics, and find your next read.
        </p>
        <div className={styles.heroSearch}>
          <SearchInput
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search posts..."
            onClear={() => setSearchQuery('')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Popular Tags</h2>
        {tags.length === 0 ? (
          <p className={styles.emptyTags}>No tags available</p>
        ) : (
          <div className={styles.tagsGrid}>
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={activeTag === tag.name ? 'primary' : 'default'}
                size="md"
                className={cn(styles.tagBadge, activeTag === tag.name && styles.tagBadgeActive)}
                onClick={() => handleTagClick(tag.name)}
              >
                #{tag.name}
                {tag.postCount !== undefined && ` (${tag.postCount})`}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.filterBar}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            {activeTag ? `Posts tagged #${activeTag}` : 'Latest Posts'}
          </h2>
          {activeTag && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setActiveTag(null)}
            >
              Clear filter
            </button>
          )}
        </div>

        {isPostsLoading ? (
          <LoadingState message="Loading posts..." />
        ) : error ? (
          <div className={styles.error}>
            <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }}>{error}</p>
            <Button variant="secondary" onClick={() => fetchPosts(activeTag)}>
              Try Again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No posts found"
            description={activeTag ? `No posts tagged with "${activeTag}".` : 'No posts available yet.'}
          />
        ) : (
          <div className={styles.postGrid}>
            {posts.map((post) => (
              <article
                key={post.id}
                className={styles.postCard}
                onClick={() => router.push(ROUTES.POST(post.slug))}
              >
                <h3 className={styles.postCardTitle}>{post.title}</h3>
                {post.excerpt && (
                  <p className={styles.postCardExcerpt}>{post.excerpt}</p>
                )}
                <div className={styles.postCardMeta}>
                  <div className={styles.postCardAuthor}>
                    <span>{post.author.name}</span>
                    <span>&middot;</span>
                    <span>{formatRelativeDate(post.publishedAt ?? post.createdAt)}</span>
                  </div>
                  <span>{formatNumber(post.analytics.views)} views</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
