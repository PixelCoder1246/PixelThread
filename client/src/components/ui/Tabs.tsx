'use client';

import { ReactNode, useState, createContext, useContext } from 'react';
import styles from './Tabs.module.css';

const s = styles as Record<string, string>;

interface TabsProps {
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

const TabsContext = createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
}

export function Tabs({
  defaultValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={['space-y-4', className].filter(Boolean).join(' ')}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={[s['tabs-list'], className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  disabled,
  className,
}: TabsTriggerProps) {
  const { value: currentValue, onValueChange } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabs-${value}-content`}
      id={`tabs-${value}-trigger`}
      data-state={isActive ? 'active' : 'inactive'}
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      className={[
        s['tabs-trigger'],
        isActive ? s.active : '',
        disabled ? 'opacity-50 pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: currentValue } = useTabsContext();
  const isActive = currentValue === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`tabs-${value}-content`}
      aria-labelledby={`tabs-${value}-trigger`}
      className={[s['tabs-content'], className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
