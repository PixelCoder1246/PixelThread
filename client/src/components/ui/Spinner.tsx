'use client';

import { HTMLAttributes, forwardRef } from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: styles['spinner-sm'],
  md: styles.spinner,
  lg: styles['spinner-lg'],
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[sizeClasses[size], className].filter(Boolean).join(' ')}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={[styles['loading-dots'], className].filter(Boolean).join(' ')} aria-label="Loading">
      <div style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: '50%', backgroundColor: 'currentColor', animation: 'bounce 1s infinite', animationDelay: '-0.3s' }} />
      <div style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: '50%', backgroundColor: 'currentColor', animation: 'bounce 1s infinite', animationDelay: '-0.15s' }} />
      <div style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: '50%', backgroundColor: 'currentColor', animation: 'bounce 1s infinite' }} />
    </div>
  );
}