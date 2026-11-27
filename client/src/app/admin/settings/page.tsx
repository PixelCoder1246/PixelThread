'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { adminService } from '@/services/admin';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import AuthLoader from '@/components/common/AuthLoader';
import { useRequireAdmin } from '@/hooks/useAuth';
import styles from './page.module.css';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  logo?: string;
  allowRegistration: boolean;
  defaultUserRole: 'USER' | 'ADMIN';
}

export default function AdminSettingsPage() {
  const { isLoading: authLoading } = useRequireAdmin();

  const [form, setForm] = useState<PlatformSettings>({
    siteName: 'PixelThread',
    siteDescription:
      'AI-powered blogging platform for thinkers, creators, and storytellers.',
    logo: '',
    allowRegistration: true,
    defaultUserRole: 'USER',
  });
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () =>
      adminService
        .getSettings()
        .then((res) => res as unknown as PlatformSettings),
    enabled: !authLoading,
  });

  useEffect(() => {
    if (data) {
      setForm((prev) => ({ ...prev, ...data }));
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (settings: PlatformSettings) =>
      adminService.updateSettings(settings),
    onSuccess: () => {
      showToast('success', 'Settings saved successfully');
    },
    onError: () => {
      showToast('error', 'Failed to save settings');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <AuthLoader compact message="Checking admin access" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <div className={styles.errorTitle}>Failed to load settings</div>
          <p className={styles.errorMessage}>
            Something went wrong. Please try again.
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Platform Settings</h1>
        <p className={styles.subtitle}>Configure global platform preferences</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>General</h2>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="siteName">
                Site Name
              </label>
              <input
                id="siteName"
                type="text"
                value={form.siteName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, siteName: e.target.value }))
                }
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="siteDescription">
                Site Description
              </label>
              <textarea
                id="siteDescription"
                value={form.siteDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    siteDescription: e.target.value,
                  }))
                }
                className={styles.textarea}
              />
              <p className={styles.hint}>Used for SEO and meta descriptions.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="logo">
                Logo URL
              </label>
              <input
                id="logo"
                type="text"
                value={form.logo ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, logo: e.target.value }))
                }
                className={styles.input}
                placeholder="https://example.com/logo.png"
              />
              <p className={styles.hint}>URL to your platform logo image.</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Registration</h2>

            <div className={styles.toggleRow}>
              <div>
                <div className={styles.toggleLabel}>Allow Registration</div>
                <div className={styles.toggleDesc}>
                  Enable or disable new user registration
                </div>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={form.allowRegistration}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      allowRegistration: e.target.checked,
                    }))
                  }
                />
                <div className={styles.toggleTrack} />
                <div className={styles.toggleThumb} />
              </label>
            </div>

            <hr className={styles.divider} />

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="defaultRole">
                Default User Role
              </label>
              <select
                id="defaultRole"
                value={form.defaultUserRole}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    defaultUserRole: e.target.value as 'USER' | 'ADMIN',
                  }))
                }
                className={styles.select}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p className={styles.hint}>
                Role assigned to newly registered users.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={16} />}
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>

      {toast && (
        <div
          className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}
        >
          <span className={styles.toastMessage}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
