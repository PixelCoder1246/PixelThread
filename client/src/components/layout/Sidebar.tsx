'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenTool, Bookmark, History, Bell, Users, BarChart, Settings, ChevronLeft, ChevronRight, Plus, LayoutDashboard } from 'lucide-react';
import styles from './Sidebar.module.css';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/features/auth/useAuth';

const s = styles as Record<string, string>;

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, requiresAuth: true },
  { name: 'New Post', href: ROUTES.POST_NEW, icon: Plus, requiresAuth: true, requiresVerified: true },
  { name: 'My Posts', href: ROUTES.POST_MY, icon: PenTool, requiresAuth: true },
  { name: 'Bookmarks', href: ROUTES.BOOKMARKS, icon: Bookmark, requiresAuth: true },
  { name: 'History', href: ROUTES.HISTORY, icon: History, requiresAuth: true },
  { name: 'Notifications', href: ROUTES.NOTIFICATIONS, icon: Bell, requiresAuth: true },
  { name: 'Following', href: ROUTES.FOLLOWING, icon: Users, requiresAuth: true },
  { name: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart, requiresAuth: true },
];

export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredNav = navigation.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.requiresVerified && user && !user.isEmailVerified) return false;
    return true;
  });

  return (
    <>
      <aside
        className={`${s.sidebar} ${isMobileOpen ? s.open : ''} ${isCollapsed ? s.collapsed : ''}`}
        aria-label="Sidebar navigation"
      >
        <div className={`${s['sidebar-header']} ${isCollapsed ? '' : ''}`}>
          <Link href="/" className={s['sidebar-logo']}>
            <span style={{ fontSize: '1.5rem' }}>PT</span>
            <span>PixelThread</span>
          </Link>
          <button
            className={s['sidebar-close']}
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className={s['sidebar-overlay']} onClick={() => setIsMobileOpen(false)} />
        <nav className={s['sidebar-nav']} aria-label="Main navigation">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${s['sidebar-nav-link']} ${isActive ? s.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={s['sidebar-nav-icon']} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className={s['sidebar-nav-section-title']}>Account</div>
          <Link
            href={ROUTES.SETTINGS}
            className={s['sidebar-nav-link']}
          >
            <Settings className={s['sidebar-nav-icon']} aria-hidden="true" />
            <span>Settings</span>
          </Link>
        </nav>
        {isAuthenticated && user && (
          <div className={s['sidebar-footer']}>
            <div className={s['sidebar-user']}>
              <div className={s['sidebar-user-avatar']}>
                {user.image ? (
                  <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className={s['sidebar-user-info']}>
                <div className={s['sidebar-user-name']}>{user.name || user.username}</div>
                <div className={s['sidebar-user-username']}>@{user.username}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <button
        className={`${s['sidebar-toggle']} ${isMobileOpen ? s['sidebar-toggle-open'] : ''}`}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isMobileOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {isMobileOpen && (
        <div
          className={`${s['sidebar-overlay']} open`}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}