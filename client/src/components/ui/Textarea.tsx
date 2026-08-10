'use client';

import React, { forwardRef, useId, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import styles from './Textarea.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, rows = 4, maxLength, showCharCount, className, id, onChange, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const [charCount, setCharCount] = useState(0);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);
        onChange?.(e);
      },
      [onChange]
    );

    return (
      <div className={cn(styles.wrapper, className)}>
        {(label || (showCharCount && maxLength)) && (
          <div className={styles.header}>
            {label && (
              <label htmlFor={textareaId} className={styles.label}>
                {label}
              </label>
            )}
            {showCharCount && maxLength && (
              <span className={styles.charCount}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <div className={cn(styles.container, error && styles.containerError)}>
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            maxLength={maxLength}
            className={styles.textarea}
            onChange={handleChange}
            {...props}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {helperText && !error && <p className={styles.helper}>{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
