'use client';

import { forwardRef, useState, ImgHTMLAttributes } from 'react';
import styles from './Avatar.module.css';
import { getInitials } from '@/lib/utils';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<string, string> = {
  xs: styles['avatar-xs'],
  sm: styles['avatar-sm'],
  md: styles['avatar-md'],
  lg: styles['avatar-lg'],
  xl: styles['avatar-xl'],
};

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', className, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    const avatarClasses = [styles.avatar, sizeClasses[size], className].filter(Boolean).join(' ');

    if (!src || hasError) {
      return (
        <div
          ref={ref}
          className={avatarClasses}
          aria-label={alt || fallback}
        >
          {fallback || (alt ? getInitials(alt) : '?')}
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || fallback || 'Avatar'}
        className={avatarClasses}
        onError={() => setHasError(true)}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';