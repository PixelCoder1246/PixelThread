'use client';

import { HTMLAttributes, forwardRef } from 'react';
import styles from './Badge.module.css';

const s = styles as Record<string, string>;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'outline', ...props }, ref) => {
    const variantClasses = {
      default: s['badge-primary'],
      success: s['badge-success'],
      warning: s['badge-warning'],
      danger: s['badge-error'],
      info: s['badge-primary'],
      outline: s.badge,
    };

    return (
      <span
        ref={ref}
        className={[variantClasses[variant], className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';