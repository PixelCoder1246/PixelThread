'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/lib/utils';
import styles from './page.module.css';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMessage(
        'No verification token found. Please check the link you clicked.'
      );
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        await authService.verifyEmail(token!);
        if (!cancelled) setState('success');
      } catch (err: unknown) {
        if (!cancelled) {
          setState('error');
          setErrorMessage(
            getErrorMessage(
              err,
              'Verification failed. The link may have expired.'
            )
          );
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'verifying') {
    return (
      <AuthLayout
        title="Verifying your email"
        subtitle="Please wait while we verify your email address."
      >
        <div className={styles.statusState}>
          <Loader2 size={48} className={styles.spinner} />
          <p className={styles.statusText}>Verifying your email address...</p>
        </div>
      </AuthLayout>
    );
  }

  if (state === 'success') {
    return (
      <AuthLayout
        title="Email verified!"
        subtitle="Your email address has been successfully verified."
      >
        <div className={styles.statusState}>
          <div className={styles.successIcon}>
            <CheckCircle size={48} />
          </div>
          <p className={styles.statusText}>
            Thank you for verifying your email. You can now sign in and start
            creating.
          </p>
          <Button fullWidth onClick={() => router.push('/login')}>
            Sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verification failed"
      subtitle="We couldn't verify your email address."
    >
      <div className={styles.statusState}>
        <div className={styles.errorIcon}>
          <XCircle size={48} />
        </div>
        <p className={styles.statusText}>{errorMessage}</p>
        <Button fullWidth onClick={() => router.push('/login')}>
          Go to sign in
        </Button>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
