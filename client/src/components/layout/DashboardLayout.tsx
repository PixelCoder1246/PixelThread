'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from './DashboardSidebar';
import AppHeader from './AppHeader';
import styles from './DashboardLayout.module.css';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  breadcrumbs,
  actions,
}: DashboardLayoutProps) {
  return (
    <div className={styles.layout}>
      <DashboardSidebar />
      <AppHeader />
      <div className={styles.body}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.label}>
                {index > 0 && (
                  <ChevronRight
                    size={14}
                    className={styles.breadcrumbSeparator}
                  />
                )}
                {crumb.href ? (
                  <Link href={crumb.href} className={styles.breadcrumbLink}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={styles.breadcrumbCurrent}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className={styles.content}>
          <div className={styles.headerBar}>
            <h1 className={styles.pageTitle}>{title}</h1>
            {actions && <div className={styles.headerActions}>{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
