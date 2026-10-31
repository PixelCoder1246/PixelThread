'use client';

import styles from './SkipToContent.module.css';

export function SkipToContent({
  targetId = 'main-content',
}: {
  targetId?: string;
}) {
  return (
    <a href={`#${targetId}`} className={styles.skipLink}>
      Skip to main content
    </a>
  );
}
