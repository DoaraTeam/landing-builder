"use client";

import { useEffect, useState } from "react";

// Module-level store (not React state) so the clipboard is shared across the
// whole app — e.g. copying a section while editing the main page, then
// pasting it into a sub-page's editor, which a per-component state couldn't
// do. Mirrors the shared-store pattern already used by use-toast.ts.
let clipboardValue: unknown = null;
const listeners = new Set<(value: unknown) => void>();

function setClipboardValue(value: unknown) {
  clipboardValue = value;
  listeners.forEach((listener) => listener(value));
}

export interface UseClipboardReturn<T> {
  value: T | null;
  copy: (item: T) => void;
  clear: () => void;
}

/**
 * Generic single-slot clipboard shared across every useClipboard<T>() call in
 * the app, regardless of T — like the OS clipboard, callers are expected to
 * only read back what they themselves put in.
 */
export function useClipboard<T>(): UseClipboardReturn<T> {
  const [value, setValue] = useState<T | null>(clipboardValue as T | null);

  useEffect(() => {
    const listener = (next: unknown) => setValue(next as T | null);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    value,
    copy: (item: T) => setClipboardValue(item),
    clear: () => setClipboardValue(null),
  };
}
