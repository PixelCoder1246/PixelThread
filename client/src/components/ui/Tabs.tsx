'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Tabs.module.css';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
}: TabsProps) {
  return (
    <div className={cn(styles.wrapper, className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={activeTab === tab.id}
          className={cn(styles.tab, activeTab === tab.id && styles.active)}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
