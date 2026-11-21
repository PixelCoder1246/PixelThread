'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users';
import { getInitials, getRandomColor, cn } from '@/lib/utils';
import styles from './page.module.css';

type SettingsTab = 'profile' | 'account' | 'appearance' | 'notifications';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fontPreference, setFontPreference] = useState('sans');

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    newsletter: false,
    product: false,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        bio: user.bio || '',
      });
    }
  }, [user, profileForm]);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          setAvatarPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleProfileSubmit = useCallback(
    async (data: ProfileFormData) => {
      setIsSavingProfile(true);
      try {
        await usersService.updateProfileSettings({
          name: data.name,
          bio: data.bio || undefined,
        });
        if (avatarFile) {
          await usersService.uploadAvatar(avatarFile);
        }
        toast.success('Profile updated successfully');
        setAvatarFile(null);
      } catch {
        toast.error('Failed to update profile');
      } finally {
        setIsSavingProfile(false);
      }
    },
    [avatarFile]
  );

  const handlePasswordSubmit = useCallback(
    async (data: PasswordFormData) => {
      setIsSavingPassword(true);
      try {
        await usersService.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
        toast.success('Password changed successfully');
        passwordForm.reset();
      } catch {
        toast.error('Failed to change password');
      } finally {
        setIsSavingPassword(false);
      }
    },
    [passwordForm]
  );

  const handleNotificationSave = useCallback(async () => {
    try {
      await usersService.updateNotificationPreferences(notifications);
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save notification preferences');
    }
  }, [notifications]);

  const handlePreferencesSave = useCallback(async () => {
    try {
      await usersService.updatePreferences({ fontPreference });
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    }
  }, [fontPreference]);

  const initials = user ? getInitials(user.name) : '';
  const avatarBg = user ? getRandomColor(user.name) : '';

  const tabContent: Record<SettingsTab, React.ReactNode> = {
    profile: (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <p className={styles.sectionDescription}>
          Update your personal information and public profile.
        </p>

        <form
          className={styles.form}
          onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
        >
          <div className={styles.avatarUpload}>
            {avatarPreview || user?.image ? (
              <img
                src={avatarPreview || user?.image || ''}
                alt={user?.name || 'Avatar'}
                className={styles.avatarPreview}
              />
            ) : (
              <div
                className={styles.avatarPlaceholder}
                style={{ background: avatarBg }}
              >
                {initials}
              </div>
            )}
            <div className={styles.avatarActions}>
              <label className={styles.avatarInput}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload size={14} />}
                onClick={() =>
                  document
                    .querySelector<HTMLInputElement>(
                      `.${styles.avatarInput} input`
                    )
                    ?.click()
                }
              >
                Upload Photo
              </Button>
              <span
                style={{
                  fontSize: 'var(--fs-xs)',
                  color: 'var(--text-tertiary)',
                }}
              >
                JPG, PNG or GIF. Max 5MB.
              </span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className={cn(
                styles.input,
                profileForm.formState.errors.name && styles.inputError
              )}
              {...profileForm.register('name')}
              placeholder="Your name"
            />
            {profileForm.formState.errors.name && (
              <span className={styles.error}>
                {profileForm.formState.errors.name.message}
              </span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              className={cn(
                styles.textarea,
                profileForm.formState.errors.bio && styles.textareaError
              )}
              {...profileForm.register('bio')}
              placeholder="Tell us about yourself..."
              rows={4}
            />
            {profileForm.formState.errors.bio && (
              <span className={styles.error}>
                {profileForm.formState.errors.bio.message}
              </span>
            )}
          </div>

          <div className={styles.actions}>
            <Button type="submit" isLoading={isSavingProfile}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    ),

    account: (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <p className={styles.sectionDescription}>
          Manage your account settings and password.
        </p>

        <div className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              value={user?.email || ''}
              disabled
            />
            <span
              style={{
                fontSize: 'var(--fs-xs)',
                color: 'var(--text-tertiary)',
              }}
            >
              Your email address is read-only.
            </span>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-primary)',
              paddingTop: 'var(--space-6)',
              marginTop: 'var(--space-2)',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--fs-base)',
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Change Password
            </h3>

            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className={cn(
                    styles.input,
                    passwordForm.formState.errors.currentPassword &&
                      styles.inputError
                  )}
                  {...passwordForm.register('currentPassword')}
                  placeholder="Enter current password"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <span className={styles.error}>
                    {passwordForm.formState.errors.currentPassword.message}
                  </span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className={cn(
                    styles.input,
                    passwordForm.formState.errors.newPassword &&
                      styles.inputError
                  )}
                  {...passwordForm.register('newPassword')}
                  placeholder="Enter new password"
                />
                {passwordForm.formState.errors.newPassword && (
                  <span className={styles.error}>
                    {passwordForm.formState.errors.newPassword.message}
                  </span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={cn(
                    styles.input,
                    passwordForm.formState.errors.confirmPassword &&
                      styles.inputError
                  )}
                  {...passwordForm.register('confirmPassword')}
                  placeholder="Confirm new password"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <span className={styles.error}>
                    {passwordForm.formState.errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <div className={styles.actions}>
                <Button type="submit" isLoading={isSavingPassword}>
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    ),

    appearance: (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>
        <p className={styles.sectionDescription}>
          Customize how PixelThread looks for you.
        </p>

        <div className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Font Preference</label>
            <div className={styles.fontOptions}>
              {[
                { value: 'sans', label: 'Sans', hint: 'Inter' },
                { value: 'serif', label: 'Serif', hint: 'Merriweather' },
                { value: 'mono', label: 'Mono', hint: 'JetBrains Mono' },
              ].map(({ value, label, hint }) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    styles.fontOption,
                    fontPreference === value && styles.active
                  )}
                  onClick={() => setFontPreference(value)}
                >
                  <div className={styles.fontOptionLabel}>{label}</div>
                  <div className={styles.fontOptionHint}>{hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Button onClick={handlePreferencesSave}>Save Preferences</Button>
          </div>
        </div>
      </div>
    ),

    notifications: (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notifications</h2>
        <p className={styles.sectionDescription}>
          Manage which notifications you receive.
        </p>

        <div className={styles.form}>
          {(
            [
              {
                key: 'likes',
                title: 'Likes',
                description: 'When someone likes your post',
              },
              {
                key: 'comments',
                title: 'Comments',
                description: 'When someone comments on your post',
              },
              {
                key: 'follows',
                title: 'Follows',
                description: 'When someone follows you',
              },
              {
                key: 'mentions',
                title: 'Mentions',
                description: 'When someone mentions you',
              },
              {
                key: 'newsletter',
                title: 'Newsletter',
                description: 'Receive weekly newsletter and updates',
              },
              {
                key: 'product',
                title: 'Product Updates',
                description: 'New features and improvements',
              },
            ] as const
          ).map(({ key, title, description }) => (
            <div key={key} className={styles.notificationGroup}>
              <div className={styles.notificationInfo}>
                <span className={styles.notificationTitle}>{title}</span>
                <span className={styles.notificationDescription}>
                  {description}
                </span>
              </div>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}

          <div className={styles.actions}>
            <Button onClick={handleNotificationSave}>Save Preferences</Button>
          </div>
        </div>
      </div>
    ),
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <SettingsLayout
      title="Settings"
      description="Manage your account settings and preferences."
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-1)',
            borderBottom: '1px solid var(--border-primary)',
            width: '100%',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--fw-medium)',
                color:
                  activeTab === tab.id
                    ? 'var(--text-primary)'
                    : 'var(--text-tertiary)',
                borderBottom:
                  activeTab === tab.id
                    ? '2px solid var(--primary-500)'
                    : '2px solid transparent',
                marginBottom: -1,
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.page}>{tabContent[activeTab]}</div>
    </SettingsLayout>
  );
}
