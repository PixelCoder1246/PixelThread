'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Skeleton.module.css';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: SkeletonVariant;
  className?: string;
}

export default function Skeleton({
  width,
  height,
  variant = 'text',
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(styles.skeleton, styles[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
