'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
} from '@/features/notifications/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import styles from './page.module.css';

type TabType =
  | 'all'
  | 'unread'
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'MENTION'
  | 'SYSTEM';

const TABS: { id: TabType; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'LIKE', label: 'Likes', icon: <Heart size={14} /> },
  { id: 'COMMENT', label: 'Comments', icon: <MessageCircle size={14} /> },
  { id: 'FOLLOW', label: 'Follows', icon: <UserPlus size={14} /> },
  { id: 'MENTION', label: 'Mentions', icon: <AtSign size={14} /> },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [page, setPage] = useState(1);

  const filters = React.useMemo(() => {
    if (activeTab === 'unread') {
      return { isRead: false };
    }
    if (activeTab === 'all') {
      return undefined;
    }
    return { type: activeTab };
  }, [activeTab]);

  const { data, isLoading } = useNotifications(page, 15, filters);
  const { data: unreadData } = useUnreadCount();

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();
  const deleteAllRead = useDeleteAllReadNotifications();

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;
  const unreadCount = unreadData?.count || 0;

  return (
    <div className={styles.notificationsPage}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.title}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount} unread</span>
            )}
          </div>
          <p className={styles.subtitle}>
            Stay up to date with activity, interactions, and community updates.
          </p>
        </div>

        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck size={14} />
              <span>Mark all as read</span>
            </button>
          )}

          <button
            type="button"
            className={`${styles.actionButton} ${styles.actionButtonDanger}`}
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to delete all read notifications?'
                )
              ) {
                deleteAllRead.mutate();
              }
            }}
            disabled={deleteAllRead.isPending}
          >
            <Trash2 size={14} />
            <span>Clear read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications List Container */}
      <div className={styles.contentContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader2 className="animate-spin h-6 w-6 text-purple-500" />
            <p>Loading your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Bell size={24} />
            </div>
            <h3 className={styles.emptyTitle}>
              {activeTab === 'unread'
                ? 'No unread notifications'
                : 'No notifications here'}
            </h3>
            <p className={styles.emptyText}>
              {activeTab === 'unread'
                ? "You're all caught up! Check other tabs to view past activity."
                : 'When others like, comment, or interact with your posts, updates will appear right here.'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.notificationsList}>
              {notifications.map((item) => (
                <div key={item.id} className={styles.notificationWrapper}>
                  <NotificationItem
                    notification={item}
                    onMarkRead={(id) => markRead.mutate(id)}
                    onDelete={(id) => deleteNotif.mutate(id)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <span className={styles.pageInfo}>
                  Page {pagination.currentPage} of {pagination.totalPages} (
                  {pagination.totalItems} total)
                </span>
                <div className={styles.pageButtons}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPreviousPage}
                  >
                    <ChevronLeft
                      size={14}
                      style={{ display: 'inline', verticalAlign: 'middle' }}
                    />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    <span>Next</span>
                    <ChevronRight
                      size={14}
                      style={{ display: 'inline', verticalAlign: 'middle' }}
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
