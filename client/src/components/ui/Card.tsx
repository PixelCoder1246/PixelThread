'use client';

import { HTMLAttributes, forwardRef } from 'react';
import styles from './Card.module.css';

const s = styles as Record<string, string>;

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={[s.card, className].filter(Boolean).join(' ')}
    {...props}
  />
));

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={[s['card-header'], className].filter(Boolean).join(' ')} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={['text-2xl font-semibold leading-tight', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={['text-sm text-muted', className].filter(Boolean).join(' ')} {...props} />
  )
);

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={[s['card-content'], className].filter(Boolean).join(' ')} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={[s['card-footer'], className].filter(Boolean).join(' ')} {...props} />
  )
);

CardFooter.displayName = 'CardFooter';