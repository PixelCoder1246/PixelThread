'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useFollowing } from '@/features/follow/useFollow';
import { FollowButton } from '@/components/user/FollowButton';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function FollowingPage() {
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  const { data, isLoading } = useFollowing(user?.id ?? '', page, 20);

  const followingUsers = data?.users ?? [];
  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems ?? followingUsers.length;

  return (
    <div className={styles.followingPage}>
      <header className={styles.header}>
        <h1>Following</h1>
        <p className={styles.subtitle}>
          {totalItems > 0
            ? `You are following ${totalItems} ${totalItems === 1 ? 'creator' : 'creators'}`
            : 'Keep up with updates from authors you appreciate'}
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : followingUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>
            You&apos;re not following anyone yet
          </h2>
          <p className={styles.emptyText}>
            Follow developers, writers, and thinkers to get their latest stories
            and updates in your feed.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/search">
              <Button size="lg" className="gap-2">
                <span>Discover Authors</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.followingList}>
            {followingUsers.map((author) => (
              <div key={author.id} className={styles.authorCard}>
                <Link
                  href={`/profile/${author.id}`}
                  className={styles.authorLink}
                >
                  <Avatar
                    src={author.image ?? undefined}
                    alt={author.name ?? 'Author'}
                    fallback={(author.name || 'A').charAt(0).toUpperCase()}
                    size="md"
                  />
                  <div className={styles.authorDetails}>
                    <span className={styles.authorName}>{author.name}</span>
                    {author.bio && (
                      <span className={styles.authorBio}>{author.bio}</span>
                    )}
                  </div>
                </Link>

                <FollowButton
                  userId={author.id}
                  userName={author.name ?? 'author'}
                  size="sm"
                />
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
