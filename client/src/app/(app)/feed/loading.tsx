import styles from './page.module.css';

export default function FeedLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div
          style={{
            height: 32,
            width: 100,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--skeleton-base)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 36,
            width: 100,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--skeleton-base)',
            animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 36,
              width: 100,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--skeleton-base)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>

      <div className={styles.feed}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeleton}>
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonLine} style={{ width: 120 }} />
            </div>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonExcerpt}>
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
            </div>
            <div className={styles.skeletonTags}>
              <div className={styles.skeletonTag} />
              <div className={styles.skeletonTag} />
              <div className={styles.skeletonTag} />
            </div>
            <div className={styles.skeletonFooter}>
              <div className={styles.skeletonLine} style={{ width: 160 }} />
              <div className={styles.skeletonLine} style={{ width: 80 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
