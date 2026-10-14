'use client';

import { Fragment, ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: styles['modal-sm'],
  md: styles.modal,
  lg: styles['modal-lg'],
  xl: styles['modal-lg'],
  full: styles['modal-full'],
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (overlayRef.current && overlayRef.current === event.target) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Fragment>
      <div
        ref={overlayRef}
        className={styles['modal-overlay']}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        className={sizeClasses[size]}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {(title || showClose) && (
          <div className={styles['modal-header']}>
            <div>
              {title && (
                <h2 id="modal-title" className={styles['modal-title']}>
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <div className={styles['modal-body']}>
          {children}
        </div>
      </div>
    </Fragment>
  );
}