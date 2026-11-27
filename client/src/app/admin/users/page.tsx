'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, Search } from 'lucide-react';
import { adminService } from '@/services/admin';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import AuthLoader from '@/components/common/AuthLoader';
import Badge from '@/components/ui/Badge';
import { useRequireAdmin } from '@/hooks/useAuth';
import { formatDate, getInitials } from '@/lib/utils';
import type { User, Pagination } from '@/types';
import styles from './page.module.css';

export default function AdminUsersPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const limit = 10;

  const showToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', page, roleFilter, search],
    queryFn: () =>
      adminService.getUsers({ page, limit, role: roleFilter || undefined }),
    enabled: !authLoading,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: 'USER' | 'ADMIN';
    }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('success', 'User role updated');
    },
    onError: () => {
      showToast('error', 'Failed to update user role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminService.banUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteTarget(null);
      showToast('success', 'User banned successfully');
    },
    onError: () => {
      showToast('error', 'Failed to ban user');
    },
  });

  const users: User[] = data?.users ?? [];
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
          <div className={styles.errorTitle}>Failed to load users</div>
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
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Manage user accounts and roles</p>
        </div>
        <div className={styles.filters}>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-quaternary)',
              }}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={styles.searchInput}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className={styles.roleSelect}
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-8)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className={styles.userAvatar}
                        />
                      ) : (
                        <div className={styles.userAvatarPlaceholder}>
                          {getInitials(user.name)}
                        </div>
                      )}
                      <span className={styles.userName}>{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.userEmail}>{user.email}</span>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          userId: user.id,
                          role: e.target.value as 'USER' | 'ADMIN',
                        })
                      }
                      className={styles.roleSelectCell}
                      disabled={updateRoleMutation.isPending}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    <Badge
                      variant={user.isEmailVerified ? 'success' : 'warning'}
                      size="sm"
                    >
                      {user.isEmailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 'var(--fs-xs)',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div
                      className={styles.actionButtons}
                      style={{ justifyContent: 'flex-end' }}
                    >
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => setDeleteTarget(user)}
                        title="Ban user"
                      >
                        <Ban size={14} />
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
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              className={styles.pageBtn}
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
            <span className={styles.pageInfo}>{pagination.total} total</span>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div
          className={styles.confirmOverlay}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className={styles.confirmDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>Ban User</h3>
            <p className={styles.confirmMessage}>
              Are you sure you want to ban <strong>{deleteTarget.name}</strong>{' '}
              ({deleteTarget.email})?
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
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
        <div
          className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}
        >
          <span className={styles.toastMessage}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
