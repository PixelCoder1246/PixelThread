'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import styles from './Dropdown.module.css';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
}

export default function Dropdown({
  trigger,
  items,
  align = 'start',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  return (
    <div ref={dropdownRef} className={styles.wrapper} onKeyDown={handleKeyDown}>
      <div
        role="button"
        tabIndex={0}
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </div>
      {open && (
        <div
          className={cn(styles.menu, align === 'end' && styles.menuEnd)}
          role="menu"
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider && index > 0 && <div className={styles.divider} />}
              <button
                type="button"
                role="menuitem"
                className={styles.item}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
              >
                {item.icon && (
                  <span className={styles.itemIcon}>{item.icon}</span>
                )}
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
