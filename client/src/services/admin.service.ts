import { api, API_ENDPOINTS, type ApiClient } from '@/lib/api';

const typedApi = api as ApiClient;

export interface AdminDashboardData {
  users: {
    total: number;
    verified: number;
    unverified: number;
    banned: number;
    newToday: number;
  };
  posts: {
    total: number;
    published: number;
    drafts: number;
    archived: number;
    today: number;
  };
  engagement: {
    likes: number;
    comments: number;
    views: number;
    bookmarks: number;
    followers: number;
  };
  reports: {
    pending: number;
    underReview: number;
    resolved: number;
  };
}

export interface AdminPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminUserItem {
  id: string;
  name?: string | null;
  username?: string | null;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isEmailVerified: boolean;
  isActive: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  _count?: {
    posts: number;
    comments: number;
  };
}

export interface AdminPostItem {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE';
  featured?: boolean;
  isFeatured?: boolean;
  pinned?: boolean;
  isPinned?: boolean;
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
  views?: number;
  createdAt: string;
  publishedAt?: string | null;
  author: {
    id: string;
    name?: string | null;
    username?: string | null;
    email: string;
    image?: string | null;
  };
  _count?: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
}

export interface AdminCommentItem {
  id: string;
  content: string;
  isHidden?: boolean;
  status?: string;
  createdAt: string;
  author: {
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string;
    image?: string | null;
  };
  post: {
    id: string;
    title: string;
    slug: string;
  };
  likeCount?: number;
  replyCount?: number;
}

export interface AdminMediaItem {
  id: string;
  fileName: string;
  originalName?: string;
  storageKey?: string;
  publicUrl: string;
  mimeType: string;
  size?: number;
  fileSize?: number;
  createdAt: string;
  owner?: {
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string;
  };
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message?: string;
  content?: string;
  type?: 'INFO' | 'WARNING' | 'ALERT' | 'MAINTENANCE';
  isActive?: boolean;
  expiresAt?: string | null;
  createdAt: string;
  createdBy?: string;
  author?: {
    id: string;
    name?: string | null;
  };
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  admin?: {
    id: string;
    name?: string | null;
    email: string;
  };
}

export interface PlatformSettingEntry {
  value: string;
  type?: string;
  description?: string;
  updatedAt?: string | null;
}

export interface PlatformSettings {
  maintenance_mode?: string | boolean | PlatformSettingEntry;
  registration_enabled?: string | boolean | PlatformSettingEntry;
  ai_enabled?: string | boolean | PlatformSettingEntry;
  uploads_enabled?: string | boolean | PlatformSettingEntry;
  comments_enabled?: string | boolean | PlatformSettingEntry;
  [key: string]: unknown;
}

export interface PaginatedList<T> {
  items: T[];
  pagination: AdminPagination;
}

