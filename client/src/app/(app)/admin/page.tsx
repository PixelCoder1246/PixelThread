'use client';

import Link from 'next/link';
import {
  Users,
  FileText,
  Activity,
  AlertTriangle,
  UserCheck,
  UserX,
  FileCheck,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  UserPlus,
  ShieldAlert,
  ArrowRight,
  HardDrive,
  Megaphone,
  History,
  Settings,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAdminDashboard } from '@/features/admin/useAdmin';
import styles from './page.module.css';

export default function AdminOverviewPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="text-sm">
          Loading real-time platform statistics...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-red-950/20 border border-red-500/30 rounded-2xl text-red-200">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold">Failed to load platform dashboard</h3>
        <p className="text-sm text-red-300/80 mt-1">
          {error instanceof Error
            ? error.message
            : 'Unknown error occurred while fetching platform stats.'}
        </p>
      </div>
    );
  }

  const { users, posts, engagement, reports } = data;

  const verificationRate =
    users.total > 0 ? Math.round((users.verified / users.total) * 100) : 100;

  return (
    <div className={styles.overviewContainer}>
      {/* 4 Main KPI Cards */}
      <section
        className={styles.kpiGrid}
        aria-label="Key Performance Indicators"
      >
        {/* User Stats Card */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Users</span>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconUsers}`}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.kpiNumber}>{users.total.toLocaleString()}</div>
          <div className={styles.kpiBreakdown}>
            <div className={styles.kpiStatItem}>
              <UserCheck size={14} className="text-emerald-400" />
              <span>Verified:</span>
              <strong>{users.verified}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <UserX size={14} className="text-amber-400" />
              <span>Unverified:</span>
              <strong>{users.unverified}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <ShieldAlert size={14} className="text-rose-400" />
              <span>Banned:</span>
              <strong>{users.banned}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <UserPlus size={14} className="text-sky-400" />
              <span>Today:</span>
              <strong>+{users.newToday}</strong>
            </div>
          </div>
        </div>

        {/* Post Stats Card */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Stories</span>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconPosts}`}>
              <FileText size={20} />
            </div>
          </div>
          <div className={styles.kpiNumber}>{posts.total.toLocaleString()}</div>
          <div className={styles.kpiBreakdown}>
            <div className={styles.kpiStatItem}>
              <FileCheck size={14} className="text-purple-400" />
              <span>Published:</span>
              <strong>{posts.published}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <span>Drafts:</span>
              <strong>{posts.drafts}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <span>Archived:</span>
              <strong>{posts.archived}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <Sparkles size={14} className="text-indigo-400" />
              <span>Today:</span>
              <strong>+{posts.today}</strong>
            </div>
          </div>
        </div>

        {/* Engagement Stats Card */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Platform Engagement</span>
            <div
              className={`${styles.kpiIconWrap} ${styles.kpiIconEngagement}`}
            >
              <Activity size={20} />
            </div>
          </div>
          <div className={styles.kpiNumber}>
            {engagement.views.toLocaleString()}
          </div>
          <div className={styles.kpiBreakdown}>
            <div className={styles.kpiStatItem}>
              <Eye size={14} className="text-amber-400" />
              <span>Total Views</span>
            </div>
            <div className={styles.kpiStatItem}>
              <Heart size={14} className="text-rose-400" />
              <span>Likes:</span>
              <strong>{engagement.likes}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <MessageSquare size={14} className="text-sky-400" />
              <span>Comments:</span>
              <strong>{engagement.comments}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <Bookmark size={14} className="text-emerald-400" />
              <span>Bookmarks:</span>
              <strong>{engagement.bookmarks}</strong>
            </div>
          </div>
        </div>

        {/* Reports / Moderation Card */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Moderation Queue</span>
            <div className={`${styles.kpiIconWrap} ${styles.kpiIconReports}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className={styles.kpiNumber}>{reports.pending}</div>
          <div className={styles.kpiBreakdown}>
            <div className={styles.kpiStatItem}>
              <span className="text-rose-400 font-semibold">
                Pending Review:
              </span>
              <strong>{reports.pending}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <span>Under Review:</span>
              <strong>{reports.underReview}</strong>
            </div>
            <div className={styles.kpiStatItem}>
              <span>Resolved:</span>
              <strong>{reports.resolved}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Portals */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={18} className="text-purple-400" />
            <span>Moderation Shortcuts</span>
          </h2>
        </div>

        <div className={styles.quickActionsGrid}>
          <Link href="/admin/users" className={styles.actionTile}>
            <div className={styles.actionTileIcon}>
              <Users size={20} />
            </div>
            <div className={styles.actionTileContent}>
              <h3 className={styles.actionTileTitle}>Manage Users</h3>
              <p className={styles.actionTileDesc}>
                Change roles, verify emails, or enforce bans
              </p>
            </div>
          </Link>

          <Link href="/admin/posts" className={styles.actionTile}>
            <div className={styles.actionTileIcon}>
              <FileText size={20} />
            </div>
            <div className={styles.actionTileContent}>
              <h3 className={styles.actionTileTitle}>Story Moderation</h3>
              <p className={styles.actionTileDesc}>
                Pin, feature, archive, or remove public articles
              </p>
            </div>
          </Link>

          <Link href="/admin/comments" className={styles.actionTile}>
            <div className={styles.actionTileIcon}>
              <MessageSquare size={20} />
            </div>
            <div className={styles.actionTileContent}>
              <h3 className={styles.actionTileTitle}>Comment Moderation</h3>
              <p className={styles.actionTileDesc}>
                Review flagged discussions and filter toxicity
              </p>
            </div>
          </Link>

          <Link href="/admin/media" className={styles.actionTile}>
            <div className={styles.actionTileIcon}>
              <HardDrive size={20} />
            </div>
            <div className={styles.actionTileContent}>
              <h3 className={styles.actionTileTitle}>Storage & Media</h3>
              <p className={styles.actionTileDesc}>
                Inspect uploads and purge orphaned images
              </p>
            </div>
          </Link>

          <Link href="/admin/announcements" className={styles.actionTile}>
            <div className={styles.actionTileIcon}>
              <Megaphone size={20} />
            </div>
            <div className={styles.actionTileContent}>
              <h3 className={styles.actionTileTitle}>Announcements</h3>
              <p className={styles.actionTileDesc}>
                Publish system-wide notifications & alerts
              </p>
            </div>
          </Link>

          <Link href="/admin/audit-logs" className={styles.actionTile}>
            <div className={styles.actionTileIcon}>
              <History size={20} />
            </div>
            <div className={styles.actionTileContent}>
              <h3 className={styles.actionTileTitle}>Audit Logs</h3>
              <p className={styles.actionTileDesc}>
                Inspect security events and staff action history
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Health & Performance Status Grid */}
      <section className={styles.healthGrid}>
        <div className={styles.healthCard}>
          <h3 className={styles.healthCardTitle}>
            <Activity size={18} className="text-emerald-400" />
            <span>Platform Health & Security</span>
          </h3>
          <div className={styles.healthList}>
            <div className={styles.healthItem}>
              <span>API Gateway Status</span>
              <span className={styles.badgeSuccess}>Operational</span>
            </div>
            <div className={styles.healthItem}>
              <span>Email Verification Ratio</span>
              <span className={styles.healthValue}>{verificationRate}%</span>
            </div>
            <div className={styles.healthItem}>
              <span>Database Connection</span>
              <span className={styles.badgeSuccess}>Connected (Prisma)</span>
            </div>
            <div className={styles.healthItem}>
              <span>Storage Provider</span>
              <span className={styles.badgeSuccess}>Local / S3 Ready</span>
            </div>
          </div>
        </div>

        <div className={styles.healthCard}>
          <h3 className={styles.healthCardTitle}>
            <Settings size={18} className="text-purple-400" />
            <span>Quick Configuration</span>
          </h3>
          <div className={styles.healthList}>
            <div className={styles.healthItem}>
              <span>Registration Gate</span>
              <span className={styles.badgeSuccess}>Open</span>
            </div>
            <div className={styles.healthItem}>
              <span>AI Writing Assistant</span>
              <span className={styles.badgeSuccess}>16 Endpoints Active</span>
            </div>
            <div className={styles.healthItem}>
              <span>Content Auto-Publish</span>
              <span className={styles.badgeSuccess}>Enabled</span>
            </div>
            <div className={styles.healthItem}>
              <span>Platform Settings</span>
              <Link
                href="/admin/settings"
                className="text-purple-400 hover:text-purple-300 text-xs font-semibold inline-flex items-center gap-1"
              >
                <span>Configure</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
