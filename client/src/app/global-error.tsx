'use client';

import { RotateCcw } from 'lucide-react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: 'var(--color-bg-primary, #020617)',
          color: 'var(--color-text-primary, #f1f5f9)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '32rem',
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-card-solid, #0f172a)',
            borderRadius: '1rem',
            border:
              '1px solid var(--color-border-primary, rgba(255, 255, 255, 0.1))',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Application Error
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted, #94a3b8)',
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            A critical system error occurred. Please reload the application.
          </p>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-accent-primary, #6366f1)',
              color: 'var(--color-btn-primary-text, #ffffff)',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RotateCcw style={{ width: '1rem', height: '1rem' }} />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
