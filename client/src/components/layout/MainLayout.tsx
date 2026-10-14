'use client';

import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import styles from './MainLayout.module.css';

const s = styles as Record<string, string>;

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={s['main-layout']}>
      <header className={s['main-layout-header']}>
        <Header />
      </header>
      <div className={s['main-layout-body']}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={s['main-layout-main']}>
          <div className={s['main-layout-content']}>{children}</div>
        </main>
      </div>
      <footer className={s['main-layout-footer']}>
        <Footer />
      </footer>
    </div>
  );
}