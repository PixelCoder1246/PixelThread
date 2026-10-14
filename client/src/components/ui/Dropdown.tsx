'use client';

import { Fragment, ReactNode, useEffect, useRef, useState } from 'react';
import styles from './Dropdown.module.css';

const s = styles as Record<string, string>;

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <Fragment>
      <div
        ref={dropdownRef}
        className={`${s.dropdown} ${isOpen ? s.open : ''}`}
      >
        <div
          className={s['dropdown-trigger']}
          onClick={() => setIsOpen(!isOpen)}
        >
          {trigger}
        </div>
        {isOpen && (
          <div
            className={`${s['dropdown-menu']} ${align === 'left' ? s['dropdown-menu-left'] : ''}`}
            role="menu"
          >
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick();
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (item.disabled) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                role="menuitem"
                tabIndex={item.disabled ? undefined : 0}
                aria-disabled={item.disabled}
                disabled={item.disabled}
                className={[
                  s['dropdown-item'],
                  item.variant === 'danger' ? s.danger : '',
                  item.disabled ? s.disabled : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.icon && (
                  <span className={s['dropdown-item-icon']}>{item.icon}</span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
}
