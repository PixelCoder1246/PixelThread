'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import AuthLoader from '@/components/common/AuthLoader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth, useGuestOnly } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';
import styles from './page.module.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { isLoading: isAuthLoading } = useGuestOnly();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  if (isAuthLoading) return <AuthLoader fullPage message="Loading" />;

  async function onSubmit(data: LoginFormValues) {
    try {
      setSubmitError(null);
      await login(data);
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err, 'Invalid email or password'));
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {submitError && (
          <div className={styles.errorAlert} role="alert">
            {submitError}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          fullWidth
          error={errors.email?.message}
          {...register('email')}
        />

        <div className={styles.fieldSpacer} />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          leftIcon={<Lock size={16} />}
          fullWidth
          error={errors.password?.message}
          {...register('password')}
        />

        <div className={styles.rememberRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              {...register('rememberMe')}
            />
            <span>Remember me for 30 days</span>
          </label>
          <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoggingIn}
          className={styles.submitButton}
        >
          Sign in
        </Button>
      </form>

      <p className={styles.switchText}>
        Don&apos;t have an account?{' '}
        <Link href="/register" className={styles.switchLink}>
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
