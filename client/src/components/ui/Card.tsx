'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.css';

type CardVariant = 'default' | 'elevated' | 'bordered' | 'gradient';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        styles[variant],
        styles[`padding-${padding}`],
        hoverable && styles.hoverable,
        className
      )}
    >
      {children}
    </div>
  );
}
