'use client';

import { useState } from 'react';
import {
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
  Loader2,
  CheckCircle,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { useAdminUsers, useAdminMutations } from '@/features/admin/useAdmin';
import { Avatar, Button } from '@/components/ui';
import type { AdminUserItem } from '@/services/admin.service';
import styles from './page.module.css';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [activeModal, setActiveModal] = useState<'ROLE' | 'BAN' | null>(null);
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'SUPER_ADMIN'>(
    'USER'
  );
  const [banReason, setBanReason] = useState('');

  const { data, isLoading } = useAdminUsers({
    search: search.trim() || undefined,
    role: roleFilter || undefined,
    active: statusFilter === 'active' ? 'true' : undefined,
    banned: statusFilter === 'banned' ? 'true' : undefined,
    verified:
      statusFilter === 'verified'
        ? 'true'
        : statusFilter === 'unverified'
          ? 'false'
          : undefined,
    limit: 50,
  });

  const { updateUserRole, banUser, unbanUser, verifyUser } =
    useAdminMutations();

  const handleOpenRoleModal = (user: AdminUserItem) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setActiveModal('ROLE');
  };

  const handleOpenBanModal = (user: AdminUserItem) => {
    setSelectedUser(user);
    setBanReason('');
    setActiveModal('BAN');
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser) return;
    await updateUserRole.mutateAsync({
      id: selectedUser.id,
      role: newRole,
    });
    setActiveModal(null);
  };

  const handleConfirmBan = async () => {
    if (!selectedUser) return;
    const reason =
      banReason.trim() ||
      'Violation of community guidelines and platform terms';
    await banUser.mutateAsync({
      id: selectedUser.id,
      reason,
    });
    setActiveModal(null);
  };

  const users = data?.items || [];

  return (
    <div className={styles.usersContainer}>
      {/* Control Bar: Search & Filters */}
      <div className={styles.controlBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by role"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by account status"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="banned">Suspended / Banned</option>
            <option value="verified">Verified Email</option>
            <option value="unverified">Unverified Email</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="text-sm">Retrieving users directory...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <UserX className="h-10 w-10 mx-auto mb-2 text-slate-500" />
            <p className="font-semibold">
              No users found matching your filters
            </p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Stories</th>
                  <th>Comments</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={styles.userRow}>
                    <td>
                      <div className={styles.userCol}>
                        <Avatar
                          fallback={u.name || u.username || 'U'}
                          size="sm"
                        />
                        <div className={styles.userMeta}>
                          <span className={styles.userName}>
                            {u.name || 'Anonymous User'}
                          </span>
                          <span className={styles.userHandle}>
                            @{u.username || u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {u.role === 'SUPER_ADMIN' ? (
                        <span className={styles.roleSuperAdmin}>
                          <ShieldAlert size={12} />
                          <span>Super Admin</span>
                        </span>
                      ) : u.role === 'ADMIN' ? (
                        <span className={styles.roleAdmin}>
                          <Shield size={12} />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className={styles.roleUser}>User</span>
                      )}
                    </td>

                    <td>
                      {!u.isActive ? (
                        <span
                          className={styles.badgeBanned}
                          title={u.banReason || 'Account suspended'}
                        >
                          <Ban size={12} />
                          <span>Banned</span>
                        </span>
                      ) : u.isEmailVerified ? (
                        <span className={styles.badgeActive}>
                          <CheckCircle size={12} />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs font-semibold">
                          Unverified
                        </span>
                      )}
                    </td>

                    <td>{u._count?.posts ?? 0}</td>
                    <td>{u._count?.comments ?? 0}</td>
                    <td>
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          type="button"
                          onClick={() => handleOpenRoleModal(u)}
                          className={styles.btnAction}
                          title="Change user access role"
                        >
                          <Shield size={13} />
                          <span>Role</span>
                        </button>

                        {!u.isEmailVerified && (
                          <button
                            type="button"
                            onClick={() => verifyUser.mutate(u.id)}
                            disabled={verifyUser.isPending}
                            className={`${styles.btnAction} ${styles.btnActionSuccess}`}
                            title="Manually verify email"
                          >
                            <UserCheck size={13} />
                            <span>Verify</span>
                          </button>
                        )}

                        {u.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleOpenBanModal(u)}
                            className={`${styles.btnAction} ${styles.btnActionDanger}`}
                            title="Suspend user account"
                          >
                            <Ban size={13} />
                            <span>Ban</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => unbanUser.mutate(u.id)}
                            disabled={unbanUser.isPending}
                            className={`${styles.btnAction} ${styles.btnActionSuccess}`}
                            title="Restore user account"
                          >
                            <RotateCcw size={13} />
                            <span>Unban</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {activeModal === 'ROLE' && selectedUser && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setActiveModal(null)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Change Member Role</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setActiveModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className="text-sm text-slate-300">
                Update authorization role for{' '}
                <strong>{selectedUser.name || selectedUser.email}</strong>:
              </p>

              <div>
                <label className={styles.modalLabel}>Select Role</label>
                <select
                  value={newRole === 'SUPER_ADMIN' ? 'ADMIN' : newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as 'USER' | 'ADMIN')
                  }
                  className={styles.filterSelect}
                  style={{ width: '100%', marginTop: '0.35rem' }}
                >
                  <option value="USER">User (Standard Access)</option>
                  <option value="ADMIN">Admin (Moderation & Operations)</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmRoleChange}
                disabled={updateUserRole.isPending}
              >
                {updateUserRole.isPending ? 'Updating...' : 'Save Role'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Reason Modal */}
      {activeModal === 'BAN' && selectedUser && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setActiveModal(null)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Suspend User Account</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setActiveModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className="text-sm text-red-300/90">
                You are about to suspend{' '}
                <strong>{selectedUser.name || selectedUser.email}</strong>. They
                will be prevented from signing in or posting content.
              </p>

              <div>
                <label className={styles.modalLabel}>
                  Ban Reason (Optional)
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Terms of service violation, spamming, harassment..."
                  className={styles.modalTextarea}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmBan}
                disabled={banUser.isPending}
              >
                {banUser.isPending ? 'Suspending...' : 'Confirm Suspension'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
