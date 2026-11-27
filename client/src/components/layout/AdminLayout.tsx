'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
import UserMenu from '@/components/common/UserMenu';
import styles from './AdminLayout.module.css';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: Breadcrumb[];
}

export default function AdminLayout({
  children,
  title,
  breadcrumbs,
}: AdminLayoutProps) {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1 className={styles.pageTitle}>{title}</h1>
        </div>
        <div className={styles.topBarRight}>
          <UserMenu />
        </div>
      </div>
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
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
