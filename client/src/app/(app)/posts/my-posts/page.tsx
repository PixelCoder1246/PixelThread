'use client';

import styles from './page.module.css';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function MyPostsPage() {
  return (
    <div className={styles.myPostsPage}>
      <div className={styles.myPostsHeader}>
        <h1>My Posts</h1>
        <Link href="/posts/new">
          <Button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus style={{ width: '1rem', height: '1rem' }} />
            New Post
          </Button>
        </Link>
      </div>
      <div className={styles.myPostsList}>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}