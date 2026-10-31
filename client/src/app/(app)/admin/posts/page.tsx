'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Pin,
  Star,
  Archive,
  Trash2,
  RotateCcw,
  ExternalLink,
  Loader2,
  FileText,
  Heart,
  MessageSquare,
  Bookmark,
  X,
} from 'lucide-react';
import { useAdminPosts, useAdminMutations } from '@/features/admin/useAdmin';
import { Avatar, Button } from '@/components/ui';
import type { AdminPostItem } from '@/services/admin.service';
import styles from './page.module.css';

export default function AdminPostsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPostToDelete, setSelectedPostToDelete] =
    useState<AdminPostItem | null>(null);

  const { data, isLoading } = useAdminPosts({
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    limit: 50,
  });

  const { deletePost, toggleFeaturePost, togglePinPost, toggleArchivePost } =
    useAdminMutations();

  const posts = data?.items || [];

  const handleConfirmDelete = async () => {
    if (!selectedPostToDelete) return;
    await deletePost.mutateAsync(selectedPostToDelete.id);
    setSelectedPostToDelete(null);
  };

  return (
    <div className={styles.postsContainer}>
      {/* Search and Filters Bar */}
      <div className={styles.controlBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories by title or content..."
            className={styles.searchInput}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter posts by publication status"
        >
          <option value="">All Publication Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Drafts</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="text-sm">Fetching story inventory...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <FileText className="h-10 w-10 mx-auto mb-2 text-slate-500" />
            <p className="font-semibold">No stories match your criteria</p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.postTable}>
              <thead>
                <tr>
                  <th>Story Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Engagement</th>
                  <th>Created</th>
                  <th>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const isFeatured = post.isFeatured ?? post.featured ?? false;
                  const isPinned = post.isPinned ?? post.pinned ?? false;
                  const likes = post.likesCount ?? post._count?.likes ?? 0;
                  const comments =
                    post.commentsCount ?? post._count?.comments ?? 0;
                  const bookmarks =
                    post.bookmarksCount ?? post._count?.bookmarks ?? 0;

                  return (
                    <tr key={post.id} className={styles.postRow}>
                      <td>
                        <div className={styles.postTitleCol}>
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className={styles.postTitleLink}
                            title={post.title}
                          >
                            <span>{post.title}</span>
                            <ExternalLink
                              size={12}
                              className="inline ml-1 opacity-60"
                            />
                          </Link>
                          <div className={styles.badgesRow}>
                            {isFeatured && (
                              <span className={styles.badgeFeatured}>
                                <Star size={10} fill="currentColor" />
                                <span>Featured</span>
                              </span>
                            )}
                            {isPinned && (
                              <span className={styles.badgePinned}>
                                <Pin size={10} fill="currentColor" />
                                <span>Pinned</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar
                            fallback={
                              post.author?.name || post.author?.username || 'A'
                            }
                            size="sm"
                          />
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-slate-200">
                              {post.author?.name || 'Anonymous'}
                            </span>
                            <span className="text-slate-500">
                              @{post.author?.username || post.author?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {post.status === 'PUBLISHED' ? (
                          <span className={styles.badgePublished}>
                            Published
                          </span>
                        ) : post.status === 'ARCHIVED' ? (
                          <span className={styles.badgeArchived}>Archived</span>
                        ) : (
                          <span className={styles.badgeDraft}>Draft</span>
                        )}
                      </td>

                      <td>
                        <div className={styles.engagementCol}>
                          <span className={styles.engagementItem} title="Likes">
                            <Heart size={12} className="text-rose-400" />
                            <span>{likes}</span>
                          </span>
                          <span
                            className={styles.engagementItem}
                            title="Comments"
                          >
                            <MessageSquare size={12} className="text-sky-400" />
                            <span>{comments}</span>
                          </span>
                          <span
                            className={styles.engagementItem}
                            title="Bookmarks"
                          >
                            <Bookmark size={12} className="text-emerald-400" />
                            <span>{bookmarks}</span>
                          </span>
                        </div>
                      </td>

                      <td className="text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </td>

                      <td>
                        <div className={styles.actionBtns}>
                          {/* Pin / Unpin */}
                          <button
                            type="button"
                            onClick={() =>
                              togglePinPost.mutate({
                                id: post.id,
                                isPinned,
                              })
                            }
                            className={`${styles.btnTool} ${isPinned ? styles.btnToolActive : ''}`}
                            title={
                              isPinned
                                ? 'Unpin from feed'
                                : 'Pin to top of feed'
                            }
                          >
                            <Pin
                              size={13}
                              fill={isPinned ? 'currentColor' : 'none'}
                            />
                          </button>

                          {/* Feature / Unfeature */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleFeaturePost.mutate({
                                id: post.id,
                                isFeatured,
                              })
                            }
                            className={`${styles.btnTool} ${isFeatured ? styles.btnToolActive : ''}`}
                            title={
                              isFeatured
                                ? 'Remove featured badge'
                                : 'Highlight as Featured'
                            }
                          >
                            <Star
                              size={13}
                              fill={isFeatured ? 'currentColor' : 'none'}
                            />
                          </button>

                          {/* Archive / Restore */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleArchivePost.mutate({
                                id: post.id,
                                isArchived: post.status === 'ARCHIVED',
                              })
                            }
                            className={styles.btnTool}
                            title={
                              post.status === 'ARCHIVED'
                                ? 'Restore story'
                                : 'Archive story'
                            }
                          >
                            {post.status === 'ARCHIVED' ? (
                              <RotateCcw size={13} />
                            ) : (
                              <Archive size={13} />
                            )}
                          </button>

                          {/* Delete Post */}
                          <button
                            type="button"
                            onClick={() => setSelectedPostToDelete(post)}
                            className={`${styles.btnTool} ${styles.btnToolDanger}`}
                            title="Permanently remove story"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedPostToDelete && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedPostToDelete(null)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-red-400">
                Delete Story Permanently?
              </h3>
              <button
                type="button"
                className="text-slate-500 hover:text-white"
                onClick={() => setSelectedPostToDelete(null)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to delete &ldquo;
              <strong>{selectedPostToDelete.title}</strong>&rdquo;? This action
              cannot be undone and will remove all associated comments and
              analytics.
            </p>

            <div className="flex items-center justify-end gap-3 mt-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedPostToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deletePost.isPending}
              >
                {deletePost.isPending ? 'Deleting...' : 'Delete Story'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
