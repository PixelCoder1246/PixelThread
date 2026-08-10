'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{
        margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '2rem', background: '#0a0a0b',
        color: '#fafafa', fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: 16,
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            marginBottom: '1.5rem', fontSize: 48,
          }}>!</div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Critical error
          </h1>
          <p style={{ fontSize: '1rem', color: '#a1a1aa', lineHeight: 1.625, marginBottom: '2rem' }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <button onClick={reset} style={{
            padding: '0.5rem 1rem', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #3f51b5, #7e22ce)',
            color: '#fff', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
          }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
