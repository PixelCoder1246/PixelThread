'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import AuthLoader from '@/components/common/AuthLoader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth, useGuestOnly } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils';
import styles from './page.module.css';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long'),
    email: z.string().email('Please enter a valid email address'),
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

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const { isLoading: isAuthLoading } = useGuestOnly();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  if (isAuthLoading) return <AuthLoader fullPage message="Loading" />;

  async function onSubmit(data: RegisterFormValues) {
    try {
      setSubmitError(null);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (err: unknown) {
      setSubmitError(
        getErrorMessage(err, 'Registration failed. Please try again.')
      );
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start your journey as a creator today"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {submitError && (
          <div className={styles.errorAlert} role="alert">
            {submitError}
          </div>
        )}

        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          leftIcon={<User size={16} />}
          fullWidth
          error={errors.name?.message}
          {...register('name')}
        />

        <div className={styles.fieldSpacer} />

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
          placeholder="Create a strong password"
          leftIcon={<Lock size={16} />}
          fullWidth
          error={errors.password?.message}
          {...register('password')}
        />

        <div className={styles.fieldSpacer} />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          leftIcon={<Lock size={16} />}
          fullWidth
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className={styles.fieldSpacer} />

        <Button
          type="submit"
          fullWidth
          isLoading={isRegistering}
          className={styles.submitButton}
        >
          Create account
        </Button>
      </form>

      <p className={styles.switchText}>
        Already have an account?{' '}
        <Link href="/login" className={styles.switchLink}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
