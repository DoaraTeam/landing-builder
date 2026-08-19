"use client";

import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  // Skip this shortcut while focus is in a text field, so it doesn't hijack
  // the browser/OS's native behavior for the same combo (e.g. Ctrl+Z inside
  // a textarea should undo the text edit, not the whole page).
  ignoreWhenTyping?: boolean;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
        const altMatches = !!shortcut.altKey === event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          if (shortcut.ignoreWhenTyping && isTypingTarget(event.target)) continue;
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

// Common keyboard shortcuts
export const COMMON_SHORTCUTS = {
  SAVE: { key: "s", ctrlKey: true, description: "Save (Ctrl+S)" },
  UNDO: { key: "z", ctrlKey: true, description: "Undo (Ctrl+Z)" },
  REDO: { key: "y", ctrlKey: true, description: "Redo (Ctrl+Y)" },
  DELETE: { key: "Delete", description: "Delete selected item" },
  DUPLICATE: { key: "d", ctrlKey: true, description: "Duplicate (Ctrl+D)" },
  MOVE_UP: { key: "ArrowUp", ctrlKey: true, description: "Move up (Ctrl+↑)" },
  MOVE_DOWN: { key: "ArrowDown", ctrlKey: true, description: "Move down (Ctrl+↓)" },
  ADD_COMPONENT: { key: "n", ctrlKey: true, description: "Add component (Ctrl+N)" },
  TOGGLE_PREVIEW: { key: "p", ctrlKey: true, description: "Toggle preview (Ctrl+P)" },
  CUT: { key: "x", ctrlKey: true, description: "Cut (Ctrl+X)" },
  COPY: { key: "c", ctrlKey: true, description: "Copy (Ctrl+C)" },
  PASTE: { key: "v", ctrlKey: true, description: "Paste (Ctrl+V)" },
} as const;
