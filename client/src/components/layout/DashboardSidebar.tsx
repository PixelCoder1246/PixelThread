'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, FileText, TrendingUp, Users } from 'lucide-react';
import styles from './DashboardSidebar.module.css';

const navItems = [
  { href: '/analytics', label: 'Overview', icon: BarChart3 },
  { href: '/analytics/posts', label: 'Posts', icon: FileText },
  { href: '/analytics/top-content', label: 'Top Content', icon: TrendingUp },
  { href: '/analytics/audience', label: 'Audience', icon: Users },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <span className={styles.title}>Dashboard</span>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(styles.navItem, isActive && styles.navItemActive)}
            >
              <span className={styles.icon}>
                <Icon size={16} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
