'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import styles from './error.module.css';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log client render exception for debugging
    console.error('Unhandled route exception caught by error boundary:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <AlertOctagon className={styles.icon} />
        </div>

        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.description}>
          An unexpected error occurred while rendering this view. You can try
          refreshing the component or navigating back to safety.
        </p>

        <div className={styles.actions}>
          <button onClick={() => reset()} className={styles.primaryBtn}>
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <Link href="/" className={styles.secondaryBtn}>
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </div>

        <div className={styles.debugSection}>
          <button
            type="button"
            className={styles.debugToggle}
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>Technical details</span>
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showDetails && (
            <div className={styles.debugDetails}>
              <p className={styles.errorMessage}>
                <strong>Error:</strong> {error?.message || 'Unknown error'}
              </p>
              {error?.digest && (
                <p className={styles.errorDigest}>
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
              {error?.stack && (
                <pre className={styles.errorStack}>{error.stack}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
