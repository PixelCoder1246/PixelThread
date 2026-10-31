'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Megaphone,
  History,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { AdminRoute } from '@/components/layout/AdminRoute';
import styles from './layout.module.css';

interface AdminTab {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

const adminTabs: AdminTab[] = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Posts', href: '/admin/posts', icon: FileText },
  { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
  { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminRoute>
      <div className={styles.adminContainer}>
        {/* Top Header Banner */}
        <header className={styles.adminHeaderBanner}>
          <div className={styles.bannerTitleGroup}>
            <div className={styles.shieldIconBadge}>
              <ShieldAlert size={28} />
            </div>
            <div className={styles.bannerText}>
              <h1 className={styles.bannerTitle}>
                <span>Admin Operations Hub</span>
                <span className={styles.statusTag}>Live Shield</span>
              </h1>
              <p className={styles.bannerSubtitle}>
                Platform moderation, member access controls, media management &
                audit logs
              </p>
            </div>
          </div>

          <div className={styles.bannerActions}>
            <Link href="/posts" className={styles.returnBtn}>
              <ArrowLeft size={16} />
              <span>Exit to App</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Navigation Tabs */}
        <nav
          className={styles.navTabsScrollWrapper}
          aria-label="Admin Navigation"
        >
          <div className={styles.navTabs}>
            {adminTabs.map((tab) => {
              const isActive = tab.exact
                ? pathname === tab.href
                : pathname === tab.href || pathname.startsWith(tab.href + '/');
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`${styles.navTabItem} ${isActive ? styles.navTabActive : ''}`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Dynamic Admin Sub-pages */}
        <main className={styles.adminContent}>{children}</main>
      </div>
    </AdminRoute>
  );
}
