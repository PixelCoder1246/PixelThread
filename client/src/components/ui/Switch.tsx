'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import styles from './Switch.module.css';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: SwitchProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(styles.wrapper, disabled && styles.disabled, className)}
    >
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        className={cn(styles.track, checked && styles.checked)}
        onClick={() => onChange(!checked)}
      >
        <span className={cn(styles.thumb, checked && styles.thumbChecked)} />
      </button>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
