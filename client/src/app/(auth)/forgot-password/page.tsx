'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/lib/utils';
import styles from './page.module.css';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotFormValues) {
    try {
      setIsLoading(true);
      setSubmitError(null);
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {isSubmitted ? (
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <CheckCircle size={48} />
          </div>
          <h2 className={styles.successTitle}>Check your email</h2>
          <p className={styles.successMessage}>
            We&apos;ve sent a password reset link to your email address. Please
            check your inbox and follow the instructions.
          </p>
          <Link href="/login" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {submitError && (
            <div className={styles.errorAlert} role="alert">
              {submitError}
            </div>
          )}

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail size={16} />}
            fullWidth
            error={errors.email?.message}
            {...register('email')}
          />

          <div className={styles.fieldSpacer} />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className={styles.submitButton}
          >
            Send reset link
          </Button>

          <div className={styles.backRow}>
            <Link href="/login" className={styles.backLink}>
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
