'use client';

import { useState } from 'react';
import { Megaphone, Trash2, Send, Loader2, Bell } from 'lucide-react';
import {
  useAdminAnnouncements,
  useAdminMutations,
} from '@/features/admin/useAdmin';
import { Button } from '@/components/ui';
import styles from './page.module.css';

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'INFO' | 'WARNING' | 'ALERT'>('INFO');

  const { data, isLoading } = useAdminAnnouncements();
  const { createAnnouncement, deleteAnnouncement } = useAdminMutations();

  const announcements = data?.items || (Array.isArray(data) ? data : []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await createAnnouncement.mutateAsync({
      title: title.trim(),
      message: content.trim(),
      content: content.trim(),
      type,
    });

    setTitle('');
    setContent('');
    setType('INFO');
  };

  return (
    <div className={styles.announcementsContainer}>
      {/* Publisher Form Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Megaphone size={18} className="text-purple-400" />
          <span>Broadcast New Announcement</span>
        </h2>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className={styles.formGroup}>
            <label className={styles.label}>Headline Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled platform maintenance tonight"
              className={styles.input}
              maxLength={150}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Broadcast Type</label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'INFO' | 'WARNING' | 'ALERT')
              }
              className={styles.select}
            >
              <option value="INFO">Information (Blue)</option>
              <option value="WARNING">Warning (Amber)</option>
              <option value="ALERT">Critical Alert (Red)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Message Body</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide complete details about the platform notice..."
              className={styles.textarea}
              rows={4}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={
              createAnnouncement.isPending || !title.trim() || !content.trim()
            }
            className="w-full mt-2"
          >
            {createAnnouncement.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span>Publish Broadcast</span>
          </Button>
        </form>
      </div>

      {/* Active Broadcasts List */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Bell size={18} className="text-amber-400" />
          <span>Active Announcements ({announcements.length})</span>
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
            <span className="text-sm">Loading broadcasts...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Megaphone className="h-10 w-10 mx-auto mb-2 text-slate-500" />
            <p className="font-semibold">No active announcements</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a broadcast above to inform all active members.
            </p>
          </div>
        ) : (
          <div className={styles.announcementsList}>
            {announcements.map((a) => (
              <div key={a.id} className={styles.announcementItem}>
                <div className={styles.itemHeader}>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        a.type === 'ALERT'
                          ? styles.badgeAlert
                          : a.type === 'WARNING'
                            ? styles.badgeWarning
                            : styles.badgeInfo
                      }
                    >
                      {a.type || 'INFO'}
                    </span>
                    <h3 className={styles.itemTitle}>{a.title}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteAnnouncement.mutate(a.id)}
                    disabled={deleteAnnouncement.isPending}
                    className={styles.deleteBtn}
                    title="Delete announcement"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <p className={styles.itemContent}>{a.content || a.message}</p>

                <div className={styles.itemFooter}>
                  <span>Published by {a.author?.name || 'Administrator'}</span>
                  <span>
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
