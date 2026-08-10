'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  fullPage?: boolean;
  message?: string;
  className?: string;
}

export default function LoadingState({
  fullPage = false,
  message,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn(styles.wrapper, fullPage && styles.fullPage, className)}>
      <Loader2 size={32} className={styles.spinner} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
