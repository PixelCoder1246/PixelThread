'use client';

import Link from 'next/link';
import { Calendar, Clock, Hash } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/date';
import type { PostListItem } from '@/types/post';
import styles from './PostHeader.module.css';

interface PostHeaderProps {
  post: PostListItem;
}

function getTagName(tag: unknown): string {
  if (!tag) return '';
  if (typeof tag === 'string') return tag;
  const t = tag as Record<string, unknown>;
  if (t.tag && typeof t.tag === 'object') {
    return ((t.tag as Record<string, unknown>).name as string) ?? '';
  }
  return (t.name as string) ?? '';
}

function estimateReadTime(content: unknown): number {
  if (!content) return 1;
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function PostHeader({ post }: PostHeaderProps) {
  const readTime = estimateReadTime(post.content);
  const authorName = post.author?.name || 'Anonymous';
  const authorId = post.author?.id || post.authorId || '';
  const authorAvatar = post.author?.image ?? undefined;

  return (
    <header className={styles.headerContainer}>
      <h1 className={styles.title}>{post.title}</h1>

      {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

      <div className={styles.metaRow}>
        <Link
          href={authorId ? `/profile/${authorId}` : '#'}
          className={styles.authorBlock}
        >
          <Avatar
            src={authorAvatar}
            fallback={authorName.slice(0, 2).toUpperCase()}
            size="md"
          />
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{authorName}</span>
            <div className={styles.metaDetails}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Calendar size={13} />
                {formatDate(post.createdAt)}
              </span>
              <span className={styles.dot}>•</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Clock size={13} />
                {readTime} min read
              </span>
            </div>
          </div>
        </Link>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className={styles.tagsContainer}>
          {post.tags.map((t, idx) => {
            const name = getTagName(t);
            if (!name) return null;
            return (
              <Link
                key={idx}
                href={`/tags/${encodeURIComponent(name)}`}
                className={styles.tagBadge}
              >
                <Hash size={12} />
                {name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
