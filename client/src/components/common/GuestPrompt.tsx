'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { LogIn, Compass } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';

interface GuestPromptProps {
  icon: LucideIcon;
  title: string;
  description: string;
  redirectPath: string;
}

/**
 * Shown on personal pages (bookmarks, history, analytics) when a visitor
 * is not logged in, giving them the choice to sign in or keep browsing.
 */
export default function GuestPrompt({
  icon,
  title,
  description,
  redirectPath,
}: GuestPromptProps) {
  const router = useRouter();

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 'var(--space-2)',
          }}
        >
          <Button
            leftIcon={<LogIn size={16} />}
            onClick={() =>
              router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)
            }
          >
            Sign In
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Compass size={16} />}
            onClick={() => router.push('/feed')}
          >
            Browse Feed
          </Button>
        </div>
      }
    />
  );
}
