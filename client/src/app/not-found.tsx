import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div
          style={{
            fontSize: '120px',
            fontWeight: 700,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #3f51b5, #7e22ce)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1.5rem',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.625,
            marginBottom: '2rem',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div
          style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}
        >
          <Link
            href="/"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3f51b5, #7e22ce)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
