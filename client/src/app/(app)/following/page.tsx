'use client';

import styles from './page.module.css';
import { Card } from '@/components/ui';

export default function FollowingPage() {
  return (
    <div className={styles.followingPage}>
      <h1>Following</h1>
      <div className={styles.followingList}>
        <Card>
          <div className={styles.followingCard}>
            <p>You&apos;re not following anyone yet.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
