'use client';

import styles from './page.module.css';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui';

const popularTags = [
  { name: 'javascript', count: 1234 },
  { name: 'react', count: 987 },
  { name: 'typescript', count: 876 },
  { name: 'nodejs', count: 765 },
  { name: 'python', count: 654 },
  { name: 'ai', count: 543 },
  { name: 'webdev', count: 432 },
  { name: 'tutorial', count: 321 },
];

export default function TagsPage() {
  return (
    <div className={styles.tagsPage}>
      <h1>Popular Tags</h1>
      <div className={styles.tagsList}>
        {popularTags.map((tag) => (
          <Link key={tag.name} href={`/tags/${tag.name}`}>
            <Badge variant="outline" className="gap-2 px-3 py-2 text-base">
              #{tag.name}
              <span className="text-muted-foreground">{tag.count}</span>
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
