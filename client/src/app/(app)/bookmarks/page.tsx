'use client';

import styles from './page.module.css';
import { PostCardSkeleton } from '@/components/ui/Skeleton';

export default function BookmarksPage() {
  return (
    <div className={styles.bookmarksPage}>
      <h1>Bookmarks</h1>
      <div className={styles.bookmarksList}>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}