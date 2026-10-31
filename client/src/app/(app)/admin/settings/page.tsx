'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Shield, Bot, Globe } from 'lucide-react';
import { useAdminSettings, useAdminMutations } from '@/features/admin/useAdmin';
import { Button } from '@/components/ui';
import styles from './page.module.css';

function parseSettingBool(val: unknown, fallback: boolean): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val === 'true';
  if (val && typeof val === 'object' && 'value' in val) {
    return String((val as { value: unknown }).value) === 'true';
  }
  return fallback;
}

export default function AdminSettingsPage() {
  const { data: remoteSettings, isLoading } = useAdminSettings();
  const { updateSettings } = useAdminMutations();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [uploadsEnabled, setUploadsEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  useEffect(() => {
    if (remoteSettings) {
      setMaintenanceMode(
        parseSettingBool(remoteSettings.maintenance_mode, false)
      );
      setRegistrationEnabled(
        parseSettingBool(remoteSettings.registration_enabled, true)
      );
      setAiEnabled(parseSettingBool(remoteSettings.ai_enabled, true));
      setUploadsEnabled(parseSettingBool(remoteSettings.uploads_enabled, true));
      setCommentsEnabled(
        parseSettingBool(remoteSettings.comments_enabled, true)
      );
    }
  }, [remoteSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings.mutateAsync({
      maintenance_mode: maintenanceMode ? 'true' : 'false',
      registration_enabled: registrationEnabled ? 'true' : 'false',
      ai_enabled: aiEnabled ? 'true' : 'false',
      uploads_enabled: uploadsEnabled ? 'true' : 'false',
      comments_enabled: commentsEnabled ? 'true' : 'false',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="text-sm">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      <form onSubmit={handleSubmit} className={styles.settingsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Settings size={20} className="text-purple-400" />
            <span>Platform Configuration</span>
          </h2>
          <p className={styles.cardDesc}>
            Manage global operational parameters, user registration, and AI
            quotas.
          </p>
        </div>

        <div className={styles.formGrid}>
          {/* Registration Enabled */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <h4 className={styles.toggleTitle}>Open User Registration</h4>
              <p className={styles.toggleDesc}>
                Allow new visitors to register accounts on the platform
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={registrationEnabled}
                onChange={(e) => setRegistrationEnabled(e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          {/* AI Features Enabled */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <h4 className={styles.toggleTitle}>AI Writing Studio Features</h4>
              <p className={styles.toggleDesc}>
                Enable AI drafting, summarization, title generation, and
                auto-tagging
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          {/* Uploads Enabled */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <h4 className={styles.toggleTitle}>Media & Image Uploads</h4>
              <p className={styles.toggleDesc}>
                Permit authors to upload story banners, inline screenshots, and
                avatars
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={uploadsEnabled}
                onChange={(e) => setUploadsEnabled(e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          {/* Comments Enabled */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <h4 className={styles.toggleTitle}>
                Public Comments & Discussion
              </h4>
              <p className={styles.toggleDesc}>
                Allow readers to publish comments and replies on stories
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={commentsEnabled}
                onChange={(e) => setCommentsEnabled(e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          {/* Maintenance Mode */}
          <div
            className={styles.toggleRow}
            style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <div className={styles.toggleInfo}>
              <h4 className={styles.toggleTitle} style={{ color: '#f87171' }}>
                Maintenance Mode
              </h4>
              <p className={styles.toggleDesc}>
                Restrict platform access to administrators only during system
                upgrades
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-white/5">
          <Button
            type="submit"
            variant="primary"
            disabled={updateSettings.isPending}
            className="px-6"
          >
            {updateSettings.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Save Platform Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
