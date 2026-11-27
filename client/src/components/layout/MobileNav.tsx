'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Rss, Compass, Bell, User, Plus } from 'lucide-react';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  notificationCount?: number;
}

const navItems = [
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/posts/new', label: 'Create', icon: Plus, isCreate: true },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: Bell,
    hasBadge: true,
  },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav({ notificationCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={styles.nav}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/');

        if (item.isCreate) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.createBtn}
              aria-label={item.label}
            >
              <span className={styles.createBtnIcon}>
                <Icon size={22} />
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(styles.navItem, isActive && styles.navItemActive)}
          >
            <span className={styles.navIcon}>
              <Icon size={20} />
              {item.hasBadge && notificationCount > 0 && (
                <span className={styles.badge}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
