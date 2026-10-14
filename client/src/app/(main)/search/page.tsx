'use client';

import styles from './page.module.css';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui';
import { PostCardSkeleton } from '@/components/ui/Skeleton';
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className={styles.searchPage}>
      <h1>Search</h1>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} />
        <Input
          type="search"
          placeholder="Search posts, users, tags..."
          className={styles.searchInput}
        />
      </div>
      <div className={styles.searchResults}>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}