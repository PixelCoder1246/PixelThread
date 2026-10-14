export const APP_NAME = 'PixelThread';
export const APP_DESCRIPTION = 'AI-powered blogging platform';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  RESEND_VERIFICATION: '/resend-verification',
  POSTS: '/posts',
  POST_NEW: '/posts/new',
  POST_MY: '/posts/my-posts',
  POST_DETAIL: (slug: string) => `/posts/${slug}`,
  POST_EDIT: (id: string) => `/posts/${id}/edit`,
  PROFILE: (username: string) => `/users/${username}`,
  PROFILE_SETTINGS: '/profile/settings',
  SEARCH: '/search',
  BOOKMARKS: '/bookmarks',
  HISTORY: '/history',
  NOTIFICATIONS: '/notifications',
  FOLLOWING: '/following',
  ANALYTICS: '/analytics',
  TAGS: '/tags',
  TAG_POSTS: (name: string) => `/tags/${name}`,
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme',
  DRAFT_PREFIX: 'draft_',
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;

export const POST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const POST_VISIBILITY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const PROFILE_VISIBILITY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  FOLLOWERS_ONLY: 'FOLLOWERS_ONLY',
} as const;

export const NOTIFICATION_TYPES = {
  LIKE: 'LIKE',
  COMMENT: 'COMMENT',
  COMMENT_REPLY: 'COMMENT_REPLY',
  FOLLOW: 'FOLLOW',
  POST_PUBLISHED: 'POST_PUBLISHED',
  POST_FEATURED: 'POST_FEATURED',
  MENTION: 'MENTION',
  SYSTEM: 'SYSTEM',
} as const;