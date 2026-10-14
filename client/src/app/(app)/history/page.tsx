'use client';

import styles from './page.module.css';
import { PostCardSkeleton } from '@/components/ui/Skeleton';

export default function HistoryPage() {
  return (
    <div className={styles.historyPage}>
      <h1>Reading History</h1>
      <div className={styles.historyList}>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}
