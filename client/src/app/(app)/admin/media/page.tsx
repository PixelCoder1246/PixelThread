'use client';

import { useState } from 'react';
import {
  HardDrive,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  useAdminMedia,
  useAdminOrphanedMedia,
  useAdminMutations,
} from '@/features/admin/useAdmin';
import { Button, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import type { AdminMediaItem } from '@/services/admin.service';
import styles from './page.module.css';

function formatBytes(bytes?: number): string {
  const b = bytes ?? 0;
  if (b <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<AdminMediaItem | null>(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);

  const { data: mediaData, isLoading } = useAdminMedia({ limit: 50 });
  const { data: orphanedData, isLoading: isOrphanedLoading } =
    useAdminOrphanedMedia();

  const { deleteMedia, cleanOrphanedMedia } = useAdminMutations();

  const mediaItems = mediaData?.items || [];
  const orphanedCount = orphanedData?.length || 0;

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({
      title: 'URL copied',
      message: 'Direct media link copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    try {
      await deleteMedia.mutateAsync(fileToDelete.id);
      setFileToDelete(null);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleCleanupConfirm = async () => {
    try {
      await cleanOrphanedMedia.mutateAsync(50);
      setShowCleanupModal(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className={styles.mediaContainer}>
      {/* Orphaned Storage Banner */}
      <div className={styles.orphanedCard}>
        <div className={styles.orphanedInfo}>
          <div className={styles.orphanedIconWrap}>
            <HardDrive size={24} />
          </div>
          <div>
            <h3 className={styles.orphanedTitle}>Storage Optimization</h3>
            <p className={styles.orphanedDesc}>
              {isOrphanedLoading
                ? 'Scanning storage for unreferenced media...'
                : orphanedCount > 0
                  ? `Detected ${orphanedCount} unreferenced media files taking up storage space.`
                  : 'Storage is clean! All uploaded files are linked to active stories or avatars.'}
            </p>
          </div>
        </div>

        {orphanedCount > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowCleanupModal(true)}
            disabled={cleanOrphanedMedia.isPending}
            className="whitespace-nowrap"
          >
            {cleanOrphanedMedia.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>Clean Up {orphanedCount} Files</span>
          </Button>
        )}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="text-sm">Fetching media catalog...</span>
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-slate-900/30 rounded-2xl border border-white/5">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 text-slate-500" />
          <p className="font-semibold">No media files currently in storage</p>
        </div>
      ) : (
        <div className={styles.mediaGrid}>
          {mediaItems.map((item) => {
            const isDeletingThis =
              deleteMedia.isPending && fileToDelete?.id === item.id;
            return (
              <div key={item.id} className={styles.mediaCard}>
                <div className={styles.mediaPreview}>
                  {item.publicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.publicUrl}
                      alt={item.fileName}
                      className={styles.mediaImage}
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-slate-600" />
                  )}
                </div>

                <div className={styles.mediaDetails}>
                  <h4 className={styles.mediaName} title={item.fileName}>
                    {item.fileName}
                  </h4>

                  <div className={styles.mediaMeta}>
                    <span>{formatBytes(item.size ?? item.fileSize)}</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className={styles.mediaActions}>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.publicUrl, item.id)}
                      className={styles.mediaActionBtn}
                      title="Copy direct image URL"
                    >
                      {copiedId === item.id ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedId === item.id ? 'Copied' : 'Link'}</span>
                    </button>

                    <a
                      href={item.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.mediaActionBtn}
                      title="Open image in new tab"
                    >
                      <ExternalLink size={12} />
                      <span>View</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setFileToDelete(item)}
                      disabled={isDeletingThis || cleanOrphanedMedia.isPending}
                      className={`${styles.mediaActionBtn} ${styles.mediaActionBtnDanger}`}
                      title="Delete file permanently"
                    >
                      {isDeletingThis ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Single File Modal */}
      <Modal
        isOpen={!!fileToDelete}
        onClose={() => {
          if (!deleteMedia.isPending) setFileToDelete(null);
        }}
        title="Delete Media File"
        size="sm"
      >
        {fileToDelete && (
          <div className="flex flex-col gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-white/10">
              {fileToDelete.publicUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fileToDelete.publicUrl}
                  alt={fileToDelete.fileName}
                  className="w-14 h-14 object-cover rounded-lg border border-white/10 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500">
                  <ImageIcon size={20} />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-semibold text-white truncate text-xs">
                  {fileToDelete.fileName}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Size:{' '}
                  {formatBytes(fileToDelete.size ?? fileToDelete.fileSize)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <AlertTriangle
                size={16}
                className="flex-shrink-0 mt-0.5 text-red-400"
              />
              <span>
                This will permanently delete this file from storage and
                database. Any post or user using this image will display a
                broken link.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFileToDelete(null)}
                disabled={deleteMedia.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={deleteMedia.isPending}
              >
                {deleteMedia.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>Delete Permanently</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Clean Up Orphaned Modal */}
      <Modal
        isOpen={showCleanupModal}
        onClose={() => {
          if (!cleanOrphanedMedia.isPending) setShowCleanupModal(false);
        }}
        title="Storage Cleanup"
        size="sm"
      >
        <div className="flex flex-col gap-4 text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
            <Sparkles
              size={16}
              className="flex-shrink-0 mt-0.5 text-amber-400"
            />
            <span>
              You are about to remove{' '}
              <strong>{orphanedCount} unreferenced media files</strong> from
              disk storage.
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            These files have been identified as unlinked to active published
            stories or avatars. This action permanently deletes their storage
            assets to free up server disk space.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCleanupModal(false)}
              disabled={cleanOrphanedMedia.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleCleanupConfirm}
              disabled={cleanOrphanedMedia.isPending}
            >
              {cleanOrphanedMedia.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              <span>Clean Up {orphanedCount} Files</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
