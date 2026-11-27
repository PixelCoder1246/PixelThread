'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme, mounted } = useThemeMode();

  if (!mounted) {
    return <div className={cn(styles.button, styles.placeholder, className)} />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(styles.button, className)}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className={cn(styles.icon, isDark ? styles.visible : styles.hidden)}
      >
        <Sun size={18} />
      </span>
      <span
        className={cn(styles.icon, !isDark ? styles.visible : styles.hidden)}
      >
        <Moon size={18} />
      </span>
    </button>
  );
}
