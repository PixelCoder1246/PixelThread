'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Settings,
  Edit3,
  Heart,
  MessageCircle,
  Eye,
  FileText,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { followsService } from '@/services/follows';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AuthLoader from '@/components/common/AuthLoader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { formatRelativeDate, formatNumber, getInitials, getRandomColor, cn, calculateReadingTime } from '@/lib/utils';
import type { Post } from '@/types';
import styles from './page.module.css';

function extractFirstImage(content: unknown): string | null {
  if (typeof content === 'string') {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
    if (match) return match[1];
    const mdMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
    if (mdMatch) return mdMatch[1];
    return null;
  }
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block && typeof block === 'object' && 'url' in block && typeof block.url === 'string' && block.url) {
        return block.url;
      }
      if (block && typeof block === 'object' && 'content' in block) {
        const nested = extractFirstImage(block.content);
        if (nested) return nested;
      }
    }
  }
  return null;
}

type ProfileTab = 'posts' | 'drafts' | 'liked';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const { data: postsData, isLoading: postsLoading, isError } = usePosts({ limit: 20 });

  const { data: followersData } = useQuery({
    queryKey: ['followers', user?.id],
    queryFn: () => followsService.getFollowers(user!.id, { limit: 1 }),
    enabled: !!user,
  });

  const { data: followingData } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: () => followsService.getFollowing(user!.id, { limit: 1 }),
    enabled: !!user,
  });

  if (authLoading) {
    return <AuthLoader fullPage message="Loading profile" />;
  }

  if (!user) {
    return null;
  }

  const initials = getInitials(user.name);
  const avatarBg = getRandomColor(user.name);

  const posts: Post[] = postsData?.posts || [];
  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED');
  const draftPosts = posts.filter((p) => p.status === 'DRAFT');

  const displayPosts = activeTab === 'drafts' ? draftPosts : activeTab === 'liked' ? [] : publishedPosts;

  const stats = {
    posts: publishedPosts.length,
    drafts: draftPosts.length,
    followers: followersData?.pagination
      ? (followersData.pagination as { total?: number }).total ?? 0
      : 0,
    following: followingData?.pagination
      ? (followingData.pagination as { total?: number }).total ?? 0
      : 0,
  };

  return (
    <div className={styles.page}>
      <div className={styles.cover}>
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--gradient-hero)',
          }}
        />
      </div>

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.avatarWrapper}>
            {user.image ? (
              <img src={user.image} alt={user.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder} style={{ background: avatarBg }}>
                {initials}
              </div>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{user.name}</h1>
            {user.email && <p className={styles.email}>{user.email}</p>}
            {user.bio && <p className={styles.bio}>{user.bio}</p>}
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit3 size={14} />}
              onClick={() => router.push('/settings')}
            >
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Settings size={14} />}
              onClick={() => router.push('/settings')}
            >
              Settings
            </Button>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(stats.posts)}</span>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(stats.followers)}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(stats.following)}</span>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={cn(styles.tab, activeTab === 'posts' && styles.tabActive)}
            onClick={() => setActiveTab('posts')}
          >
            My Posts
          </button>
          <button
            type="button"
            className={cn(styles.tab, activeTab === 'drafts' && styles.tabActive)}
            onClick={() => setActiveTab('drafts')}
          >
            Drafts {draftPosts.length > 0 && `(${draftPosts.length})`}
          </button>
          <button
            type="button"
            className={cn(styles.tab, activeTab === 'liked' && styles.tabActive)}
            onClick={() => setActiveTab('liked')}
          >
            Liked Posts
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {postsLoading ? (
          <LoadingState message="Loading posts..." />
        ) : isError ? (
          <ErrorState message="Failed to load posts" />
        ) : displayPosts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={
              activeTab === 'drafts'
                ? 'No drafts yet'
                : activeTab === 'liked'
                  ? 'No liked posts yet'
                  : 'No posts yet'
            }
            description={
              activeTab === 'posts'
                ? 'Start writing your first post!'
                : activeTab === 'drafts'
                  ? 'Your draft posts will appear here'
                  : 'Posts you like will appear here'
            }
            actionLabel={activeTab === 'posts' ? 'Create Post' : undefined}
            onAction={activeTab === 'posts' ? () => router.push('/posts/create') : undefined}
          />
        ) : (
          <div className={styles.postGrid}>
            {displayPosts.map((post) => {
              const coverImg = extractFirstImage(post.content);
              const readingTime = calculateReadingTime(post.content || post.excerpt || '');
              return (
                <Link key={post.id} href={`/posts/${post.slug}`} className={styles.postCard}>
                  {coverImg && (
                    <div className={styles.postCardImage}>
                      <img src={coverImg} alt="" className={styles.postCardImg} />
                    </div>
                  )}
                  <div className={styles.postCardBody}>
                    {post.tags?.length > 0 && (
                      <div className={styles.postCardTags}>
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="primary" size="sm">#{tag.name}</Badge>
                        ))}
                      </div>
                    )}
                    <h3 className={styles.postCardTitle}>{post.title}</h3>
                    {post.excerpt && <p className={styles.postCardExcerpt}>{post.excerpt}</p>}
                    <div className={styles.postCardMeta}>
                      <div className={styles.postCardMetaLeft}>
                        <span>{formatRelativeDate(post.publishedAt || post.createdAt)}</span>
                        <span className={styles.metaDot} />
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          {readingTime} min read
                        </span>
                      </div>
                      <div className={styles.postCardStats}>
                        <span>
                          <Eye size={12} />
                          {formatNumber(post.analytics?.views || 0)}
                        </span>
                        <span>
                          <Heart size={12} />
                          {formatNumber(post.analytics?.likes || 0)}
                        </span>
                        <span>
                          <MessageCircle size={12} />
                          {formatNumber(post.analytics?.comments || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
