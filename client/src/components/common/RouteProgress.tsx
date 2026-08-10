'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import styles from './RouteProgress.module.css';

const FORCE_COMPLETE_MS = 8000;

export default function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigatingRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (forceTimerRef.current) clearTimeout(forceTimerRef.current);
    hideTimerRef.current = null;
    forceTimerRef.current = null;
  }, []);

  const finish = useCallback(() => {
    if (!navigatingRef.current) return;
    navigatingRef.current = false;
    clearTimers();
    setProgress(100);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
  }, [clearTimers]);

  const start = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    clearTimers();
    setProgress(15);
    setVisible(true);
    // ease forward in steps to look like real progress
    hideTimerRef.current = setTimeout(() => setProgress(40), 120);
    forceTimerRef.current = setTimeout(() => finish(), FORCE_COMPLETE_MS);
  }, [clearTimers, finish]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (anchor.target === '_blank') return;

      start();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [start]);

  useEffect(() => {
    finish();
  }, [pathname, finish]);

  return (
    <div className={cn(styles.bar, visible && styles.visible)} style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />
  );
}
