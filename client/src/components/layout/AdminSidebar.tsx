'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  Settings,
  ScrollText,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const navItems = [
  {
    section: 'Main',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/posts', label: 'Posts', icon: FileText },
    ],
  },
  {
    section: 'Moderation',
    items: [
      { href: '/admin/reports', label: 'Reports', icon: Flag },
      { href: '/admin/logs', label: 'Logs', icon: ScrollText },
    ],
  },
  {
    section: 'System',
    items: [{ href: '/admin/settings', label: 'Settings', icon: Settings }],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>PT</div>
        <span className={styles.logoText}>PixelThread</span>
        <span className={styles.logoBadge}>Admin</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((section) => (
          <div key={section.section} className={styles.navSection}>
            <span className={styles.sectionLabel}>{section.section}</span>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    styles.navItem,
                    isActive && styles.navItemActive
                  )}
                >
                  <span className={styles.navIcon}>
                    <Icon size={16} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
