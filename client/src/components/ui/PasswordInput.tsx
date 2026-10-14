'use client';

import { useState } from 'react';
import { InputHTMLAttributes, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './PasswordInput.module.css';

const s = styles as Record<string, string>;

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div
        className="w-full"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
        }}
      >
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className={s['password-input-wrapper']}>
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={[
              s['password-input'],
              s['password-input-with-toggle'],
              error ? s['password-input-error'] : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={s['password-toggle']}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="error-message" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
