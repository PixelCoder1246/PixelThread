'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '@/services/analytics';
import { notificationsService } from '@/services/notifications';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatNumber, formatRelativeDate } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useAuth';
import AuthLoader from '@/components/common/AuthLoader';
import styles from './page.module.css';

const CHART_AXIS_STYLE = { fontSize: 12, fill: 'var(--text-tertiary)' };
const CHART_GRID_STYLE = {
  stroke: 'var(--border-primary)',
  strokeDasharray: '4 4',
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; color?: string; name?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-3) var(--space-4)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-tertiary)',
          marginBottom: 'var(--space-1)',
        }}
      >
        {label}
      </p>
      {payload.map((entry, i) => (
        <p
          key={i}
          style={{
            fontSize: 'var(--fs-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useRequireAuth();
  const router = useRouter();

  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getMyAnalytics,
    enabled: isAuthenticated,
  });

  const { data: topPosts } = useQuery({
    queryKey: ['topPosts'],
    queryFn: () => analyticsService.getTopPosts({ limit: 5 }),
    enabled: isAuthenticated,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => notificationsService.getAll({ limit: 10 }),
    enabled: isAuthenticated,
  });

  const statsCards = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        key: 'views',
        icon: Eye,
        label: 'Total Views',
        value: analytics.totalViews,
        trend: analytics.averageViewsPerPost,
        colorClass: 'Primary',
        iconClass: 'statIconPrimary',
        cardClass: 'statCardPrimary',
      },
      {
        key: 'likes',
        icon: Heart,
        label: 'Total Likes',
        value: analytics.totalLikes,
        trend: analytics.averageLikesPerPost,
        colorClass: 'Rose',
        iconClass: 'statIconRose',
        cardClass: 'statCardRose',
      },
      {
        key: 'comments',
        icon: MessageCircle,
        label: 'Total Comments',
        value: analytics.totalComments,
        trend: 0,
        colorClass: 'Info',
        iconClass: 'statIconInfo',
        cardClass: 'statCardInfo',
      },
      {
        key: 'posts',
        icon: FileText,
        label: 'Total Posts',
        value: analytics.totalPosts,
        trend: 0,
        colorClass: 'Accent',
        iconClass: 'statIconAccent',
        cardClass: 'statCardAccent',
      },
      {
        key: 'published',
        icon: CheckCircle,
        label: 'Published Posts',
        value: analytics.publishedPosts,
        trend: 0,
        colorClass: 'Emerald',
        iconClass: 'statIconEmerald',
        cardClass: 'statCardEmerald',
      },
      {
        key: 'drafts',
        icon: Clock,
        label: 'Draft Posts',
        value: analytics.draftPosts,
        trend: 0,
        colorClass: 'Amber',
        iconClass: 'statIconAmber',
        cardClass: 'statCardAmber',
      },
    ];
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!topPosts) return [];
    return topPosts.map((post, i) => ({
      title:
        post.title.length > 20 ? post.title.slice(0, 20) + '…' : post.title,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
    }));
  }, [topPosts]);

  const notifications = notificationsData?.notifications ?? [];

  if (isAuthLoading) {
    return <AuthLoader fullPage message="Checking your session" />;
  }

  if (!isAuthenticated) {
    return <AuthLoader fullPage message="Redirecting to login" />;
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTopRow}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => router.back()}
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className={styles.title}>Analytics</div>
                <div className={styles.subtitle}>
                  Track your content performance
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.statsGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonIcon} />
                <div className={styles.skeletonTrend} />
              </div>
              <div className={styles.skeletonValue} />
              <div className={styles.skeletonLabel} />
            </div>
          ))}
        </div>
        <div className={styles.chartsGrid}>
          <div className={styles.chartFull}>
            <div className={styles.skeleton}>
              <div className={styles.skeletonChart} />
            </div>
          </div>
          <div className={styles.chartFull}>
            <div className={styles.skeleton}>
              <div className={styles.skeletonChart} />
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Top Performing Posts</div>
          </div>
          <div className={styles.topPostsTable}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                <div
                  className={styles.skeletonCell}
                  style={{ width: 24, height: 24, borderRadius: '50%' }}
                />
                <div className={styles.skeletonCell} />
                <div className={styles.skeletonCell} style={{ width: 60 }} />
                <div className={styles.skeletonCell} style={{ width: 60 }} />
                <div className={styles.skeletonCell} style={{ width: 60 }} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Recent Notifications</div>
          </div>
          <div className={styles.activityFeed}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonActivity}>
                <div className={styles.skeletonActivityIcon} />
                <div className={styles.skeletonActivityLines}>
                  <div
                    className={styles.skeletonActivityLine}
                    style={{ width: '70%' }}
                  />
                  <div
                    className={styles.skeletonActivityLine}
                    style={{ width: '40%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <div className={styles.errorTitle}>Failed to load analytics</div>
          <p className={styles.errorMessage}>
            Something went wrong while fetching your analytics data. Please try
            again.
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
        <div className={styles.headerLeft}>
          <div className={styles.headerTopRow}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className={styles.title}>Analytics</h1>
              <p className={styles.subtitle}>Track your content performance</p>
            </div>
          </div>
        </div>
        <div className={styles.dateRange}>
          <Activity size={14} />
          Last 12 months
        </div>
      </div>

      <div className={styles.statsGrid}>
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend >= 0 ? TrendingUp : TrendingDown;
          return (
            <Card
              key={stat.key}
              className={`${styles.statCard} ${styles[stat.cardClass]}`}
            >
              <div className={styles.statHeader}>
                <div
                  className={`${styles.statIconWrapper} ${styles[stat.iconClass]}`}
                >
                  <Icon size={18} />
                </div>
                {stat.trend !== 0 && (
                  <span
                    className={`${styles.statTrend} ${stat.trend >= 0 ? styles.trendUp : styles.trendDown}`}
                  >
                    <TrendIcon size={12} />
                    {Math.abs(stat.trend)}%
                  </span>
                )}
              </div>
              <div className={styles.statValue}>{formatNumber(stat.value)}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </Card>
          );
        })}
      </div>

      <div className={styles.chartsGrid}>
        <div className={`${styles.chartCard} ${styles.chartFull}`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Top Posts by Views</h3>
          </div>
          <div className={styles.chartContainer}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid {...CHART_GRID_STYLE} />
                  <XAxis
                    type="number"
                    tick={CHART_AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={CHART_AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="views"
                    name="Views"
                    fill="var(--primary-500)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>
                <p>
                  No post data yet. Create your first post to see analytics.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`${styles.chartCard} ${styles.chartFull}`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Engagement per Post</h3>
          </div>
          <div className={styles.chartContainer}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid {...CHART_GRID_STYLE} />
                  <XAxis
                    type="number"
                    tick={CHART_AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={CHART_AXIS_STYLE}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="likes"
                    name="Likes"
                    fill="var(--rose-500)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="comments"
                    name="Comments"
                    fill="var(--color-info)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>
                <p>No engagement data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Top Performing Posts</h2>
        </div>
        <div className={styles.topPostsTable}>
          <div className={styles.topPostHeader}>
            <span>Rank</span>
            <span>Title</span>
            <span style={{ textAlign: 'right' }}>Views</span>
            <span style={{ textAlign: 'right' }}>Likes</span>
            <span style={{ textAlign: 'right' }}>Comments</span>
          </div>
          {topPosts && topPosts.length > 0 ? (
            topPosts.map((post, i) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className={styles.topPostRow}
              >
                <span
                  className={`${styles.topPostRank} ${i === 0 ? styles.topPostRankGold : i === 1 ? styles.topPostRankSilver : i === 2 ? styles.topPostRankBronze : ''}`}
                >
                  #{i + 1}
                </span>
                <span className={styles.topPostTitle}>{post.title}</span>
                <span
                  className={styles.topPostStat}
                  style={{ textAlign: 'right' }}
                >
                  {formatNumber(post.views)}
                </span>
                <span
                  className={styles.topPostStat}
                  style={{ textAlign: 'right' }}
                >
                  {formatNumber(post.likes)}
                </span>
                <span
                  className={styles.topPostStat}
                  style={{ textAlign: 'right' }}
                >
                  {formatNumber(post.comments)}
                </span>
              </Link>
            ))
          ) : (
            <p
              style={{
                color: 'var(--text-tertiary)',
                fontSize: 'var(--fs-sm)',
                padding: 'var(--space-4)',
              }}
            >
              No posts yet.
            </p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Notifications</h2>
        </div>
        <div className={styles.activityFeed}>
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div key={item.id} className={styles.activityItem}>
                <div
                  className={`${styles.activityIcon} ${styles.activityIconNotice}`}
                >
                  <Bell size={14} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>
                    {item.title}: {item.message}
                  </p>
                  <span className={styles.activityTime}>
                    {formatRelativeDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                color: 'var(--text-tertiary)',
                fontSize: 'var(--fs-sm)',
                padding: 'var(--space-4)',
              }}
            >
              No recent notifications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
