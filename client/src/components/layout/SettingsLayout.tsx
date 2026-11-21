'use client';

import React from 'react';
import styles from './SettingsLayout.module.css';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function SettingsLayout({
  children,
  title,
  description,
}: SettingsLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.body}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>{title}</h1>
          {description && (
            <p className={styles.headerDescription}>{description}</p>
          )}
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
