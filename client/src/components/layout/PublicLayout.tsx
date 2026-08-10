'use client';

import React from 'react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import styles from './PublicLayout.module.css';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className={styles.layout}>
      <PublicHeader />
      <main className={styles.main}>{children}</main>
      <PublicFooter />
    </div>
  );
}
