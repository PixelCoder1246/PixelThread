'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { Button, Input, PasswordInput } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import styles from './RegisterForm.module.css';

const s = styles as Record<string, string>;

export function RegisterForm() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const { register: registerUser } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setRegisteredEmail(data.email);
      toast({
        type: 'success',
        title: 'Account created!',
        message: 'Please check your email to verify your account.',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';
      toast({ type: 'error', title: 'Registration failed', message });
    }
  };

  if (registeredEmail) {
    return (
      <div className={s['register-form']}>
        <div
          className={s['register-form-header']}
          style={{ textAlign: 'center' }}
        >
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Mail
              style={{
                width: '2rem',
                height: '2rem',
                color: 'var(--color-accent-primary)',
              }}
            />
          </div>
          <h2 className={s['register-form-title']}>Check your email</h2>
          <p
            className={s['register-form-subtitle']}
            style={{ marginTop: '0.5rem', lineHeight: '1.6' }}
          >
            We&apos;ve sent a verification link to{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {registeredEmail}
            </strong>
            . Please verify your email address to activate your account before
            logging in.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          <Link href="/login" style={{ width: '100%' }}>
            <Button
              size="lg"
              className="w-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Proceed to Sign In</span>
              <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </Button>
          </Link>
          <Link href="/resend-verification" style={{ width: '100%' }}>
            <Button variant="outline" size="lg" className="w-full">
              Resend verification email
            </Button>
          </Link>
        </div>

        <div
          className={s['register-form-footer']}
          style={{ marginTop: '1.5rem' }}
        >
          <span className={s['register-form-footer-text']}>
            Need to use a different email?{' '}
            <button
              type="button"
              onClick={() => setRegisteredEmail(null)}
              className={s['register-form-footer-link']}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Sign up again
            </button>
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s['register-form']}>
      <div className={s['register-form-header']}>
        <h2 className={s['register-form-title']}>Create your account</h2>
        <p className={s['register-form-subtitle']}>
          Already have an account?{' '}
          <Link href="/login" className={s['register-form-footer-link']}>
            Sign in
          </Link>
        </p>
      </div>

      <div className={s['register-form-fields']}>
        <Input
          {...register('name')}
          type="text"
          label="Name"
          placeholder="John Doe"
          error={errors.name?.message}
          autoComplete="name"
          required
        />
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
          autoComplete="new-password"
          required
        />
        <PasswordInput
          {...register('confirmPassword')}
          label="Confirm Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          required
        />
      </div>

      <div className={s['register-form-terms']}>
        <input
          id="terms-checkbox"
          type="checkbox"
          required
          className={s['register-form-terms-input']}
        />
        <label
          htmlFor="terms-checkbox"
          className={s['register-form-terms-text']}
        >
          By creating an account, you agree to our{' '}
          <Link href="/terms" className={s['register-form-terms-link']}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className={s['register-form-terms-link']}>
            Privacy Policy
          </Link>
          .
        </label>
      </div>

      <Button
        type="submit"
        className={s['register-form-submit']}
        size="lg"
        isLoading={isSubmitting}
      >
        Create account
      </Button>
    </form>
  );
}
