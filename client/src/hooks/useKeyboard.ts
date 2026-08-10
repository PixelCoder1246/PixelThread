'use client';

import { useEffect } from 'react';

type KeyModifier = 'ctrl' | 'meta' | 'shift' | 'alt';

interface KeyBindings {
  key: string;
  modifiers?: KeyModifier[];
  handler: (e: KeyboardEvent) => void;
  enabled?: boolean;
}

export function useKeyboard(bindings: KeyBindings[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const binding of bindings) {
        if (binding.enabled === false) continue;

        const matchModifiers =
          (binding.modifiers?.includes('ctrl') ? e.ctrlKey : !e.ctrlKey) &&
          (binding.modifiers?.includes('meta') ? e.metaKey : !e.metaKey) &&
          (binding.modifiers?.includes('shift') ? e.shiftKey : !e.shiftKey) &&
          (binding.modifiers?.includes('alt') ? e.altKey : !e.altKey);

        if (e.key === binding.key && (!binding.modifiers || matchModifiers)) {
          e.preventDefault();
          binding.handler(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bindings]);
}
