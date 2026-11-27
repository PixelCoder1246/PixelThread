'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';
import {
  Search,
  FileText,
  BarChart3,
  Settings,
  Bookmark,
  Bell,
  Users,
  LayoutDashboard,
  Command,
  ArrowRight,
} from 'lucide-react';
import styles from './CommandPalette.module.css';

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
  onSelect: () => void;
}

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const actions: Action[] = [
    {
      id: 'feed',
      label: 'Go to Feed',
      icon: <FileText size={16} />,
      group: 'Navigation',
      onSelect: () => router.push('/feed'),
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: <Search size={16} />,
      group: 'Navigation',
      onSelect: () => router.push('/explore'),
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: <Bookmark size={16} />,
      group: 'Navigation',
      onSelect: () => router.push('/bookmarks'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={16} />,
      group: 'Navigation',
      onSelect: () => router.push('/notifications'),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 size={16} />,
      group: 'Navigation',
      onSelect: () => router.push('/analytics'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
      group: 'Navigation',
      onSelect: () => router.push('/settings'),
    },
    {
      id: 'admin',
      label: 'Admin Dashboard',
      icon: <LayoutDashboard size={16} />,
      group: 'Navigation',
      onSelect: () => router.push('/admin'),
    },
  ];

  const filteredActions = query
    ? actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  const groups = filteredActions.reduce<Record<string, Action[]>>(
    (acc, action) => {
      if (!acc[action.group]) acc[action.group] = [];
      acc[action.group].push(action);
      return acc;
    },
    {}
  );

  const flatActions = filteredActions;
  const hasResults = flatActions.length > 0;

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
  }, [setCommandPaletteOpen]);

  const handleSelect = useCallback(
    (index: number) => {
      if (flatActions[index]) {
        flatActions[index].onSelect();
        close();
      }
    },
    [flatActions, close]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatActions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + flatActions.length) % flatActions.length
        );
        break;
      case 'Enter':
        e.preventDefault();
        handleSelect(selectedIndex);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  };

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className={styles.palette}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            className={styles.searchInput}
          />
          <kbd className={styles.escHint}>ESC</kbd>
        </div>
        <div className={styles.results} ref={listRef}>
          {hasResults ? (
            Object.entries(groups).map(([groupName, groupActions]) => (
              <div key={groupName} className={styles.group}>
                <p className={styles.groupLabel}>{groupName}</p>
                {groupActions.map((action) => {
                  const actionIndex = flatActions.indexOf(action);
                  return (
                    <button
                      key={action.id}
                      type="button"
                      data-index={actionIndex}
                      className={cn(
                        styles.action,
                        selectedIndex === actionIndex && styles.actionSelected
                      )}
                      onClick={() => handleSelect(actionIndex)}
                      onMouseEnter={() => setSelectedIndex(actionIndex)}
                    >
                      <span className={styles.actionIcon}>{action.icon}</span>
                      <span className={styles.actionLabel}>{action.label}</span>
                      <ArrowRight size={14} className={styles.actionArrow} />
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <Command size={24} />
              <p>No commands found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
