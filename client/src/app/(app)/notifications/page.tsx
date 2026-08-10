'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Shield,
  CheckCheck,
  Check,
  FileCheck,
  FileX,
} from 'lucide-react';
import { notificationsService } from '@/services/notifications';
import { cn, formatRelativeDate } from '@/lib/utils';
import { PAGINATION } from '@/constants';
import type { Notification, NotificationType } from '@/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/common/EmptyState';
import AuthLoader from '@/components/common/AuthLoader';
import { useRequireAuth } from '@/hooks/useAuth';
import styles from './page.module.css';

type FilterMode = 'all' | 'unread';

const FILTERS = [
  { id: 'all' as FilterMode, label: 'All' },
  { id: 'unread' as FilterMode, label: 'Unread' },
];

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'LIKE':
      return { icon: Heart, className: styles.iconLike };
    case 'COMMENT':
      return { icon: MessageCircle, className: styles.iconComment };
    case 'FOLLOW':
      return { icon: UserPlus, className: styles.iconFollow };
    case 'MENTION':
      return { icon: AtSign, className: styles.iconMention };
    case 'SYSTEM':
      return { icon: Shield, className: styles.iconSystem };
    case 'POST_APPROVED':
      return { icon: FileCheck, className: styles.iconPostApproved };
    case 'POST_REJECTED':
      return { icon: FileX, className: styles.iconPostRejected };
    default:
      return { icon: Bell, className: styles.iconSystem };
  }
}

function NotificationSkeleton() {
  return (
    <div className={styles.loadingSkeleton}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonBody}>
            <div className={cn(styles.skeletonLine, styles.skeletonLineMedium)} />
            <div className={cn(styles.skeletonLine, styles.skeletonLineShort)} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [hasMore, setHasMore] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (p: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingData(true);
    }
    setError(null);

    try {
      const res = await notificationsService.getAll({
        page: p,
        limit: PAGINATION.DEFAULT_LIMIT,
        type: filter === 'unread' ? 'unread' : undefined,
      });
      const items = res.notifications;
      const pagination = res.pagination as { hasNextPage: boolean; page: number };

      if (append) {
        setNotifications((prev) => [...prev, ...items]);
      } else {
        setNotifications(items);
      }
      setHasMore(pagination.hasNextPage);
      setPage(p);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setIsLoadingData(false);
      setIsLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    setPage(PAGINATION.DEFAULT_PAGE);
    setNotifications([]);
    setHasMore(true);
    fetchNotifications(PAGINATION.DEFAULT_PAGE, false);
  }, [filter, fetchNotifications, isLoading, isAuthenticated]);

  useEffect(() => {
    if (!hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNotifications(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, isLoadingMore, isLoading, page, fetchNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    } finally {
      setMarkingAll(false);
    }
  }, []);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationsService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } catch {
        // silently fail
      }
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }, [router]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Bell size={28} className={styles.headerIcon} />
          <h1 className={styles.title}>Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={markingAll ? <Spinner size="sm" /> : <CheckCheck size={16} />}
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={cn(styles.filterTab, filter === f.id && styles.filterTabActive)}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.id === 'unread' && unreadCount > 0 && (
              <span style={{ marginLeft: 'var(--space-1_5)', fontSize: 'var(--fs-xs)', color: 'var(--primary-500)' }}>
                ({unreadCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <AuthLoader fullPage message="Checking authentication" />
      ) : !isAuthenticated ? (
        <AuthLoader fullPage message="Redirecting to login" />
      ) : isLoadingData ? (
        <NotificationSkeleton />
      ) : error ? (
        <div className={styles.error}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }}>{error}</p>
          <Button variant="secondary" onClick={() => fetchNotifications(PAGINATION.DEFAULT_PAGE, false)}>
            Try Again
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            filter === 'unread'
              ? 'You have no unread notifications.'
              : 'Notifications about likes, comments, and follows will appear here.'
          }
        />
      ) : (
        <>
          <div className={styles.list}>
            {notifications.map((notification) => {
              const { icon: Icon, className: iconClass } = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={cn(styles.item, !notification.read && styles.itemUnread)}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={cn(styles.iconWrapper, iconClass)}>
                    <Icon size={16} />
                  </div>

                  <div className={styles.content}>
                    <p className={styles.message}>{notification.message}</p>
                    <span className={styles.time}>
                      {formatRelativeDate(notification.createdAt)}
                    </span>
                  </div>

                  {!notification.read && <div className={styles.unreadDot} />}
                </div>
              );
            })}
          </div>

          {isLoadingMore && (
            <div className={styles.loadMore}>
              <Spinner size="md" />
            </div>
          )}

          {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
        </>
      )}
    </div>
  );
}
