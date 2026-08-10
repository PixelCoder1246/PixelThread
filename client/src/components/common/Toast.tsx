'use client';

/**
 * Sonner Toaster is already set up in `@/providers/index.tsx` with custom styling.
 *
 * Usage:
 * ```tsx
 * import { toast } from 'sonner';
 *
 * toast.success('Post published!');
 * toast.error('Failed to save');
 * toast('Info message');
 * ```
 *
 * This file re-exports the `toast` function from `sonner` for convenience.
 * Import `Toaster` directly from `sonner` only if you need to customize it
 * beyond what's already configured in providers.
 */
export { toast } from 'sonner';
