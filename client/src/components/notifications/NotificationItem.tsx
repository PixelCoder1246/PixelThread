'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  CornerDownRight,
  UserPlus,
  BookOpen,
  Star,
  AtSign,
  Bell,
  Check,
  Trash2,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types/notification';
import { Avatar } from '@/components/ui/Avatar';
import styles from './NotificationItem.module.css';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete,
  onClick,
}) => {
  const router = useRouter();

  const getTargetUrl = () => {
    switch (notification.referenceType) {
      case 'POST':
        return `/posts/${notification.referenceId || ''}`;
      case 'USER':
        return notification.actor
          ? `/authors/${notification.actor.username || notification.actor.id}`
          : '/posts';
      case 'COMMENT':
        return '/posts';
      default:
        return '/notifications';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If clicking an action button, don't navigate
    if ((e.target as HTMLElement).closest(`.${styles.actions}`)) {
      return;
    }

    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification.id);
    }

    if (onClick) {
      onClick();
    }

    const target = getTargetUrl();
    if (target) {
      router.push(target);
    }
  };

  const renderTypeIcon = (type: NotificationType) => {
    const iconSize = 10;
    switch (type) {
      case 'LIKE':
        return (
          <div className={`${styles.typeIconBadge} ${styles.typeLike}`}>
            <Heart size={iconSize} />
          </div>
        );
      case 'COMMENT':
        return (
          <div className={`${styles.typeIconBadge} ${styles.typeComment}`}>
            <MessageCircle size={iconSize} />
          </div>
        );
      case 'COMMENT_REPLY':
        return (
          <div className={`${styles.typeIconBadge} ${styles.typeReply}`}>
            <CornerDownRight size={iconSize} />
          </div>
        );
      case 'FOLLOW':
        return (
          <div className={`${styles.typeIconBadge} ${styles.typeFollow}`}>
            <UserPlus size={iconSize} />
          </div>
        );
      case 'POST_PUBLISHED':
        return (
          <div className={`${styles.typeIconBadge} ${styles.typePost}`}>
            <BookOpen size={iconSize} />
          </div>
        );
      case 'POST_FEATURED':
        return (
          <div className={`${styles.typeIconBadge} ${styles.typeFeatured}`}>
            <Star size={iconSize} />
          </div>
        );
      case 'MENTION':
        return (
          <div className={`${styles.typeIconBadge} ${styles.typeMention}`}>
            <AtSign size={iconSize} />
          </div>
        );
      case 'SYSTEM':
      default:
        return (
          <div className={`${styles.typeIconBadge} ${styles.typeSystem}`}>
            <Bell size={iconSize} />
          </div>
        );
    }
  };

  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
      });
    } catch {
      return '';
    }
  }, [notification.createdAt]);

  return (
    <div
      className={`${styles.item} ${!notification.isRead ? styles.itemUnread : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      <div className={styles.avatarWrapper}>
        <Avatar
          src={notification.actor?.image || undefined}
          fallback={
            notification.actor?.name ||
            notification.actor?.username ||
            notification.title ||
            'P'
          }
          size="sm"
        />
        {renderTypeIcon(notification.type)}
      </div>

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <span className={styles.title}>{notification.title}</span>
          <span className={styles.time}>{timeAgo}</span>
        </div>
        <p className={styles.message}>{notification.message}</p>
      </div>

      <div className={styles.actions}>
        {!notification.isRead && onMarkRead && (
          <button
            type="button"
            className={styles.actionBtn}
            title="Mark as read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
          >
            <Check size={14} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
            title="Delete notification"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
