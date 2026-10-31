'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, Inbox } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.container} role="status">
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <div className={styles.actionWrapper}>
          {action.href ? (
            <Link href={action.href} className={styles.actionBtn}>
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className={styles.actionBtn}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
