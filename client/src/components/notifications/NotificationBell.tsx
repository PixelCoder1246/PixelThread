'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';
import styles from '@/components/layout/Header.module.css';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadData } = useUnreadCount();

  const count = unreadData?.count ?? 0;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className={`${styles['header-btn']} relative`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        style={{
          background: isOpen ? 'var(--color-bg-hover)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 'var(--radius-md)',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Bell className={styles['header-btn-icon']} />
        {count > 0 && (
          <span className={styles['header-notification-badge']}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        unreadCount={count}
      />
    </div>
  );
};
