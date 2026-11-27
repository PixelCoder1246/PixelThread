import styles from './page.module.css';

export default function NotificationsLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-full)',
              background: 'var(--skeleton-base)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              height: 28,
              width: 160,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--skeleton-base)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          borderBottom: '1px solid var(--border-primary)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 36,
              width: 80,
              borderRadius: 'var(--radius-md)',
              background: 'var(--skeleton-base)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              marginBottom: -1,
            }}
          />
        ))}
      </div>

      <div className={styles.loadingSkeleton}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skeletonItem}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} style={{ width: '70%' }} />
              <div className={styles.skeletonLine} style={{ width: '30%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
