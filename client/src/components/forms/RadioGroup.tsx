'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import styles from './RadioGroup.module.css';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export default function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
}: RadioGroupProps) {
  const generatedId = useId();
  const groupId = `radio-group-${generatedId}`;

  return (
    <div className={styles.wrapper}>
      {label && (
        <span id={groupId} className={styles.label}>
          {label}
        </span>
      )}
      <div className={styles.options} role="radiogroup" aria-labelledby={label ? groupId : undefined}>
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(styles.option, isSelected && styles.optionSelected)}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className={styles.input}
              />
              <span className={cn(styles.radio, isSelected && styles.radioSelected)}>
                <span className={cn(styles.dot, isSelected && styles.dotVisible)} />
              </span>
              <span className={styles.optionLabel}>{option.label}</span>
            </label>
          );
        })}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
