'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

function getTypeClass(type: ToastType): string {
  switch (type) {
    case 'success': return styles['toast-success'];
    case 'error': return styles['toast-error'];
    case 'info': return styles['toast-info'];
    case 'warning': return styles['toast-warning'];
    default: return '';
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastWithId = { ...newToast, id };
    setToasts((prev) => [...prev, toastWithId]);

    if (newToast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration || 5000);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className={styles['toast-container']}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = icons[toast.type];

  return (
    <div
      className={[styles.toast, getTypeClass(toast.type)].filter(Boolean).join(' ')}
      role="alert"
      aria-live="polite"
    >
      <Icon className={styles['toast-icon']} aria-hidden="true" />
      <div className={styles['toast-content']}>
        <p className={styles['toast-title']}>{toast.title}</p>
        {toast.message && <p className={styles['toast-message']}>{toast.message}</p>}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className={styles['toast-action']}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={styles['toast-close']}
        aria-label="Dismiss"
      >
        <X className={styles['toast-close-icon']} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}