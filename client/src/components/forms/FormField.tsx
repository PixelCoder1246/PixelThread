'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import styles from './FormField.module.css';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  name?: string;
  className?: string;
}

export default function FormField({
  label,
  error,
  helperText,
  required = false,
  children,
  name,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = name ? `field-${name}-${generatedId}` : generatedId;

  return (
    <div className={cn(styles.wrapper, className)} role="group">
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.children} id={fieldId}>
        {children}
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className={styles.helper}>{helperText}</p>
      )}
    </div>
  );
}
