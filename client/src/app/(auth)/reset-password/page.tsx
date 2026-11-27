'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/lib/utils';
import styles from './page.module.css';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(data: ResetFormValues) {
    if (!token) {
      setSubmitError(
        'Invalid or missing reset token. Please request a new password reset.'
      );
      return;
    }
    try {
      setIsLoading(true);
      setSubmitError(null);
      await authService.resetPassword(token, data.password);
      setIsSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(
        getErrorMessage(
          err,
          'Failed to reset password. The link may have expired.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout
        title="Invalid link"
        subtitle="This password reset link is invalid or has expired."
      >
        <div className={styles.backRow}>
          <Link href="/forgot-password" className={styles.backLink}>
            <ArrowLeft size={16} />
            Request a new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Password reset"
        subtitle="Your password has been updated successfully."
      >
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <CheckCircle size={48} />
          </div>
          <h2 className={styles.successTitle}>All done!</h2>
          <p className={styles.successMessage}>
            Your password has been reset successfully. You can now sign in with
            your new password.
          </p>
          <Button fullWidth onClick={() => router.push('/login')}>
            Sign in with new password
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your new password below."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {submitError && (
          <div className={styles.errorAlert} role="alert">
            {submitError}
          </div>
        )}

        <Input
          label="New password"
          type="password"
          placeholder="Enter your new password"
          leftIcon={<Lock size={16} />}
          fullWidth
          error={errors.password?.message}
          {...register('password')}
        />

        <div className={styles.fieldSpacer} />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Repeat your new password"
          leftIcon={<Lock size={16} />}
          fullWidth
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className={styles.fieldSpacer} />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className={styles.submitButton}
        >
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
