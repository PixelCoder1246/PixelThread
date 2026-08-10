'use client';

import React from 'react';
import Link from 'next/link';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.brandPanel}>
        <div className={styles.decorCircle1} />
        <div className={styles.decorCircle2} />
        <div className={styles.decorCircle3} />
        <div className={styles.brandContent}>
          <Link href="/" className={styles.logo}>
            PixelThread
          </Link>
          <p className={styles.brandDescription}>
            Create, publish, and grow your audience with powerful writing tools and AI-powered
            insights.
          </p>
        </div>
      </div>
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
