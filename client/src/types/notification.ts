import { User } from './user';

export type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'COMMENT_REPLY'
  | 'FOLLOW'
  | 'POST_PUBLISHED'
  | 'POST_FEATURED'
  | 'MENTION'
  | 'SYSTEM';

export type NotificationReferenceType = 'POST' | 'COMMENT' | 'USER' | 'SYSTEM';

export interface Notification {
  id: string;
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string | null;
  referenceType?: NotificationReferenceType | null;
  isRead: boolean;
  actor?: User | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UnreadCountResponse {
  count: number;
}