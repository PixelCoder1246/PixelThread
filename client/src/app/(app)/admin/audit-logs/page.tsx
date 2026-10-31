'use client';

import { useState } from 'react';
import { Search, History, ShieldCheck, Loader2, Calendar } from 'lucide-react';
import { useAdminAuditLogs } from '@/features/admin/useAdmin';
import styles from './page.module.css';

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminAuditLogs({
    search: search.trim() || undefined,
    limit: 50,
  });

  const logs = data?.items || [];

  return (
    <div className={styles.auditContainer}>
      {/* Search Header */}
      <div className={styles.controlBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, target, or admin email..."
            className={styles.searchInput}
          />
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Immutable Platform Audit Trail</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="text-sm">Fetching audit trail records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <History className="h-10 w-10 mx-auto mb-2 text-slate-500" />
            <p className="font-semibold">No audit logs found</p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.auditTable}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Target ID</th>
                  <th>Staff Member</th>
                  <th>Context Data</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={styles.actionBadge}>{log.action}</span>
                    </td>

                    <td>{log.targetType || 'SYSTEM'}</td>

                    <td>
                      <span className="font-mono text-xs text-slate-400">
                        {log.targetId
                          ? `${log.targetId.slice(0, 12)}...`
                          : 'N/A'}
                      </span>
                    </td>

                    <td>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-slate-200">
                          {log.admin?.name || 'Staff User'}
                        </span>
                        <span className="text-slate-500">
                          {log.admin?.email || log.adminId}
                        </span>
                      </div>
                    </td>

                    <td>
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <code
                          className={styles.metadataCode}
                          title={JSON.stringify(log.metadata, null, 2)}
                        >
                          {JSON.stringify(log.metadata)}
                        </code>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>

                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={12} className="opacity-60" />
                        <span>
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
