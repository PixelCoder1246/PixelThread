'use client';

import { cn } from '@/lib/utils';
import styles from './AuthLoader.module.css';

interface AuthLoaderProps {
  message?: string;
  compact?: boolean;
  fullPage?: boolean;
  className?: string;
}

export default function AuthLoader({
  message = 'Loading',
  compact = false,
  fullPage = true,
  className,
}: AuthLoaderProps) {
  return (
    <div
      className={cn(
        styles.wrapper,
        fullPage && !compact ? styles.fullPage : styles.compact,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className={styles.spool} aria-hidden="true">
        <div className={styles.spoolRing} />
        <div className={styles.spoolCore}>
          <svg
            viewBox="0 0 24 24"
            className={styles.spoolIcon}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M7 4c4 0 4 16 10 16" />
            <path d="M12 3.5v17" />
            <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        <span className={styles.wordmarkPixel}>Pixel</span>
        <span className={styles.wordmarkThread}>Thread</span>
      </div>

      <div className={styles.stitch} aria-hidden="true">
        <span className={styles.stitchTrack} />
      </div>

      {message && (
        <p className={styles.message}>
          {message}
          <span className={styles.dots}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      )}
    </div>
  );
}
