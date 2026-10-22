import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/features/auth/useAuth';
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  UpdatePrivacyInput,
  UpdateNotificationPreferencesInput,
  UpdatePreferencesInput,
} from '@/types/user';

export function useSettings() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.settings.me,
    queryFn: () => settingsService.getSettings(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      settingsService.updateProfile(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      if (res?.user) {
        updateUser(res.user);
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      settingsService.changePassword(data),
  });
}

export function useUpdatePrivacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePrivacyInput) =>
      settingsService.updatePrivacy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferencesInput) =>
      settingsService.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesInput) =>
      settingsService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useDeleteAccount() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: (password: string) => settingsService.deleteAccount(password),
    onSuccess: async () => {
      await logout();
    },
  });
}

export function useUploadCoverImage() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (file: File) => settingsService.uploadCoverImage(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      if (res?.url) {
        updateUser({ coverImage: res.url });
      }
    },
  });
}

export function useDeleteCoverImage() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: () => settingsService.deleteCoverImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      updateUser({ coverImage: null });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (file: File) => settingsService.uploadAvatar(file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      if (res?.url) {
        updateUser({ image: res.url });
      }
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: () => settingsService.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      updateUser({ image: null });
    },
  });
}
