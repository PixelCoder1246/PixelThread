'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  EyeOff,
  Eye,
  Trash2,
  Loader2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { useAdminComments, useAdminMutations } from '@/features/admin/useAdmin';
import { Avatar } from '@/components/ui';
import styles from './page.module.css';

export default function AdminCommentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useAdminComments({
    search: search.trim() || undefined,
    hidden:
      statusFilter === 'HIDDEN'
        ? 'true'
        : statusFilter === 'ACTIVE'
          ? 'false'
          : undefined,
    limit: 50,
  });

  const { deleteComment, toggleHideComment } = useAdminMutations();

  const comments = data?.items || [];

  return (
    <div className={styles.commentsContainer}>
      {/* Search and Filters */}
      <div className={styles.controlBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussion comments..."
            className={styles.searchInput}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter comments by visibility status"
        >
          <option value="">All Comments</option>
          <option value="ACTIVE">Visible</option>
          <option value="HIDDEN">Hidden / Flagged</option>
        </select>
      </div>

      {/* Comments Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="text-sm">Loading comment threads...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 text-slate-500" />
            <p className="font-semibold">
              No comments found matching your query
            </p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.commentTable}>
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Comment Content</th>
                  <th>Story Context</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((c) => {
                  const isHidden = c.isHidden ?? c.status === 'HIDDEN';
                  return (
                    <tr key={c.id} className={styles.commentRow}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar
                            fallback={
                              c.author?.name || c.author?.username || 'U'
                            }
                            size="sm"
                          />
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-slate-200">
                              {c.author?.name || 'Anonymous'}
                            </span>
                            <span className="text-slate-500">
                              @{c.author?.username || c.author?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className={styles.commentBody}>{c.content}</div>
                      </td>

                      <td>
                        <Link
                          href={`/posts/${c.post?.slug}`}
                          target="_blank"
                          className={styles.postContextLink}
                        >
                          <span>{c.post?.title || 'View Post'}</span>
                          <ExternalLink
                            size={11}
                            className="inline ml-1 opacity-70"
                          />
                        </Link>
                      </td>

                      <td>
                        {isHidden ? (
                          <span className={styles.badgeHidden}>Hidden</span>
                        ) : (
                          <span className={styles.badgeVisible}>Visible</span>
                        )}
                      </td>

                      <td className="text-xs text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td>
                        <div className={styles.actionBtns}>
                          {/* Hide / Approve */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleHideComment.mutate({
                                id: c.id,
                                isHidden,
                              })
                            }
                            className={styles.btnAction}
                            title={
                              isHidden
                                ? 'Approve and make visible'
                                : 'Hide comment from public'
                            }
                          >
                            {isHidden ? (
                              <Eye size={13} />
                            ) : (
                              <EyeOff size={13} />
                            )}
                            <span>{isHidden ? 'Approve' : 'Hide'}</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => deleteComment.mutate(c.id)}
                            className={`${styles.btnAction} ${styles.btnActionDanger}`}
                            title="Permanently remove comment"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
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
    </div>
  );
}
