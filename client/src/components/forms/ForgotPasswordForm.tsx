'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { authService } from '@/services/auth.service';
import styles from './ForgotPasswordForm.module.css';

const s = styles as Record<string, string>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await authService.forgotPassword(data);

      toast({
        type: 'success',
        title: 'Check your email',
        message:
          'If an account exists, you will receive a password reset link.',
      });
      router.push('/login');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send reset email. Please try again.';
      toast({ type: 'error', title: 'Error', message });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={s['forgot-password-form']}
    >
      <div className={s['forgot-password-form-header']}>
        <h2 className={s['forgot-password-form-title']}>Forgot password?</h2>
        <p className={s['forgot-password-form-subtitle']}>
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <div className={s['forgot-password-form-fields']}>
        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="you@example.com"
          error={errors.email?.message}
          autoComplete="email"
          required
        />
      </div>

      <Button
        type="submit"
        className={s['forgot-password-form-submit']}
        size="lg"
        isLoading={isSubmitting}
      >
        Send reset link
      </Button>

      <p className={s['forgot-password-form-footer']}>
        <span className={s['forgot-password-form-footer-text']}>
          Remember your password?{' '}
          <Link href="/login" className={s['forgot-password-form-footer-link']}>
            Sign in
          </Link>
        </span>
      </p>
    </form>
  );
}
