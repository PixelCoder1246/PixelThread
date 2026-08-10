'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppHeader from './AppHeader';
import { User, Settings, Palette, Bell } from 'lucide-react';
import styles from './SettingsLayout.module.css';

const tabs = [
  { href: '/settings', label: 'Profile', icon: User },
  { href: '/settings/account', label: 'Account', icon: Settings },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function SettingsLayout({ children, title, description }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <span className={styles.sidebarTitle}>Settings</span>
        <nav className={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === '/settings'
                ? pathname === '/settings'
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(styles.tab, isActive && styles.tabActive)}
              >
                <span className={styles.tabIcon}>
                  <Icon size={16} />
                </span>
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <AppHeader />
      <div className={styles.body}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>{title}</h1>
          {description && <p className={styles.headerDescription}>{description}</p>}
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
