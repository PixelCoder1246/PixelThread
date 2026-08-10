'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Flag } from 'lucide-react';
import { adminService } from '@/services/admin';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import AuthLoader from '@/components/common/AuthLoader';
import Badge from '@/components/ui/Badge';
import { useRequireAdmin } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import type { Pagination } from '@/types';
import styles from './page.module.css';

interface Report {
  id: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  contentType: string;
  contentTitle: string;
  reportedBy: { name: string; email: string };
  createdAt: string;
}

export default function AdminReportsPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const limit = 10;

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'reports', page],
    queryFn: () => adminService.getReports({ page, limit }),
    enabled: !authLoading,
  });

  const updateMutation = useMutation({
    mutationFn: ({ reportId, action }: { reportId: string; action: 'resolve' | 'dismiss' }) =>
      action === 'resolve'
        ? adminService.resolveReport(reportId)
        : adminService.rejectReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      showToast('success', 'Report updated successfully');
    },
    onError: () => {
      showToast('error', 'Failed to update report');
    },
  });

  const reports: Report[] = (data as { reports?: Report[] })?.reports ?? (Array.isArray(data) ? data as Report[] : []);
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
          <div className={styles.errorTitle}>Failed to load reports</div>
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
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.subtitle}>Review and handle reported content</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Reason</th>
              <th>Reported Content</th>
              <th>Type</th>
              <th>Reported By</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                  No reports found.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className={styles.reportReason}>{report.reason}</div>
                    {report.details && <div className={styles.reportDetails}>{report.details}</div>}
                  </td>
                  <td>
                    <span className={styles.reportedContent}>{report.contentTitle}</span>
                  </td>
                  <td>
                    <Badge variant="default" size="sm">{report.contentType}</Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                      {report.reportedBy.name}
                    </span>
                  </td>
                  <td>
                    <Badge
                      variant={report.status === 'PENDING' ? 'warning' : report.status === 'RESOLVED' ? 'success' : 'default'}
                      size="sm"
                    >
                      <span className={styles.statusBadge}>
                        {report.status === 'PENDING' && <Flag size={10} />}
                        {report.status}
                      </span>
                    </Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {formatDate(report.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {report.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnResolve}`}
                            onClick={() => updateMutation.mutate({ reportId: report.id, action: 'resolve' })}
                            disabled={updateMutation.isPending}
                          >
                            <CheckCircle size={14} />
                            Resolve
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDismiss}`}
                            onClick={() => updateMutation.mutate({ reportId: report.id, action: 'dismiss' })}
                            disabled={updateMutation.isPending}
                          >
                            <XCircle size={14} />
                            Dismiss
                          </button>
                        </>
                      )}
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

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <span className={styles.toastMessage}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
