export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  image: string | null;
  bio: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE';
  authorId: string;
  author: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  tags: Tag[];
  analytics: PostAnalytics;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface PostAnalytics {
  views: number;
  likes: number;
  comments: number;
}

export interface Tag {
  id: string;
  name: string;
  postCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, 'id' | 'name' | 'image'>;
  likeCount: number;
  isLiked: boolean;
  replies: Comment[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  actor?: Pick<User, 'id' | 'name' | 'image'>;
  createdAt: string;
}

export type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'MENTION'
  | 'SYSTEM'
  | 'POST_APPROVED'
  | 'POST_REJECTED';

export interface Analytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageViewsPerPost: number;
  averageLikesPerPost: number;
}

export interface PostAnalyticsItem {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  views: number;
  likes: number;
  comments: number;
}

export interface TopPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  likes: number;
  comments: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  totalComments: number;
  totalLikes: number;
  totalViews: number;
}

export interface SeoMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  score: number;
  suggestions: string[];
}

export interface AiGenerationResponse {
  title?: string;
  excerpt?: string;
  content?: string;
  suggestedTags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  improvedTitle?: string;
  suggestions?: string[];
  improvedContent?: string;
  changes?: string[];
  titles?: string[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;
  continuation?: string;
  socialPost?: string | Record<string, unknown>;
  twitter?: string;
  linkedin?: string;
  tokenUsage?: TokenUsage;
}

export interface TokenUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  responseTime: string;
  finishReason: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface PostFormData {
  title: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED';
  visibility: 'PUBLIC' | 'PRIVATE';
  tags: string[];
  files?: File[];
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
}

export interface ProfileFormData {
  name: string;
  bio?: string;
  image?: File;
}

export interface SettingsFormData {
  name: string;
  bio?: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  image?: File;
}

export interface AiPostFormData {
  topic: string;
  targetAudience?: string;
  tone?: string;
  category?: string;
  keywords?: string;
  approximateLength?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export type ThemeMode = 'dark' | 'light' | 'system';
