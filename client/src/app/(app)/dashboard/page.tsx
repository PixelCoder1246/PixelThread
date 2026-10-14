'use client';

import styles from './page.module.css';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>Welcome to your workspace. Manage your content and account below.</p>
      </div>
      <div className={styles.dashboardGrid}>
        <Link href="/posts/new" className={styles.dashboardCard}>
          <h3>Write a Post</h3>
          <p>Create and publish your next article</p>
        </Link>
        <Link href="/posts/my-posts" className={styles.dashboardCard}>
          <h3>My Posts</h3>
          <p>Manage your published and draft posts</p>
        </Link>
        <Link href="/bookmarks" className={styles.dashboardCard}>
          <h3>Bookmarks</h3>
          <p>View your saved posts</p>
        </Link>
        <Link href="/history" className={styles.dashboardCard}>
          <h3>Reading History</h3>
          <p>Posts you've recently read</p>
        </Link>
        <Link href="/notifications" className={styles.dashboardCard}>
          <h3>Notifications</h3>
          <p>Check your latest notifications</p>
        </Link>
        <Link href="/profile/settings" className={styles.dashboardCard}>
          <h3>Settings</h3>
          <p>Manage your account settings</p>
        </Link>
      </div>
    </div>
  );
}