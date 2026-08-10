'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  error,
  id,
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <div className={cn(styles.wrapper, disabled && styles.disabled)}>
      <div className={styles.container}>
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={styles.input}
        />
        <label htmlFor={checkboxId} className={styles.label}>
          <span className={cn(styles.checkbox, checked && styles.checked)}>
            {checked && <Check size={14} strokeWidth={3} className={styles.icon} />}
          </span>
          {label && <span className={styles.text}>{label}</span>}
        </label>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
