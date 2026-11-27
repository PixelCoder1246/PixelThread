'use client';

type KeyModifier = 'ctrl' | 'meta' | 'shift' | 'alt';

interface KeyBindings {
  key: string;
  modifiers?: KeyModifier[];
  handler: (e: KeyboardEvent) => void;
  enabled?: boolean;
}

// Keybindings disabled across website per user request
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useKeyboard(_bindings?: KeyBindings[]) {
  // No-op
}
