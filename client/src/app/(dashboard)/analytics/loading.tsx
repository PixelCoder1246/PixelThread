export default function AnalyticsLoading() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: 'var(--space-6)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        marginBottom: 'var(--space-8)',
      }}>
        <div style={{
          width: 160,
          height: 32,
          borderRadius: 'var(--radius-md)',
          background: 'var(--skeleton-base)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{
          width: 240,
          height: 14,
          borderRadius: 'var(--radius-base)',
          background: 'var(--skeleton-base)',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-5)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-3)',
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-xl)',
                background: 'var(--skeleton-base)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{
                width: 56,
                height: 22,
                borderRadius: 'var(--radius-full)',
                background: 'var(--skeleton-base)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }} />
            </div>
            <div style={{
              width: 80,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'var(--skeleton-base)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              marginBottom: 'var(--space-2)',
            }} />
            <div style={{
              width: 100,
              height: 14,
              borderRadius: 'var(--radius-base)',
              background: 'var(--skeleton-base)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)',
      }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-5)',
          }}>
            <div style={{
              width: '100%',
              height: 300,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--skeleton-base)',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
