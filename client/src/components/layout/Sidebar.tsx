'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PenTool,
  Bookmark,
  History,
  Bell,
  Search,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  Users,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/features/auth/useAuth';
import styles from './Sidebar.module.css';

const s = styles as Record<string, string>;

interface NavigationItem {
  name: string;
  href: string;
  icon: typeof Home;
  highlight?: boolean;
}

const navigation: NavigationItem[] = [
  {
    name: 'Home',
    href: ROUTES.POSTS,
    icon: Home,
  },
  {
    name: 'Explore Topics',
    href: ROUTES.TAGS,
    icon: Hash,
  },
  {
    name: 'Search',
    href: ROUTES.SEARCH,
    icon: Search,
  },
  {
    name: 'Write',
    href: ROUTES.POST_NEW,
    icon: PenTool,
    highlight: true,
  },
  {
    name: 'AI Tools',
    href: ROUTES.AI_TOOLS,
    icon: Sparkles,
  },
  {
    name: 'My Stories',
    href: ROUTES.POST_MY,
    icon: FileText,
  },
  {
    name: 'Library',
    href: ROUTES.BOOKMARKS,
    icon: Bookmark,
  },
  {
    name: 'Following',
    href: ROUTES.FOLLOWING,
    icon: Users,
  },
  {
    name: 'History',
    href: ROUTES.HISTORY,
    icon: History,
  },
  {
    name: 'Notifications',
    href: ROUTES.NOTIFICATIONS,
    icon: Bell,
  },
  {
    name: 'Analytics',
    href: ROUTES.ANALYTICS,
    icon: BarChart,
  },
  {
    name: 'Settings',
    href: ROUTES.PROFILE_SETTINGS,
    icon: Settings,
  },
];

export function Sidebar({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Render all navigation items so visitors can explore every feature
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const navItems = isAdmin
    ? [
        ...navigation,
        {
          name: 'Admin Hub',
          href: ROUTES.ADMIN,
          icon: ShieldAlert,
        },
      ]
    : navigation;

  return (
    <>
      <aside
        className={`${s.sidebar} ${isMobileOpen ? s.open : ''} ${isCollapsed ? s.collapsed : ''}`}
        aria-label="Left navigation"
      >
        <div className={s['sidebar-header']}>
          <Link href="/posts" className={s['sidebar-logo']}>
            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
              PixelThread
            </span>
          </Link>
          <button
            className={s['sidebar-close']}
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className={s['sidebar-nav']} aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.POSTS &&
                pathname.startsWith(item.href + '/'));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${s['sidebar-nav-link']} ${isActive ? s.active : ''} ${item.highlight ? s.highlight : ''}`}
                aria-current={isActive ? 'page' : undefined}
                title={item.name}
              >
                <Icon className={s['sidebar-nav-icon']} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Minimal Footer with user avatar and collapse toggle */}
        <div className={s['sidebar-footer']}>
          {isAuthenticated && user && (
            <Link
              href={ROUTES.PROFILE_SETTINGS}
              className={s['sidebar-user-avatar-btn']}
              title={`Settings (${user.name || user.username})`}
              aria-label="User settings"
            >
              <Avatar
                src={user.image || undefined}
                fallback={(user.name || user.username || 'U')
                  .charAt(0)
                  .toUpperCase()}
                size="sm"
              />
            </Link>
          )}

          <button
            type="button"
            className={s['sidebar-collapse-btn']}
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className={`${s['sidebar-overlay']} ${s.open}`}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
