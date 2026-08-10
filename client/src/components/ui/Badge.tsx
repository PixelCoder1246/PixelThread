'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'accent';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

export default function Badge({ variant = 'default', size = 'md', children, className, ...props }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], styles[size], className)} {...props}>
      {children}
    </span>
  );
}
