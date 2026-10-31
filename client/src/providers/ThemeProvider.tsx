'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'pixelthread_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [mounted, setMounted] = useState(false);

  // Function to determine system theme preference
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }, []);

  // Update DOM attributes
  const applyThemeToDOM = useCallback((resolved: ResolvedTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    if (resolved === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, []);

  // Initialize theme from storage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(
        THEME_STORAGE_KEY
      ) as Theme | null;
      const initialTheme: Theme =
        storedTheme === 'light' ||
        storedTheme === 'dark' ||
        storedTheme === 'system'
          ? storedTheme
          : 'dark';

      const initialResolved =
        initialTheme === 'system' ? getSystemTheme() : initialTheme;
      setThemeState(initialTheme);
      setResolvedTheme(initialResolved);
      applyThemeToDOM(initialResolved);
    } catch {
      // Fallback if localStorage is inaccessible
      applyThemeToDOM('dark');
    } finally {
      setMounted(true);
    }
  }, [getSystemTheme, applyThemeToDOM]);

  // Listen to system preference changes when in 'system' mode
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      const nextResolved: ResolvedTheme = e.matches ? 'light' : 'dark';
      setResolvedTheme(nextResolved);
      applyThemeToDOM(nextResolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted, applyThemeToDOM]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // ignore storage error
      }

      const nextResolved = newTheme === 'system' ? getSystemTheme() : newTheme;
      setResolvedTheme(nextResolved);
      applyThemeToDOM(nextResolved);
    },
    [getSystemTheme, applyThemeToDOM]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
