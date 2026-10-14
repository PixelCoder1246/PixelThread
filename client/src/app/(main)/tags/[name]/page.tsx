'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { MainLayout } from '@/components/layout/MainLayout';

export default function TagPage() {
  const params = useParams();
  const name = params.name;

  return (
    <MainLayout>
      <div className={styles.tagPage}>
        <h1>Tag: {name}</h1>
        <p>Posts tagged with {name} will be displayed here.</p>
        <PostCardSkeleton />
      </div>
    </MainLayout>
  );
}