'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations';
import { Button, PasswordInput, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { authService } from '@/services/auth.service';
import styles from './ResetPasswordForm.module.css';

const s = styles as Record<string, string>;

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await authService.resetPassword({
        token: data.token,
        newPassword: data.password,
      });

      toast({ type: 'success', title: 'Password reset!', message: 'Your password has been updated successfully.' });
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      toast({ type: 'error', title: 'Error', message });
    }
  };

  if (!token) {
    return (
      <div className={s['reset-password-form-success']}>
        <svg className={s['reset-password-form-success-icon']} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className={s['reset-password-form-success-title']}>Invalid reset link</h2>
        <p className={s['reset-password-form-success-message']}>
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className={s['reset-password-form-success-link']}>
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s['reset-password-form']}>
      <div className={s['reset-password-form-header']}>
        <h2 className={s['reset-password-form-title']}>Reset your password</h2>
        <p className={s['reset-password-form-subtitle']}>
          Enter your new password below.
        </p>
      </div>

      <div className={s['reset-password-form-fields']}>
        <PasswordInput
          {...register('password')}
          label="New Password"
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="new-password"
          required
        />
        <PasswordInput
          {...register('confirmPassword')}
          label="Confirm New Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          required
        />
        <input {...register('token')} type="hidden" />
      </div>

      <Button type="submit" className={s['reset-password-form-submit']} size="lg" isLoading={isSubmitting}>
        Reset password
      </Button>

      <p className={s['reset-password-form-footer']}>
        <span className={s['reset-password-form-footer-text']}>
          Remember your password?{' '}
          <Link href="/login" className={s['reset-password-form-footer-link']}>
            Sign in
          </Link>
        </span>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<Spinner className="mx-auto" />}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}