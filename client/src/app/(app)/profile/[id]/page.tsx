'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Eye, UserPlus, UserCheck, FileText } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { usersService } from '@/services/users';
import { formatRelativeDate, formatNumber, getInitials, getRandomColor, cn } from '@/lib/utils';
import type { User, Post } from '@/types';
import styles from './page.module.css';

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    params.then((p) => setUserId(p.id));
  }, [params]);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    setIsError(false);

    usersService.getUserPosts(userId, { limit: 20, sort: 'newest' })
      .then((postsData) => {
        const postsList = postsData.posts || [];
        setPosts(postsList);
        if (postsList.length > 0) {
          setUser(postsList[0].author as User);
        } else {
          setIsError(true);
        }
      })
      .catch(() => {
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  const handleFollow = useCallback(() => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed' : 'Following');
  }, [isFollowing]);

  if (isLoading || !userId) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  if (isError || !user) {
    return <ErrorState fullPage message="Failed to load profile" />;
  }

  const initials = getInitials(user.name);
  const avatarBg = getRandomColor(user.name);

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
          {user.image ? (
            <img src={user.image} alt={user.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder} style={{ background: avatarBg }}>
              {initials}
            </div>
          )}
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{user.name}</h1>
            {user.bio && <p className={styles.bio}>{user.bio}</p>}
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={cn(styles.followButton, isFollowing ? styles.following : styles.follow)}
              onClick={handleFollow}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={16} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Follow
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(posts.length)}</span>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Published Posts</h2>

        {posts.filter((p) => p.status === 'PUBLISHED').length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No published posts yet"
            description="When this user publishes posts, they'll appear here."
          />
        ) : (
          <div className={styles.postGrid}>
            {posts
              .filter((p) => p.status === 'PUBLISHED')
              .map((post) => (
                <Link key={post.id} href={`/posts/${post.slug}`} className={styles.postCard}>
                  <h3 className={styles.postCardTitle}>{post.title}</h3>
                  {post.excerpt && <p className={styles.postCardExcerpt}>{post.excerpt}</p>}
                  <div className={styles.postCardMeta}>
                    <span>{formatRelativeDate(post.publishedAt || post.createdAt)}</span>
                    <div className={styles.postCardStats}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} />
                        {formatNumber(post.analytics?.views || 0)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Heart size={12} />
                        {formatNumber(post.analytics?.likes || 0)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageCircle size={12} />
                        {formatNumber(post.analytics?.comments || 0)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
