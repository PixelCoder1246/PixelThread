'use client';

import React, { useState } from 'react';
import { cn, getInitials, getRandomColor } from '@/lib/utils';
import styles from './Avatar.module.css';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'away';

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const bgColor = getRandomColor(name);

  return (
    <div className={cn(styles.wrapper, styles[size], className)}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className={styles.image}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={styles.fallback} style={{ background: bgColor }}>
          <span className={styles.initials}>{initials}</span>
        </div>
      )}
      {status && (
        <span
          className={cn(
            styles.status,
            styles[`status-${status}`],
            styles[`status-${size}`]
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}
