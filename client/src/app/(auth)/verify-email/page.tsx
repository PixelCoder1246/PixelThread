'use client';

import styles from './page.module.css';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { authService } from '@/services/auth.service';

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing verification token.');
        return;
      }

      try {
        const res = await authService.verifyEmail({ token });
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Verification failed. Please try again.'
        );
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  return (
    <Card className={styles.verifyEmailCard}>
      <div className={styles.verifyEmailContent}>
        <div className={styles.iconWrapper}>
          {status === 'success' ? (
            <CheckCircle className={styles.iconSuccess} />
          ) : (
            <AlertCircle className={styles.iconError} />
          )}
        </div>

        <h2>
          {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h2>

        <p>{message}</p>

        {status === 'success' && (
          <div className={styles.actionGroup}>
            <p>Your account is now verified. You can sign in to PixelThread.</p>
            <Link href="/login" className="w-full">
              <Button className="w-full gap-2">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.actionGroup}>
            <p>The verification link may have expired or already been used.</p>
            <Link href="/resend-verification" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Mail className="h-4 w-4" />
                Resend Verification Email
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className={styles.verifyEmailPage}>
      <Suspense fallback={<Spinner className="mx-auto" />}>
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}