export interface AdminFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sort?: string;
  [key: string]: string | number | boolean | undefined;
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardData> {
    return typedApi.get<AdminDashboardData>(API_ENDPOINTS.admin.dashboard);
  },

  async getUsers(params?: AdminFilters): Promise<PaginatedList<AdminUserItem>> {
    return typedApi.get<PaginatedList<AdminUserItem>>(
      API_ENDPOINTS.admin.users,
      params
    );
  },

  async getUser(id: string): Promise<AdminUserItem> {
    return typedApi.get<AdminUserItem>(API_ENDPOINTS.admin.user(id));
  },

  async updateUserRole(
    id: string,
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  ): Promise<AdminUserItem> {
    return typedApi.patch<AdminUserItem>(API_ENDPOINTS.admin.userRole(id), {
      role,
    });
  },

  async banUser(id: string, reason?: string): Promise<AdminUserItem> {
    return typedApi.patch<AdminUserItem>(API_ENDPOINTS.admin.userBan(id), {
      reason,
    });
  },

  async unbanUser(id: string): Promise<AdminUserItem> {
    return typedApi.patch<AdminUserItem>(API_ENDPOINTS.admin.userUnban(id));
  },

  async verifyUser(id: string): Promise<AdminUserItem> {
    return typedApi.patch<AdminUserItem>(API_ENDPOINTS.admin.userVerify(id));
  },

  async getPosts(params?: AdminFilters): Promise<PaginatedList<AdminPostItem>> {
    return typedApi.get<PaginatedList<AdminPostItem>>(
      API_ENDPOINTS.admin.posts,
      params
    );
  },

  async deletePost(id: string): Promise<void> {
    return typedApi.delete<void>(API_ENDPOINTS.admin.postDelete(id));
  },

  async archivePost(id: string): Promise<AdminPostItem> {
    return typedApi.patch<AdminPostItem>(API_ENDPOINTS.admin.postArchive(id));
  },

  async restorePost(id: string): Promise<AdminPostItem> {
    return typedApi.patch<AdminPostItem>(API_ENDPOINTS.admin.postRestore(id));
  },

  async featurePost(id: string): Promise<AdminPostItem> {
    return typedApi.patch<AdminPostItem>(API_ENDPOINTS.admin.postFeature(id));
  },

  async unfeaturePost(id: string): Promise<AdminPostItem> {
    return typedApi.patch<AdminPostItem>(API_ENDPOINTS.admin.postUnfeature(id));
  },

  async pinPost(id: string): Promise<AdminPostItem> {
    return typedApi.patch<AdminPostItem>(API_ENDPOINTS.admin.postPin(id));
  },

  async unpinPost(id: string): Promise<AdminPostItem> {
    return typedApi.patch<AdminPostItem>(API_ENDPOINTS.admin.postUnpin(id));
  },

  async getComments(
    params?: AdminFilters
  ): Promise<PaginatedList<AdminCommentItem>> {
    return typedApi.get<PaginatedList<AdminCommentItem>>(
      API_ENDPOINTS.admin.comments,
      params
    );
  },

  async deleteComment(id: string): Promise<void> {
    return typedApi.delete<void>(API_ENDPOINTS.admin.commentDelete(id));
  },

  async hideComment(id: string): Promise<AdminCommentItem> {
    return typedApi.patch<AdminCommentItem>(
      API_ENDPOINTS.admin.commentHide(id)
    );
  },

  async approveComment(id: string): Promise<AdminCommentItem> {
    return typedApi.patch<AdminCommentItem>(
      API_ENDPOINTS.admin.commentApprove(id)
    );
  },

  async getMediaList(
    params?: AdminFilters
  ): Promise<PaginatedList<AdminMediaItem>> {
    return typedApi.get<PaginatedList<AdminMediaItem>>(
      API_ENDPOINTS.admin.media,
      params
    );
  },

  async deleteMedia(id: string): Promise<void> {
    return typedApi.delete<void>(API_ENDPOINTS.admin.mediaDelete(id));
  },

  async getOrphanedMedia(): Promise<AdminMediaItem[]> {
    return typedApi.get<AdminMediaItem[]>(API_ENDPOINTS.admin.mediaOrphaned);
  },

  async deleteOrphanedMedia(
    limit = 50
  ): Promise<{ deleted: number; remaining: number }> {
    return typedApi.delete<{ deleted: number; remaining: number }>(
      API_ENDPOINTS.admin.deleteOrphanedMedia,
      undefined,
      { limit }
    );
  },

  async getAnnouncements(
    params?: AdminFilters
  ): Promise<PaginatedList<AnnouncementItem>> {
    return typedApi.get<PaginatedList<AnnouncementItem>>(
      API_ENDPOINTS.admin.announcements,
      params
    );
  },

  async createAnnouncement(data: {
    title: string;
    content?: string;
    message?: string;
    type?: string;
    expiresAt?: string;
  }): Promise<AnnouncementItem> {
    const text = (data.message || data.content || '').trim();
    return typedApi.post<AnnouncementItem>(API_ENDPOINTS.admin.announcements, {
      title: data.title.trim(),
      message: text,
      content: text,
      type: data.type || 'INFO',
      expiresAt: data.expiresAt || undefined,
    });
  },

  async deleteAnnouncement(id: string): Promise<void> {
    return typedApi.delete<void>(API_ENDPOINTS.admin.announcementDelete(id));
  },

  async getAuditLogs(
    params?: AdminFilters
  ): Promise<PaginatedList<AuditLogItem>> {
    return typedApi.get<PaginatedList<AuditLogItem>>(
      API_ENDPOINTS.admin.auditLogs,
      params
    );
  },

  async getSettings(): Promise<PlatformSettings> {
    return typedApi.get<PlatformSettings>(API_ENDPOINTS.admin.settings);
  },

  async updateSettings(settings: PlatformSettings): Promise<PlatformSettings> {
    const payload: Record<string, string> = {};
    const validKeys = [
      'maintenance_mode',
      'registration_enabled',
      'ai_enabled',
      'uploads_enabled',
      'comments_enabled',
    ];

    for (const key of validKeys) {
      if (settings[key] !== undefined) {
        const raw = settings[key];
        const strVal =
          typeof raw === 'object' && raw !== null && 'value' in raw
            ? String((raw as { value: unknown }).value)
            : String(raw);
        payload[key] = strVal === 'true' ? 'true' : 'false';
      }
    }

    return typedApi.patch<PlatformSettings>(
      API_ENDPOINTS.admin.settings,
      payload
    );
  },
};
