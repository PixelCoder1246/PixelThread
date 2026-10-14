'use client';

import { HTMLAttributes, forwardRef } from 'react';
import styles from './Skeleton.module.css';

const s = styles as Record<string, string>;

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, ...props }, ref) => {
    const variantClasses = {
      text: s['skeleton-text'],
      circular: s['skeleton-avatar'],
      rectangular: s['skeleton-card'],
    };

    return (
      <div
        ref={ref}
        className={[s.skeleton, variantClasses[variant], className].filter(Boolean).join(' ')}
        style={{
          width: variant !== 'text' ? width : undefined,
          height: variant !== 'text' ? height : undefined,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export function PostCardSkeleton() {
  return (
    <div className={s.postCard}>
      <div className={s.imageWrapper}>
        <Skeleton variant="rectangular" />
      </div>
      <div className={s.contentBlock}>
        <Skeleton variant="text" style={{ width: '70%' }} />
        <Skeleton variant="text" style={{ width: '50%' }} />
        <div className={s.authorRow}>
          <Skeleton variant="circular" width={32} height={32} />
          <div className={s.authorDetails}>
            <Skeleton variant="text" style={{ width: '80px' }} />
            <Skeleton variant="text" style={{ width: '60px' }} />
          </div>
        </div>
        <Skeleton variant="text" />
      </div>
    </div>
  );
}

export function PostCardSkeletonSm() {
  return (
    <div className={s.postCardSm}>
      <div className={s.imageWrapperSm}>
        <Skeleton variant="rectangular" />
      </div>
      <div className={s.contentBlockSm}>
        <Skeleton variant="text" style={{ width: '60%', height: '1.25rem' }} />
        <Skeleton variant="text" style={{ width: '45%', height: '1rem' }} />
        <div className={s.authorRowSm}>
          <Skeleton variant="circular" width={28} height={28} />
          <div className={s.authorDetails}>
            <Skeleton variant="text" style={{ width: '70px', height: '1rem' }} />
            <Skeleton variant="text" style={{ width: '50px', height: '0.75rem' }} />
          </div>
        </div>
        <Skeleton variant="text" style={{ height: '1rem' }} />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className={s.commentBlock}>
      <Skeleton variant="circular" width={40} height={40} />
      <div className={s.commentContent}>
        <div className={s.commentHeader}>
          <Skeleton variant="text" style={{ width: '100px' }} />
          <Skeleton variant="text" style={{ width: '80px' }} />
        </div>
        <Skeleton variant="text" />
        <Skeleton variant="text" style={{ width: '60%' }} />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className={s.userCard}>
      <Skeleton variant="circular" width={48} height={48} />
      <div className={s.userCardContent}>
        <Skeleton variant="text" style={{ width: '120px' }} />
        <Skeleton variant="text" style={{ width: '80px' }} />
      </div>
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
  );
}

export function PostListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className={s.postList}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}