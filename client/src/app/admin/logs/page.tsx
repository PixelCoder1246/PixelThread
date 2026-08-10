'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import AuthLoader from '@/components/common/AuthLoader';
import Badge from '@/components/ui/Badge';
import { useRequireAdmin } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import type { Pagination } from '@/types';
import styles from './page.module.css';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  details: string;
  ip: string;
  createdAt: string;
}

const actionClassMap: Record<string, string> = {
  CREATE: 'logActionCreate',
  UPDATE: 'logActionUpdate',
  DELETE: 'logActionDelete',
  LOGIN: 'logActionLogin',
};

export default function AdminLogsPage() {
  const { isLoading: authLoading } = useRequireAdmin();

  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'logs', page],
    queryFn: () => adminService.getLogs({ page, limit }),
    enabled: !authLoading,
  });

  const logs: AuditLog[] = (data as { logs?: AuditLog[] })?.logs ?? (Array.isArray(data) ? data as AuditLog[] : []);
  const pagination = (data as { pagination?: Pagination })?.pagination as Pagination | undefined;

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
          <div className={styles.errorTitle}>Failed to load audit logs</div>
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
          <h1 className={styles.title}>Audit Logs</h1>
          <p className={styles.subtitle}>Track all administrative actions</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const actionKey = log.action.toUpperCase();
                const actionClass = Object.keys(actionClassMap).find((k) => actionKey.includes(k))
                  ? actionClassMap[Object.keys(actionClassMap).find((k) => actionKey.includes(k))!]
                  : '';
                return (
                  <tr key={log.id}>
                    <td>
                      <span className={styles.logTimestamp}>{formatDate(log.createdAt, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td>
                      <span className={styles.logUser}>{log.user}</span>
                    </td>
                    <td>
                      <span className={`${styles.logAction} ${actionClass ? styles[actionClass] : ''}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className={styles.logDetails}>{log.details}</span>
                    </td>
                    <td>
                      <span className={styles.logIp}>{log.ip}</span>
                    </td>
                  </tr>
                );
              })
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
    </div>
  );
}
