'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { queryClient } from '@/lib/queryClient';
import { authService, type AuthResponse } from '@/services/auth.service';
import type { CurrentUser } from '@/types/user';
import { queryKeys } from '@/lib/queryKeys';

const REMEMBER_ME_KEY = 'pixelthread_remember_me';

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<CurrentUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      // Check remember me setting:
      // If remember me was unchecked, we don't persist session across browser closes (sessionStorage vs localStorage)
      if (typeof window !== 'undefined') {
        const rememberSetting = localStorage.getItem(REMEMBER_ME_KEY);
        const sessionActive = sessionStorage.getItem(
          'pixelthread_session_active'
        );

        // If remember me is explicitly "false" and this is a new browser session (sessionActive is missing),
        // then according to user requirement, do not restore the session: log out from backend.
        if (rememberSetting === 'false' && !sessionActive) {
          try {
            await authService.logout();
          } catch {
            // ignore
          }
          localStorage.removeItem(REMEMBER_ME_KEY);
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      // Try fetching current user
      let currentUser: CurrentUser | null = null;
      try {
        currentUser = await authService.getMe();
      } catch (err: unknown) {
        // If 401, try refreshing token directly via /api/auth/refresh
        const status = (err as { status?: number })?.status;
        if (status === 401) {
          try {
            await authService.refreshToken();
            currentUser = await authService.getMe();
          } catch {
            currentUser = null;
          }
        } else {
          currentUser = null;
        }
      }

      if (currentUser) {
        setUser(currentUser);
        queryClient.setQueryData(queryKeys.auth.me, currentUser);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pixelthread_session_active', 'true');
        }
      } else {
        setUser(null);
        queryClient.removeQueries({ queryKey: queryKeys.auth.me });
      }
    } catch {
      setUser(null);
      queryClient.removeQueries({ queryKey: queryKeys.auth.me });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, rememberMe = true) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
    queryClient.setQueryData(queryKeys.auth.me, response.user);

    if (typeof window !== 'undefined') {
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
      sessionStorage.setItem('pixelthread_session_active', 'true');
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await authService.register(data);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue clearing client auth state even if server session is already invalid
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(REMEMBER_ME_KEY);
        sessionStorage.removeItem('pixelthread_session_active');
      }
      setUser(null);
      queryClient.clear();
    }
  };

  const updateUser = (data: Partial<CurrentUser>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      queryClient.setQueryData(queryKeys.auth.me, updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
