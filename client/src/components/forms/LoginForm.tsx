'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Button, Input, PasswordInput, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import styles from './LoginForm.module.css';

const s = styles as Record<string, string>;

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl = (rawCallbackUrl && rawCallbackUrl !== '/') ? rawCallbackUrl : '/posts';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setUnverifiedEmail(null);
    try {
      await login(data.email, data.password, data.rememberMe ?? true);
      toast({ type: 'success', title: 'Welcome back!', message: 'You have been logged in successfully.' });
      router.replace(callbackUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      if (message.toLowerCase().includes('verify') || (error as { status?: number })?.status === 403) {
        setUnverifiedEmail(data.email);
      }
      toast({ type: 'error', title: 'Login failed', message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s['login-form']}>
      <div className={s['login-form-header']}>
        <h2 className={s['login-form-title']}>Sign in to your account</h2>
        <p className={s['login-form-subtitle']}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={s['login-form-footer-link']}>
            Sign up
          </Link>
        </p>
      </div>

      {unverifiedEmail && (
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Email verification required</div>
          <div>
            Please check your inbox to verify your email, or{' '}
            <Link
              href={`/resend-verification?email=${encodeURIComponent(unverifiedEmail)}`}
              style={{ textDecoration: 'underline', fontWeight: 600, color: 'inherit' }}
            >
              resend the verification link
            </Link>
            .
          </div>
        </div>
      )}

      <div className={s['login-form-fields']}>
        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="you@example.com"
          error={errors.email?.message}
          autoComplete="email"
          required
        />
        <PasswordInput
          {...register('password')}
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="current-password"
          required
        />

        <div className={s['login-form-options']}>
          <label className={s['login-form-remember']}>
            <input
              type="checkbox"
              {...register('rememberMe')}
              className={s['login-form-remember-input']}
            />
            <span className={s['login-form-remember-label']}>Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className={s['login-form-forgot']}
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" className={s['login-form-submit']} size="lg" isLoading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<Spinner className="mx-auto" />}>
      <LoginFormInner />
    </Suspense>
  );
}