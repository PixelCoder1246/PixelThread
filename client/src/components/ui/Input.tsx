'use client';

import React, { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      showPasswordToggle = true,
      className,
      id,
      type,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const resolvedType = isPassword
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    const renderedRightIcon =
      isPassword && showPasswordToggle ? (
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      ) : (
        rightIcon
      );

    return (
      <div
        className={cn(styles.wrapper, fullWidth && styles.fullWidth, className)}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={cn(styles.container, error && styles.containerError)}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              styles.input,
              leftIcon && styles.withLeftIcon,
              renderedRightIcon && styles.withRightIcon
            )}
            {...props}
          />
          {renderedRightIcon && (
            <span className={styles.rightIcon}>{renderedRightIcon}</span>
          )}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {helperText && !error && <p className={styles.helper}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
