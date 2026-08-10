'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Eye, Trash2 } from 'lucide-react';
import { adminService } from '@/services/admin';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import AuthLoader from '@/components/common/AuthLoader';
import Badge from '@/components/ui/Badge';
import { useRequireAdmin } from '@/hooks/useAuth';
import { formatDate, formatNumber, getInitials } from '@/lib/utils';
import type { Post, Pagination } from '@/types';
import styles from './page.module.css';

export default function AdminPostsPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const limit = 10;

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'posts', page, statusFilter],
    queryFn: () => adminService.getPosts({ page, limit, status: statusFilter || undefined }),
    enabled: !authLoading,
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => adminService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      setDeleteTarget(null);
      showToast('success', 'Post deleted successfully');
    },
    onError: () => {
      showToast('error', 'Failed to delete post');
    },
  });

  const posts: Post[] = data?.posts ?? [];
  const pagination = data?.pagination as Pagination | undefined;

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
          <div className={styles.errorTitle}>Failed to load posts</div>
          <p className={styles.errorMessage}>Something went wrong. Please try again.</p>
          <Button variant="primary" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Posts</h1>
          <p className={styles.subtitle}>Manage all posts on the platform</p>
        </div>
        <div className={styles.filters}>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={styles.statusSelect}
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Visibility</th>
              <th style={{ textAlign: 'right' }}>Views</th>
              <th style={{ textAlign: 'right' }}>Likes</th>
              <th style={{ textAlign: 'right' }}>Comments</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                  No posts found.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <span className={styles.postTitle}>{post.title}</span>
                  </td>
                  <td>
                    <div className={styles.authorCell}>
                      {post.author.image ? (
                        <img src={post.author.image} alt="" className={styles.authorAvatar} />
                      ) : (
                        <div className={styles.authorAvatarPlaceholder}>{getInitials(post.author.name)}</div>
                      )}
                      <span className={styles.authorName}>{post.author.name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge
                      variant={post.status === 'PUBLISHED' ? 'success' : post.status === 'DRAFT' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {post.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={post.visibility === 'PUBLIC' ? 'primary' : 'default'} size="sm">
                      {post.visibility}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                    {formatNumber(post.analytics?.views ?? 0)}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                    {formatNumber(post.analytics?.likes ?? 0)}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                    {formatNumber(post.analytics?.comments ?? 0)}
                  </td>
                  <td>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {formatDate(post.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => router.push(`/posts/${post.slug}`)}
                        title="View post"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => setDeleteTarget(post)}
                        title="Delete post"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className={styles.pageBtn}
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
            <span className={styles.pageInfo}>
              {pagination.total} total
            </span>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className={styles.confirmOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Delete Post</h3>
            <p className={styles.confirmMessage}>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
              This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="danger"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <span className={styles.toastMessage}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
