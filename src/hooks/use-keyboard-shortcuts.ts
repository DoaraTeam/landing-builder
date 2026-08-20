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

// Common keyboard shortcuts. `description` is a plain action label — the
// key combo itself is derived from key/ctrlKey/shiftKey/altKey via
// getShortcutKeys() below, wherever it needs to be displayed (dropdown menu
// items, the Keyboard Shortcuts help panel), rather than being duplicated as
// text here.
export const COMMON_SHORTCUTS = {
  SAVE: { key: "s", ctrlKey: true, description: "Save changes" },
  UNDO: { key: "z", ctrlKey: true, description: "Undo" },
  REDO: { key: "y", ctrlKey: true, description: "Redo" },
  DELETE: { key: "Delete", description: "Delete selected component" },
  ESCAPE: { key: "Escape", description: "Close panels/dialogs" },
  DUPLICATE: { key: "d", ctrlKey: true, description: "Duplicate component" },
  MOVE_UP: { key: "ArrowUp", ctrlKey: true, description: "Move component up" },
  MOVE_DOWN: { key: "ArrowDown", ctrlKey: true, description: "Move component down" },
  ADD_COMPONENT: { key: "n", ctrlKey: true, description: "Add component" },
  TOGGLE_PREVIEW: { key: "p", ctrlKey: true, description: "Toggle preview" },
  CUT: { key: "x", ctrlKey: true, description: "Cut component" },
  COPY: { key: "c", ctrlKey: true, description: "Copy component" },
  PASTE: { key: "v", ctrlKey: true, description: "Paste component" },
  // Page/project-level (File menu) — distinct from the component-level ones
  // above, so they can't share the same combo (e.g. New is Ctrl+Alt+N, not
  // Ctrl+N, since that's already Add Component).
  NEW_PAGE: { key: "n", ctrlKey: true, altKey: true, description: "New page" },
  OPEN_PAGE: { key: "o", ctrlKey: true, description: "Open page" },
  MAKE_A_COPY: { key: "d", ctrlKey: true, altKey: true, description: "Make a copy" },
  RENAME_PAGE: { key: "F2", description: "Rename page" },
} as const;

const KEY_DISPLAY_NAMES: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  Delete: "Del",
  Escape: "Esc",
};

/**
 * The combo a shortcut is bound to, as display segments (e.g.
 * ["Ctrl", "Shift", "N"]) — for a dropdown menu hint, join with "+"; for the
 * Keyboard Shortcuts panel's one-badge-per-key layout, use as-is. Single
 * source of truth so every UI surface showing a shortcut always matches what
 * useKeyboardShortcuts actually listens for.
 */
export function getShortcutKeys(
  shortcut: Pick<KeyboardShortcut, "key" | "ctrlKey" | "shiftKey" | "altKey">
): string[] {
  const keys: string[] = [];
  if (shortcut.ctrlKey) keys.push("Ctrl");
  if (shortcut.shiftKey) keys.push("Shift");
  if (shortcut.altKey) keys.push("Alt");
  keys.push(
    KEY_DISPLAY_NAMES[shortcut.key] ??
      (shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key)
  );
  return keys;
}
