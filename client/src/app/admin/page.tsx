'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  MessageCircle,
  Eye,
  ArrowRight,
  Shield,
  Flag,
  Settings,
} from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import { adminService } from '@/services/admin';
import Button from '@/components/ui/Button';
import AuthLoader from '@/components/common/AuthLoader';
import Badge from '@/components/ui/Badge';
import { useRequireAdmin } from '@/hooks/useAuth';
import { formatNumber, formatRelativeDate, getInitials } from '@/lib/utils';
import styles from './page.module.css';

export default function AdminPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const router = useRouter();

  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: analyticsService.getAdminAnalytics,
    enabled: !authLoading,
  });

  const { data: recentUsers } = useQuery({
    queryKey: ['admin', 'users', 'recent'],
    queryFn: () => adminService.getUsers({ limit: 5, sort: 'newest' }),
    enabled: !authLoading,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['admin', 'posts', 'recent'],
    queryFn: () => adminService.getPosts({ limit: 5 }),
    enabled: !authLoading,
  });

  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <AuthLoader compact message="Checking admin access" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <div className={styles.errorTitle}>
            Failed to load admin dashboard
          </div>
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

  const stats = [
    {
      key: 'users',
      icon: Users,
      label: 'Total Users',
      value: analytics?.totalUsers ?? 0,
      iconClass: 'statIconUsers',
    },
    {
      key: 'posts',
      icon: FileText,
      label: 'Total Posts',
      value: analytics?.totalPosts ?? 0,
      iconClass: 'statIconPosts',
    },
    {
      key: 'published',
      icon: CheckCircle,
      label: 'Published',
      value: analytics?.publishedPosts ?? 0,
      iconClass: 'statIconPublished',
    },
    {
      key: 'drafts',
      icon: Clock,
      label: 'Drafts',
      value: analytics?.draftPosts ?? 0,
      iconClass: 'statIconDrafts',
    },
    {
      key: 'comments',
      icon: MessageCircle,
      label: 'Comments',
      value: analytics?.totalComments ?? 0,
      iconClass: 'statIconComments',
    },
    {
      key: 'views',
      icon: Eye,
      label: 'Total Views',
      value: analytics?.totalViews ?? 0,
      iconClass: 'statIconViews',
    },
  ];

  const quickActions = [
    {
      key: 'users',
      icon: Users,
      label: 'Manage Users',
      desc: 'View, edit, and manage user accounts',
      route: '/admin/users',
      iconClass: 'quickActionIconUsers',
    },
    {
      key: 'posts',
      icon: FileText,
      label: 'Manage Posts',
      desc: 'Review and moderate all posts',
      route: '/admin/posts',
      iconClass: 'quickActionIconPosts',
    },
    {
      key: 'reports',
      icon: Flag,
      label: 'View Reports',
      desc: 'Handle reported content',
      route: '/admin/reports',
      iconClass: 'quickActionIconReports',
    },
    {
      key: 'settings',
      icon: Settings,
      label: 'Platform Settings',
      desc: 'Configure site-wide preferences',
      route: '/admin/settings',
      iconClass: 'quickActionIconSettings',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Manage your platform at a glance</p>
        </div>
        <Badge variant="accent" size="md">
          <Shield size={12} />
          Admin
        </Badge>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className={styles.statCard}>
              <div className={styles.statHeader}>
                <div
                  className={`${styles.statIconWrapper} ${styles[stat.iconClass]}`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className={styles.statValue}>{formatNumber(stat.value)}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
        </div>
        <div className={styles.quickActions}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                type="button"
                className={styles.quickActionCard}
                onClick={() => router.push(action.route)}
              >
                <div
                  className={`${styles.quickActionIcon} ${styles[action.iconClass]}`}
                >
                  <Icon size={22} />
                </div>
                <div className={styles.quickActionInfo}>
                  <div className={styles.quickActionLabel}>{action.label}</div>
                  <div className={styles.quickActionDesc}>{action.desc}</div>
                </div>
                <ArrowRight size={18} className={styles.quickActionArrow} />
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Users</h2>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => router.push('/admin/users')}
          >
            View all
          </button>
        </div>
        {recentUsers?.users?.length ? (
          recentUsers.users
            .slice(0, 5)
            .map(
              (user: {
                id: string;
                name: string;
                email: string;
                role: string;
                image: string | null;
                createdAt: string;
              }) => (
                <div key={user.id} className={styles.userRow}>
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className={styles.userAvatar}
                    />
                  ) : (
                    <div className={styles.userAvatar}>
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                  <div className={styles.userRole}>
                    <Badge
                      variant={user.role === 'ADMIN' ? 'accent' : 'default'}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <span className={styles.postDate}>
                    {formatRelativeDate(user.createdAt)}
                  </span>
                </div>
              )
            )
        ) : (
          <p
            style={{
              color: 'var(--text-tertiary)',
              fontSize: 'var(--fs-sm)',
              padding: 'var(--space-4)',
            }}
          >
            No users found.
          </p>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Posts</h2>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => router.push('/admin/posts')}
          >
            View all
          </button>
        </div>
        {recentPosts?.posts?.length ? (
          recentPosts.posts
            .slice(0, 5)
            .map(
              (post: {
                id: string;
                title: string;
                status: string;
                views?: number;
                createdAt: string;
              }) => (
                <div key={post.id} className={styles.postRow}>
                  <div className={styles.postTitle}>{post.title}</div>
                  <div className={styles.postStat}>
                    <Badge
                      variant={
                        post.status === 'PUBLISHED'
                          ? 'success'
                          : post.status === 'DRAFT'
                            ? 'warning'
                            : 'default'
                      }
                      size="sm"
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <div className={styles.postDate}>
                    {formatRelativeDate(post.createdAt)}
                  </div>
                </div>
              )
            )
        ) : (
          <p
            style={{
              color: 'var(--text-tertiary)',
              fontSize: 'var(--fs-sm)',
              padding: 'var(--space-4)',
            }}
          >
            No posts found.
          </p>
        )}
      </div>
    </div>
  );
}
