'use client';

import React from 'react';
import { cn, getInitials, getRandomColor } from '@/lib/utils';
import { useUIStore } from '@/store';
import { useAuthStore } from '@/store';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Rss,
  Compass,
  TrendingUp,
  Bookmark,
  History,
  BarChart3,
  Settings,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/history', label: 'History', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const { sidebarOpen, mobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { user } = useAuthStore();
  const pathname = usePathname();

  const isCollapsed = !sidebarOpen;
  const initials = user ? getInitials(user.name) : '';
  const avatarColor = user ? getRandomColor(user.name) : '';

  return (
    <>
      <aside
        className={cn(
          styles.sidebar,
          isCollapsed && styles.collapsed,
          mobileMenuOpen && styles.open
        )}
      >
        <div className={styles.logoSection}>
          <Link
            href="/"
            className={cn(styles.logo, isCollapsed && styles.logoCollapsed)}
          >
            {isCollapsed ? 'PT' : 'PixelThread'}
          </Link>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Navigation</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    styles.navItem,
                    isActive && styles.navItemActive
                  )}
                  onClick={() => mobileMenuOpen && toggleMobileMenu()}
                >
                  <span className={styles.navIcon}>
                    <Icon size={18} />
                  </span>
                  <span className={styles.navText}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={styles.bottomSection}>
          <Link
            href="/settings"
            className={cn(styles.navItem)}
            onClick={() => mobileMenuOpen && toggleMobileMenu()}
          >
            <span className={styles.navIcon}>
              <Settings size={18} />
            </span>
            <span className={styles.navText}>Settings</span>
          </Link>

          {user && (
            <Link
              href="/profile"
              className={styles.userInfo}
              onClick={() => mobileMenuOpen && toggleMobileMenu()}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className={styles.userAvatar}
                />
              ) : (
                <span
                  className={styles.userAvatarFallback}
                  style={{ background: avatarColor }}
                >
                  {initials}
                </span>
              )}
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userRole}>
                  {user.role === 'ADMIN' ? 'Admin' : 'Member'}
                </span>
              </div>
            </Link>
          )}
        </div>
      </aside>

      <div
        className={cn(styles.overlay, mobileMenuOpen && styles.visible)}
        onClick={toggleMobileMenu}
        role="presentation"
      />
    </>
  );
}
