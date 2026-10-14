'use client';

import styles from './page.module.css';
import { Card } from '@/components/ui';

export default function AnalyticsPage() {
  return (
    <div className={styles.analyticsPage}>
      <h1>Analytics</h1>
      <div className={styles.analyticsGrid}>
        <Card>
          <div className={styles.statCard}>
            <p>Total Views</p>
            <p className={styles.value}>12,345</p>
          </div>
        </Card>
        <Card>
          <div className={styles.statCard}>
            <p>Total Likes</p>
            <p className={styles.value}>1,234</p>
          </div>
        </Card>
        <Card>
          <div className={styles.statCard}>
            <p>Total Comments</p>
            <p className={styles.value}>567</p>
          </div>
        </Card>
        <Card>
          <div className={styles.statCard}>
            <p>Posts Published</p>
            <p className={styles.value}>23</p>
          </div>
        </Card>
      </div>
      <Card>
        <div className={styles.chartCard}>
          <h2>Views Over Time</h2>
          <p>Chart will be implemented in Phase 4.</p>
          <div className={styles.chartPlaceholder}>
            <span>Chart placeholder</span>
          </div>
        </div>
      </Card>
    </div>
  );
}