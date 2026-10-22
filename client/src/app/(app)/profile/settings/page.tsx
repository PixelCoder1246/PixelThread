'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Bell,
  Sliders,
  AlertTriangle,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  Key,
  Camera,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import {
  useSettings,
  useUpdateProfile,
  useChangePassword,
  useUpdatePrivacy,
  useUpdateNotificationPreferences,
  useUpdatePreferences,
  useDeleteAccount,
  useUploadCoverImage,
  useDeleteCoverImage,
  useUploadAvatar,
  useDeleteAvatar,
} from '@/features/settings/useSettings';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { ProfileVisibility } from '@/types/user';
import styles from './page.module.css';

type SettingsTab =
  | 'profile'
  | 'account'
  | 'privacy'
  | 'notifications'
  | 'preferences'
  | 'danger';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Fetch full settings from API
  const { data: settingsData, isLoading: settingsLoading } = useSettings();
  const settings = settingsData?.settings;

  // Mutations
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const updatePrivacy = useUpdatePrivacy();
  const updateNotificationPrefs = useUpdateNotificationPreferences();
  const updatePrefs = useUpdatePreferences();
  const deleteAccount = useDeleteAccount();
  const uploadCover = useUploadCoverImage();
  const deleteCover = useDeleteCoverImage();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  // Profile form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [image, setImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Privacy form state
  const [profileVisibility, setProfileVisibility] =
    useState<ProfileVisibility>('PUBLIC');
  const [emailVisibility, setEmailVisibility] = useState(false);
  const [allowFollowers, setAllowFollowers] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  // Notification form state
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFollows, setNotifyFollows] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);

  // Preferences form state
  const [language, setLanguage] = useState('en');
  const [themePreference, setThemePreference] = useState('dark');
  const [timezone, setTimezone] = useState('UTC');

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Populate from settings or auth user
  useEffect(() => {
    const s = settings || (user as unknown as Record<string, unknown>);
    if (s) {
      setName((s.name as string) ?? '');
      setUsername((s.username as string) ?? '');
      setBio((s.bio as string) ?? '');
      setLocation((s.location as string) ?? '');
      setWebsite((s.website as string) ?? '');
      setImage((s.image as string) ?? '');
      setCoverImage((s.coverImage as string) ?? '');

      const socials = (s.socialLinks as Record<string, string>) || {};
      setTwitter(socials.twitter ?? '');
      setGithub(socials.github ?? '');
      setLinkedin(socials.linkedin ?? '');

      if (s.profileVisibility) {
        setProfileVisibility(s.profileVisibility as ProfileVisibility);
      }
      setEmailVisibility(Boolean(s.emailVisibility));
      setAllowFollowers(s.allowFollowers !== false);
      setAllowMessages(s.allowMessages !== false);

      const notifs =
        (s.notificationPreferences as Record<string, boolean>) || {};
      setNotifyLikes(notifs.likes !== false);
      setNotifyComments(notifs.comments !== false);
      setNotifyFollows(notifs.follows !== false);
      setNotifyMentions(notifs.mentions !== false);

      if (s.language) setLanguage(s.language as string);
      if (s.themePreference) setThemePreference(s.themePreference as string);
      if (s.timezone) setTimezone(s.timezone as string);
    }
  }, [settings, user]);

  // Handle direct file uploads
  const handleCoverFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        message: 'Cover banner image must not exceed 5MB.',
        type: 'error',
      });
      return;
    }
    try {
      const res = await uploadCover.mutateAsync(file);
      if (res?.url) {
        setCoverImage(res.url);
      }
      toast({
        title: 'Banner uploaded',
        message: 'Your banner photo has been updated.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        message:
          err instanceof Error ? err.message : 'Could not upload banner.',
        type: 'error',
      });
    }
  };

  const handleDeleteCover = async () => {
    try {
      await deleteCover.mutateAsync();
      setCoverImage('');
      toast({
        title: 'Banner removed',
        message: 'Your profile banner has been reset to default.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Action failed',
        message:
          err instanceof Error ? err.message : 'Could not delete banner.',
        type: 'error',
      });
    }
  };

  const handleAvatarFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        message: 'Avatar image must not exceed 5MB.',
        type: 'error',
      });
      return;
    }
    try {
      const res = await uploadAvatar.mutateAsync(file);
      if (res?.url) {
        setImage(res.url);
      }
      toast({
        title: 'Avatar uploaded',
        message: 'Your profile avatar has been updated.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        message:
          err instanceof Error ? err.message : 'Could not upload avatar.',
        type: 'error',
      });
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar.mutateAsync();
      setImage('');
      toast({
        title: 'Avatar removed',
        message: 'Your profile picture has been reset to default.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Action failed',
        message:
          err instanceof Error ? err.message : 'Could not delete avatar.',
        type: 'error',
      });
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        image: image.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        socialLinks: {
          twitter: twitter.trim() || undefined,
          github: github.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
        },
      });
      toast({
        title: 'Profile updated',
        message: 'Your personal information has been saved successfully.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Update failed',
        message:
          err instanceof Error
            ? err.message
            : 'Could not save profile details.',
        type: 'error',
      });
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords mismatch',
        message: 'New password and confirmation do not match.',
        type: 'error',
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        message: 'New password must be at least 8 characters long.',
        type: 'error',
      });
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast({
        title: 'Password changed',
        message: 'Your password was changed successfully.',
        type: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast({
        title: 'Failed to change password',
        message:
          err instanceof Error
            ? err.message
            : 'Could not change password. Check your current password.',
        type: 'error',
      });
    }
  };

  // Handle Save Privacy
  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePrivacy.mutateAsync({
        profileVisibility,
        emailVisibility,
        allowFollowers,
        allowMessages,
      });
      toast({
        title: 'Privacy settings saved',
        message: 'Your privacy preferences have been updated.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Failed to update privacy',
        message:
          err instanceof Error
            ? err.message
            : 'Could not save privacy settings.',
        type: 'error',
      });
    }
  };

  // Handle Save Notifications
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateNotificationPrefs.mutateAsync({
        likes: notifyLikes,
        comments: notifyComments,
        follows: notifyFollows,
        mentions: notifyMentions,
      });
      toast({
        title: 'Notification preferences saved',
        message:
          'You will now receive notifications based on your updated settings.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Failed to save notifications',
        message:
          err instanceof Error
            ? err.message
            : 'Could not update notification settings.',
        type: 'error',
      });
    }
  };

  // Handle Save Preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePrefs.mutateAsync({
        language,
        themePreference,
        timezone,
      });
      toast({
        title: 'Preferences saved',
        message: 'Interface preferences have been successfully updated.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Failed to save preferences',
        message:
          err instanceof Error ? err.message : 'Could not update preferences.',
        type: 'error',
      });
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: 'Password required',
        message: 'Please enter your password to confirm account deletion.',
        type: 'error',
      });
      return;
    }

    try {
      await deleteAccount.mutateAsync(deletePassword);
    } catch (err) {
      toast({
        title: 'Deletion failed',
        message:
          err instanceof Error
            ? err.message
            : 'Incorrect password or deletion error.',
        type: 'error',
      });
    }
  };

  return (
    <div className={styles.profileSettingsPage}>
      <header className={styles.header}>
        <h1>Account Settings</h1>
        <p className={styles.subtitle}>
          Manage your personal profile, security credentials, and platform
          preferences.
        </p>
      </header>

      {/* Tabs list */}
      <div className={styles.tabsList} role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`${styles.tabTrigger} ${activeTab === 'profile' ? styles.tabTriggerActive : ''}`}
        >
          <User size={15} />
          <span>Profile</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`${styles.tabTrigger} ${activeTab === 'account' ? styles.tabTriggerActive : ''}`}
        >
          <Lock size={15} />
          <span>Account & Security</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`${styles.tabTrigger} ${activeTab === 'privacy' ? styles.tabTriggerActive : ''}`}
        >
          <Shield size={15} />
          <span>Privacy</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`${styles.tabTrigger} ${activeTab === 'notifications' ? styles.tabTriggerActive : ''}`}
        >
          <Bell size={15} />
          <span>Notifications</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`${styles.tabTrigger} ${activeTab === 'preferences' ? styles.tabTriggerActive : ''}`}
        >
          <Sliders size={15} />
          <span>Preferences</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('danger')}
          className={`${styles.tabTrigger} ${activeTab === 'danger' ? styles.tabTriggerActive : ''}`}
          style={{ color: activeTab === 'danger' ? '#f87171' : undefined }}
        >
          <AlertTriangle size={15} />
          <span>Danger Zone</span>
        </button>
      </div>

      <div className={styles.tabContent}>
        {/* 1. Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Public Profile</h2>
              <p className={styles.cardSubtitle}>
                This information will be displayed publicly on your author
                profile and stories.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alexmorgan"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about yourself, your background, and your interests..."
                  className={styles.textarea}
                  maxLength={500}
                />
                <span className={styles.helpText}>
                  {bio.length}/500 characters
                </span>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Website / Portfolio</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Profile Picture / Avatar */}
              <div className={styles.mediaSection}>
                <label className={styles.label}>Profile Picture (Avatar)</label>
                <div className={styles.avatarRow}>
                  <Avatar
                    src={image || undefined}
                    alt={name || username || 'User'}
                    fallback={(name || username || 'U').charAt(0).toUpperCase()}
                    size="lg"
                  />
                  <div className={styles.uploadActions}>
                    <label
                      className={`${styles.fileButton} ${uploadAvatar.isPending ? styles.fileButtonDisabled : ''}`}
                    >
                      <Camera size={14} />
                      <span>
                        {uploadAvatar.isPending
                          ? 'Uploading...'
                          : 'Upload Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.hiddenFileInput}
                        onChange={handleAvatarFileUpload}
                        disabled={uploadAvatar.isPending}
                      />
                    </label>
                    {image && (
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        disabled={deleteAvatar.isPending}
                        className={styles.removeButton}
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className={styles.formGroup}
                  style={{ marginTop: '0.25rem' }}
                >
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Or enter image URL (https://example.com/avatar.jpg)"
                    className={styles.input}
                  />
                  <span className={styles.helpText}>
                    Supports direct file upload (JPG, PNG, GIF up to 5MB) or
                    public image URL.
                  </span>
                </div>
              </div>

              {/* Profile Banner / Cover Photo */}
              <div className={styles.mediaSection}>
                <label className={styles.label}>
                  Profile Banner (Cover Photo)
                </label>
                <div className={styles.bannerPreviewBox}>
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImage}
                      alt="Banner Preview"
                      className={styles.bannerImg}
                    />
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                      }}
                    >
                      <ImageIcon
                        size={28}
                        style={{ margin: '0 auto 0.25rem', opacity: 0.6 }}
                      />
                      <p>Default gradient banner will be displayed</p>
                    </div>
                  )}
                </div>
                <div className={styles.uploadActions}>
                  <label
                    className={`${styles.fileButton} ${uploadCover.isPending ? styles.fileButtonDisabled : ''}`}
                  >
                    <UploadCloud size={14} />
                    <span>
                      {uploadCover.isPending
                        ? 'Uploading Banner...'
                        : 'Upload Banner Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.hiddenFileInput}
                      onChange={handleCoverFileUpload}
                      disabled={uploadCover.isPending}
                    />
                  </label>
                  {coverImage && (
                    <button
                      type="button"
                      onClick={handleDeleteCover}
                      disabled={deleteCover.isPending}
                      className={styles.removeButton}
                    >
                      <Trash2 size={13} />
                      <span>Remove Banner</span>
                    </button>
                  )}
                </div>
                <div
                  className={styles.formGroup}
                  style={{ marginTop: '0.25rem' }}
                >
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Or enter banner URL (https://example.com/banner.jpg)"
                    className={styles.input}
                  />
                  <span className={styles.helpText}>
                    Recommended resolution: 1200×300px. Supports PNG, JPG, WEBP
                    under 5MB.
                  </span>
                </div>
              </div>

              <div
                className={styles.formHeader}
                style={{ marginTop: '0.5rem' }}
              >
                <h3
                  className={styles.label}
                  style={{ fontSize: '0.8rem', color: '#94a3b8' }}
                >
                  Social Handles
                </h3>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Twitter / X</label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@username"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>GitHub</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="github_username"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>LinkedIn</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin_slug"
                  className={styles.input}
                />
              </div>

              <div className={styles.actionsBar}>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="gap-2"
                >
                  {updateProfile.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Profile</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 2. Account & Security Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Account Credentials</h2>
                <p className={styles.cardSubtitle}>
                  View your registered email address and authentication details.
                </p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Registered Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={styles.input}
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    {user?.isEmailVerified ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle size={13} /> Verified Email
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 font-medium">
                        Unverified Email
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Change Password</h2>
                <p className={styles.cardSubtitle}>
                  Ensure your account uses a secure password of at least 8
                  characters.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.actionsBar}>
                  <Button
                    type="submit"
                    disabled={
                      changePassword.isPending ||
                      !currentPassword ||
                      !newPassword
                    }
                    className="gap-2"
                  >
                    {changePassword.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Key size={16} />
                    )}
                    <span>Update Password</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Privacy & Visibility</h2>
              <p className={styles.cardSubtitle}>
                Control who can view your profile, contact you, and see your
                activity.
              </p>
            </div>

            <form onSubmit={handleSavePrivacy} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Profile Visibility</label>
                <select
                  value={profileVisibility}
                  onChange={(e) =>
                    setProfileVisibility(e.target.value as ProfileVisibility)
                  }
                  className={styles.select}
                >
                  <option value="PUBLIC">
                    Public (everyone can see your profile)
                  </option>
                  <option value="FOLLOWERS_ONLY">
                    Followers Only (only approved followers)
                  </option>
                  <option value="PRIVATE">
                    Private (hidden from public listings)
                  </option>
                </select>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>
                    Display Email on Profile
                  </span>
                  <span className={styles.toggleDesc}>
                    Allow readers and collaborators to view your email address.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailVisibility}
                  onChange={(e) => setEmailVisibility(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>Allow Followers</span>
                  <span className={styles.toggleDesc}>
                    Permit other writers and readers to follow your published
                    stories.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowFollowers}
                  onChange={(e) => setAllowFollowers(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>
                    Direct Responses & Messages
                  </span>
                  <span className={styles.toggleDesc}>
                    Allow readers to comment and interact with your stories.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowMessages}
                  onChange={(e) => setAllowMessages(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.actionsBar}>
                <Button
                  type="submit"
                  disabled={updatePrivacy.isPending}
                  className="gap-2"
                >
                  {updatePrivacy.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Privacy</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Notification Preferences</h2>
              <p className={styles.cardSubtitle}>
                Choose the events and interactions you want to be notified
                about.
              </p>
            </div>

            <form
              onSubmit={handleSaveNotifications}
              className={styles.formGrid}
            >
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>Story Likes</span>
                  <span className={styles.toggleDesc}>
                    Receive a notification when someone likes your published
                    stories.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyLikes}
                  onChange={(e) => setNotifyLikes(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>
                    Responses & Comments
                  </span>
                  <span className={styles.toggleDesc}>
                    Receive notifications for new comments and replies on your
                    stories.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyComments}
                  onChange={(e) => setNotifyComments(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>New Followers</span>
                  <span className={styles.toggleDesc}>
                    Be alerted when another reader or creator follows you.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyFollows}
                  onChange={(e) => setNotifyFollows(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>Mentions</span>
                  <span className={styles.toggleDesc}>
                    Be notified when another author mentions your handle in a
                    story.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyMentions}
                  onChange={(e) => setNotifyMentions(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>

              <div className={styles.actionsBar}>
                <Button
                  type="submit"
                  disabled={updateNotificationPrefs.isPending}
                  className="gap-2"
                >
                  {updateNotificationPrefs.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Preferences</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 5. Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Interface Preferences</h2>
              <p className={styles.cardSubtitle}>
                Customize theme, timezone, and language preferences.
              </p>
            </div>

            <form onSubmit={handleSavePreferences} className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Theme Appearance</label>
                  <select
                    value={themePreference}
                    onChange={(e) => setThemePreference(e.target.value)}
                    className={styles.select}
                  >
                    <option value="dark">Dark Theme (Default)</option>
                    <option value="light">Light Theme</option>
                    <option value="system">System Default</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={styles.select}
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={styles.select}
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">
                    Eastern Time (US & Canada)
                  </option>
                  <option value="America/Los_Angeles">
                    Pacific Time (US & Canada)
                  </option>
                  <option value="Europe/London">London (GMT / BST)</option>
                  <option value="Europe/Paris">Paris, Berlin, Amsterdam</option>
                  <option value="Asia/Tokyo">Tokyo, Osaka (JST)</option>
                  <option value="Asia/Kolkata">
                    India Standard Time (IST)
                  </option>
                </select>
              </div>

              <div className={styles.actionsBar}>
                <Button
                  type="submit"
                  disabled={updatePrefs.isPending}
                  className="gap-2"
                >
                  {updatePrefs.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Preferences</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 6. Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className={`${styles.card} ${styles.dangerCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={`${styles.cardTitle} ${styles.dangerTitle}`}>
                Danger Zone
              </h2>
              <p className={styles.cardSubtitle}>
                Irreversible actions that affect your account and data.
              </p>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span
                  className={styles.toggleTitle}
                  style={{ color: '#f87171' }}
                >
                  Delete Account
                </span>
                <span className={styles.toggleDesc}>
                  Permanently delete your PixelThread account, published
                  stories, bookmarks, and analytics. This action cannot be
                  undone.
                </span>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </div>

            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <h3 className="text-lg font-bold text-red-400 mb-2">
                    Confirm Account Deletion
                  </h3>
                  <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                    Please enter your password to confirm that you want to
                    delete your account. All your data will be permanently
                    purged.
                  </p>

                  <div className="mb-4">
                    <label className={styles.label}>Your Password</label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="••••••••"
                      className={styles.input}
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletePassword('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={!deletePassword || deleteAccount.isPending}
                    >
                      {deleteAccount.isPending
                        ? 'Deleting...'
                        : 'Permanently Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
