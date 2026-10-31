'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import styles from './OfflineBanner.module.css';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${styles.banner} ${isOnline ? styles.online : styles.offline}`}
    >
      <div className={styles.content}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-emerald-400" />
            <span>Connection restored. You are back online!</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-amber-400" />
            <span>
              You are currently offline. Some features may be unavailable.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
