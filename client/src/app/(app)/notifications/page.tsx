'use client';

import styles from './page.module.css';
import { Card } from '@/components/ui';

export default function NotificationsPage() {
  return (
    <div className={styles.notificationsPage}>
      <h1>Notifications</h1>
      <div className={styles.notificationsList}>
        <Card>
          <div className={styles.notificationCard}>
            <p>No notifications yet.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}