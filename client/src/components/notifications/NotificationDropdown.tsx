'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/features/notifications/useNotifications';
import { NotificationItem } from './NotificationItem';
import styles from './NotificationDropdown.module.css';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  unreadCount = 0,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications(1, 6);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notifications = data?.notifications || [];

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.title}>Notifications</span>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className={styles.markAllBtn}
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loading}>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <Bell className={styles.emptyIcon} />
            <span className={styles.emptyText}>No notifications yet</span>
          </div>
        ) : (
          notifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onMarkRead={(id) => markRead.mutate(id)}
              onDelete={(id) => deleteNotif.mutate(id)}
              onClick={onClose}
            />
          ))
        )}
      </div>

      <div className={styles.footer}>
        <Link
          href="/notifications"
          className={styles.viewAllLink}
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};
