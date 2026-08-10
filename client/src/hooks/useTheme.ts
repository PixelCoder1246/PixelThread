'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useThemeMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const setMode = (mode: string) => {
    setTheme(mode);
  };

  return {
    theme: mounted ? theme : 'dark',
    isDark: mounted ? isDark : true,
    isLight: mounted ? !isDark : false,
    mounted,
    toggleTheme,
    setMode,
  };
}
