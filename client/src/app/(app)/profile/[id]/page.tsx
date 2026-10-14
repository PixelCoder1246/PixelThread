'use client';

import styles from './page.module.css';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Avatar, Badge, Button, Card } from '@/components/ui';
import { PostCardSkeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const params = useParams();
  const id = params.id;

  return (
    <div className={styles.profilePage}>
      <Card className={styles.profileCard}>
        <div className={styles.profileCardContent}>
          <div className={styles.profileHeader}>
            <Avatar fallback="JD" size="xl" />
            <div>
              <h1 className={styles.profileName}>John Doe</h1>
              <p className={styles.profileUsername}>@johndoe</p>
            </div>
          </div>
          <p className={styles.profileBio}>
            Software developer and technical writer. Passionate about AI, web
            development, and open source.
          </p>
          <div className={styles.profileStats}>
            <span>123 Posts</span>
            <span>4.5k Followers</span>
            <span>123 Following</span>
          </div>
        </div>
      </Card>
      <div className={styles.postsList}>
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}
