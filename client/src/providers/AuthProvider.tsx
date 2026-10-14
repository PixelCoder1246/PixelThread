'use client';

import { ReactNode } from 'react';
import { AuthProvider as AuthProviderComponent } from '@/features/auth/useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthProviderComponent>{children}</AuthProviderComponent>;
}
