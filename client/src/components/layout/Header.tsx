'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { Button, Input, Avatar, Dropdown, DropdownItem } from '@/components/ui';
import { SearchBar } from '@/components/search/SearchBar';
import styles from './Header.module.css';
import { ROUTES } from '@/lib/constants';

const s = styles as Record<string, string>;

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const userMenuItems: DropdownItem[] = [
    { label: 'Profile', onClick: () => {}, icon: <User className="h-4 w-4" /> },
    {
      label: 'Settings',
      onClick: () => {},
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: 'Sign out',
      onClick: () => logout(),
      icon: <LogOut className="h-4 w-4" />,
      variant: 'danger',
    },
  ];

  return (
    <header className={s.header}>
      <div className={s['header-inner']}>
        {/* Left: Logo */}
        <div className={s['header-left']}>
          <Button
            variant="ghost"
            size="sm"
            className={s['header-btn']}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <Link href="/" className={s['header-logo']}>
            <Image
              src="/PTfavicon.png"
              alt="PixelThread"
              width={32}
              height={32}
              className={s['header-logo-image']}
            />
            <span className={s['header-logo-text']}>PixelThread</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className={s['header-center']}>
          <SearchBar placeholder="Search posts, topics, authors..." />
        </div>

        {/* Right: Actions */}
        <div className={s['header-right']}>
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={`${s['header-btn']} relative`}
              >
                <Bell className={s['header-btn-icon']} />
                <span className={s['header-notification-badge']}>3</span>
              </Button>
              <Dropdown
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className={s['header-user-trigger']}
                  >
                    <Avatar
                      src={user?.image || undefined}
                      fallback={user?.name || user?.username || 'U'}
                      size="sm"
                    />
                    <span className={s['header-user-name']}>
                      {user?.username || user?.name}
                    </span>
                    <ChevronDown className={s['header-user-chevron']} />
                  </Button>
                }
                items={userMenuItems}
                align="right"
              />
            </>
          ) : (
            <div className={s['header-auth-buttons']}>
              <Link href="/posts">
                <Button variant="ghost" size="sm">
                  Explore
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`${s['header-mobile-menu']} open`}>
          <div className={s['header-mobile-menu-content']}>
            <div className={s['header-mobile-search']}>
              <Search className={s['header-mobile-search-icon']} />
              <Input
                type="search"
                placeholder="Search..."
                className={s['header-mobile-search-input']}
              />
            </div>
            {isAuthenticated ? (
              <nav className={s['header-mobile-nav']}>
                <Link
                  href={ROUTES.POST_NEW}
                  className={s['header-mobile-nav-link']}
                >
                  New Post
                </Link>
                <Link
                  href={ROUTES.SETTINGS}
                  className={s['header-mobile-nav-link']}
                >
                  Settings
                </Link>
                <button
                  onClick={() => logout()}
                  className={s['header-mobile-nav-link']}
                >
                  Sign out
                </button>
              </nav>
            ) : (
              <nav className={s['header-mobile-nav']}>
                <Link href="/posts" className={s['header-mobile-nav-link']}>
                  Explore Posts
                </Link>
                <Link href="/login" className={s['header-mobile-nav-link']}>
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={`${s['header-mobile-nav-link']} ${s['header-mobile-nav-link-primary']}`}
                >
                  Get Started
                </Link>
              </nav>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
