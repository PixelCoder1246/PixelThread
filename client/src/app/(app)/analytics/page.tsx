'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Heart,
  MessageSquare,
  BookOpen,
  TrendingUp,
  BarChart3,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  useOverallAnalytics,
  usePostsAnalytics,
  useTopPosts,
} from '@/features/analytics/useAnalytics';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/date';
import styles from './page.module.css';

export default function AnalyticsPage() {
  const [page, setPage] = useState(1);

  const { data: overall, isLoading: overallLoading } = useOverallAnalytics();
  const { data: topPosts, isLoading: topPostsLoading } = useTopPosts(5);
  const { data: postsData, isLoading: postsLoading } = usePostsAnalytics(
    page,
    10,
    'newest'
  );

  const posts = postsData?.posts ?? [];
  const pagination = postsData?.pagination;

  // Max views in top posts for scaling bar chart
  const maxViews = Math.max(1, ...(topPosts?.map((p) => p.views) ?? [1]));

  return (
    <div className={styles.analyticsPage}>
      <header className={styles.header}>
        <h1>Analytics Overview</h1>
        <p className={styles.subtitle}>
          Track your readership metrics, engagement rates, and top-performing
          stories.
        </p>
      </header>

      {/* Overview Stat Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Views</span>
            <div
              className={styles.metricIcon}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
              }}
            >
              <Eye size={18} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {overallLoading
              ? '...'
              : (overall?.totalViews ?? 0).toLocaleString()}
          </div>
          <span className={styles.metricSubtext}>
            Avg {overall?.averageViewsPerPost ?? 0} views per story
          </span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Likes</span>
            <div
              className={styles.metricIcon}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
              }}
            >
              <Heart size={18} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {overallLoading
              ? '...'
              : (overall?.totalLikes ?? 0).toLocaleString()}
          </div>
          <span className={styles.metricSubtext}>
            Avg {overall?.averageLikesPerPost ?? 0} likes per story
          </span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Responses</span>
            <div
              className={styles.metricIcon}
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
              }}
            >
              <MessageSquare size={18} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {overallLoading
              ? '...'
              : (overall?.totalComments ?? 0).toLocaleString()}
          </div>
          <span className={styles.metricSubtext}>
            Community reader feedback
          </span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Published Stories</span>
            <div
              className={styles.metricIcon}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
              }}
            >
              <BookOpen size={18} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {overallLoading ? '...' : (overall?.publishedPosts ?? 0)}
          </div>
          <span className={styles.metricSubtext}>
            {overall?.draftPosts ?? 0} drafts in progress
          </span>
        </div>
      </div>

      {/* Top Stories Performance Chart */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-400" />
            <h2 className={styles.cardTitle}>Top Performing Stories</h2>
          </div>
          <span className="text-xs text-slate-400">Ranked by reader views</span>
        </div>

        {topPostsLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : !topPosts || topPosts.length === 0 ? (
          <div className={styles.emptyState}>
            Publish stories to see view distributions and engagement patterns.
          </div>
        ) : (
          <div className={styles.chartContainer}>
            {topPosts.map((post) => {
              const heightPct = Math.max(
                10,
                Math.round((post.views / maxViews) * 100)
              );
              return (
                <div key={post.id} className={styles.chartBarGroup}>
                  <span className={styles.chartValue}>{post.views}</span>
                  <div
                    className={styles.chartBar}
                    style={{ height: `${heightPct}%` }}
                    title={`${post.title}: ${post.views} views, ${post.likes} likes`}
                  />
                  <Link
                    href={`/posts/${post.slug}`}
                    className={styles.chartLabel}
                    title={post.title}
                  >
                    {post.title}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Stories Analytics Table */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-400" />
            <h2 className={styles.cardTitle}>Story Performance Breakdown</h2>
          </div>
        </div>

        {postsLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            No stories published yet. Write a story to see detailed analytics.
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Story Title</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Responses</th>
                    <th>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <Link
                          href={`/posts/${post.slug}`}
                          className={styles.storyTitle}
                          title={post.title}
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td>
                        <Badge
                          variant={
                            post.status === 'PUBLISHED' ? 'success' : 'default'
                          }
                        >
                          {post.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                          <Eye size={14} className="text-indigo-400" />
                          <span>{post.views}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                          <Heart size={14} className="text-red-400" />
                          <span>{post.likes}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                          <MessageSquare
                            size={14}
                            className="text-purple-400"
                          />
                          <span>{post.comments}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-slate-400">
                          {post.publishedAt
                            ? formatDate(post.publishedAt)
                            : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
