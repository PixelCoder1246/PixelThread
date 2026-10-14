export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type ProfileVisibility = 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  coverImage?: string | null;
  socialLinks?: Record<string, string> | null;
  profileVisibility: ProfileVisibility;
  emailVisibility: boolean;
  allowFollowers: boolean;
  allowMessages: boolean;
  notificationPreferences?: Record<string, unknown> | null;
  language: string;
  timezone?: string | null;
  themePreference: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser {
  id: string;
  name?: string | null;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  image?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  coverImage?: string | null;
  socialLinks?: Record<string, string> | null;
  profileVisibility: ProfileVisibility;
  emailVisibility: boolean;
  allowFollowers: boolean;
  allowMessages: boolean;
  notificationPreferences?: Record<string, unknown> | null;
  language: string;
  timezone?: string | null;
  themePreference: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
  coverImage?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  profileVisibility: ProfileVisibility;
  emailVisibility: boolean;
  allowFollowers: boolean;
  createdAt: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface UserSettings {
  id: string;
  name?: string | null;
  email: string;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  image?: string | null;
  coverImage?: string | null;
  socialLinks?: Record<string, string> | null;
  profileVisibility: ProfileVisibility;
  emailVisibility: boolean;
  allowFollowers: boolean;
  allowMessages: boolean;
  notificationPreferences?: Record<string, unknown> | null;
  language: string;
  timezone?: string | null;
  themePreference: string;
  isEmailVerified: boolean;
  pendingEmail?: string | null;
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  image?: string;
  coverImage?: string;
  socialLinks?: Record<string, string>;
}

export interface ChangeEmailInput {
  newEmail: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePrivacyInput {
  profileVisibility?: ProfileVisibility;
  emailVisibility?: boolean;
  allowFollowers?: boolean;
  allowMessages?: boolean;
}

export interface UpdateNotificationPreferencesInput {
  likes?: boolean;
  comments?: boolean;
  follows?: boolean;
  mentions?: boolean;
  system?: boolean;
  postPublished?: boolean;
  email?: boolean;
  push?: boolean;
}

export interface UpdatePreferencesInput {
  language?: string;
  timezone?: string;
  themePreference?: string;
}