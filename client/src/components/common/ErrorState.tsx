'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
  className?: string;
}

export default function ErrorState({
  message = 'Something went wrong',
  onRetry,
  fullPage = false,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(styles.wrapper, fullPage && styles.fullPage, className)}>
      <div className={styles.iconWrapper}>
        <AlertCircle size={40} className={styles.icon} />
      </div>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={styles.retryButton}>
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
