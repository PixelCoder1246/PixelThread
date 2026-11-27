import { config } from '@/config';

export const APP_NAME = 'PixelThread';
export const APP_DESCRIPTION =
  'Where Ideas Come to Life — AI-powered blogging platform for thinkers, creators, and storytellers.';
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = config.api.baseUrl;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  FEED: '/feed',
  EXPLORE: '/explore',
  SEARCH: '/search',
  TRENDING: '/trending',
  BOOKMARKS: '/bookmarks',
  HISTORY: '/history',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  PUBLIC_PROFILE: (id: string) => `/profile/${id}`,
  SETTINGS: '/settings',
  CREATE_POST: '/posts/create',
  EDIT_POST: (id: string) => `/posts/${id}/edit`,
  POST: (slug: string) => `/posts/${slug}`,
  ANALYTICS: '/analytics',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_LOGS: '/admin/logs',
} as const;

export const POST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const VISIBILITY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const;

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  MOST_VIEWED: 'mostViewed',
  MOST_LIKED: 'mostLiked',
  RELEVANCE: 'relevance',
} as const;

export const AI_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'technical', label: 'Technical' },
  { value: 'academic', label: 'Academic' },
  { value: 'storytelling', label: 'Storytelling' },
] as const;

export const AI_CATEGORIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'health', label: 'Health' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'science', label: 'Science' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food' },
  { value: 'finance', label: 'Finance' },
  { value: 'sports', label: 'Sports' },
  { value: 'politics', label: 'Politics' },
  { value: 'culture', label: 'Culture' },
  { value: 'other', label: 'Other' },
] as const;

export const AI_LENGTHS = [
  { value: 'short', label: 'Short (~500 words)' },
  { value: 'medium', label: 'Medium (~1000 words)' },
  { value: 'long', label: 'Long (~1500 words)' },
  { value: 'comprehensive', label: 'Comprehensive (~2500 words)' },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const TOAST_DURATION = 4000;

export const DEBOUNCE_DELAY = 300;

export const SEARCH_MIN_QUERY = 2;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const READING_SPEED = 200;
