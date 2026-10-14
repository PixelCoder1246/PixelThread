'use client';

import styles from './page.module.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Mail, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export default function ResendVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const onSubmit = async (data: ResendVerificationInput) => {
    setStatus('loading');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to send verification email'
        );
      }

      setStatus('success');
      toast({
        type: 'success',
        title: 'Verification email sent!',
        message: 'Please check your inbox.',
      });
    } catch (error) {
      setStatus('idle');
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send verification email. Please try again.';
      toast({ type: 'error', title: 'Error', message });
    }
  };

  return (
    <div className={styles.resendVerificationPage}>
      <Card className={styles.resendVerificationCard}>
        <div className={styles.resendVerificationContent}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <Mail className={styles.icon} />
            </div>
            <h2>Resend Verification Email</h2>
            <p>Enter your email and we&apos;ll send a new verification link.</p>
          </div>

          {status === 'success' ? (
            <div className={styles.successState}>
              <div className={styles.successIconWrapper}>
                <CheckCircle className={styles.successIcon} />
              </div>
              <h3>Email Sent!</h3>
              <p>
                We&apos;ve sent a new verification link to your email. Please
                check your inbox.
              </p>
              <Link href="/login" className="w-full">
                <Button className="w-full gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="you@example.com"
                error={errors.email?.message}
                autoComplete="email"
                required
              />

              <Button
                type="submit"
                className={styles.submitButton}
                size="lg"
                isLoading={isSubmitting || status === 'loading'}
              >
                {status === 'loading' && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Send Verification Email
              </Button>
            </form>
          )}

          <div className={styles.footer}>
            <p>
              Remember your password? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
