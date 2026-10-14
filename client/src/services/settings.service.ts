import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type {
  UserSettings,
  UpdateProfileInput,
  ChangeEmailInput,
  ChangePasswordInput,
  UpdatePrivacyInput,
  UpdateNotificationPreferencesInput,
  UpdatePreferencesInput,
} from '@/types/user';
import type { ApiClient } from '@/lib/api';

const typedApi = api as ApiClient;

export interface UploadResponse {
  url: string;
}

export interface SettingsResponse {
  settings: UserSettings;
}

export const settingsService = {
  async getSettings(): Promise<SettingsResponse> {
    return typedApi.get(API_ENDPOINTS.settings.get);
  },

  async updateProfile(
    data: UpdateProfileInput
  ): Promise<{ user: UserSettings }> {
    return typedApi.patch(API_ENDPOINTS.settings.updateProfile, data);
  },

  async changeEmail(
    data: ChangeEmailInput
  ): Promise<{ message: string; pendingEmail: string }> {
    return typedApi.patch(API_ENDPOINTS.settings.changeEmail, data);
  },

  async verifyNewEmail(token: string): Promise<{ message: string }> {
    return typedApi.get(API_ENDPOINTS.settings.verifyNewEmail, { token });
  },

  async changePassword(
    data: ChangePasswordInput
  ): Promise<{ message: string }> {
    return typedApi.patch(API_ENDPOINTS.settings.changePassword, data);
  },

  async updatePrivacy(data: UpdatePrivacyInput): Promise<{
    privacy: Pick<
      UserSettings,
      | 'profileVisibility'
      | 'emailVisibility'
      | 'allowFollowers'
      | 'allowMessages'
    >;
  }> {
    return typedApi.patch(API_ENDPOINTS.settings.updatePrivacy, data);
  },

  async updateNotificationPreferences(
    data: UpdateNotificationPreferencesInput
  ): Promise<{ notificationPreferences: Record<string, unknown> }> {
    return typedApi.patch(
      API_ENDPOINTS.settings.updateNotificationPreferences,
      data
    );
  },

  async updatePreferences(data: UpdatePreferencesInput): Promise<{
    preferences: Pick<
      UserSettings,
      'language' | 'timezone' | 'themePreference'
    >;
  }> {
    return typedApi.patch(API_ENDPOINTS.settings.updatePreferences, data);
  },

  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    return typedApi.postForm(API_ENDPOINTS.settings.uploadAvatar, formData);
  },

  async uploadCoverImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('cover', file);
    return typedApi.postForm(API_ENDPOINTS.settings.uploadCover, formData);
  },

  async deleteAvatar(): Promise<void> {
    return typedApi.delete(API_ENDPOINTS.settings.deleteAvatar);
  },

  async deleteCoverImage(): Promise<void> {
    return typedApi.delete(API_ENDPOINTS.settings.deleteCover);
  },

  async deleteAccount(password: string): Promise<void> {
    return typedApi.delete(API_ENDPOINTS.settings.deleteAccount, { password });
  },
};
