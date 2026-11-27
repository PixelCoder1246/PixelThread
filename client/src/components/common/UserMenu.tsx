'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, getRandomColor } from '@/lib/utils';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  if (!user) return null;

  const initials = getInitials(user.name);
  const avatarColor = getRandomColor(user.name);
  const avatarUrl = user.image;

  return (
    <div ref={menuRef} className={cn(styles.wrapper, className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={user.name} className={styles.avatar} />
        ) : (
          <span
            className={styles.avatarFallback}
            style={{ background: avatarColor }}
          >
            {initials}
          </span>
        )}
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userEmail}>{user.email}</span>
        </div>
        <ChevronDown
          size={14}
          className={cn(styles.chevron, open && styles.chevronOpen)}
        />
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <Link
            href="/profile"
            className={styles.menuItem}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <User size={16} />
            Profile
          </Link>
          <Link
            href="/settings"
            className={styles.menuItem}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Settings size={16} />
            Settings
          </Link>
          <div className={styles.divider} />
          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
