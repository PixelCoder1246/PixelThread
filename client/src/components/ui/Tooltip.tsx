'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.css';

const s = styles as Record<string, string>;

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, side = 'top', delay = 200 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | number>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      className={`${s.tooltip} tooltip-${side}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={s['tooltip-content']}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}