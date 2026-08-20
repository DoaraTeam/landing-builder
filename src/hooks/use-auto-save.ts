"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AutoSaveProps {
  data: unknown;
  onSave: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface AutoSaveReturn {
  hasUnsavedChanges: boolean;
  forceSave: () => Promise<void>;
  markAsSaved: (dataToMark?: unknown) => void;
}

export function useAutoSave({
  data,
  onSave,
  delay = 8000,
  enabled = true,
}: AutoSaveProps): AutoSaveReturn {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef(data);
  const lastSavedRef = useRef(data);
  const isInitialRender = useRef(true);
  // Tracked explicitly rather than derived via JSON.stringify(data) !==
  // JSON.stringify(lastSavedRef.current) on every render — that deep-compares
  // the whole page (every component's config, any embedded images) each time
  // this component re-renders for any reason at all (selecting a block,
  // opening a dropdown, changing zoom%), not just when data actually changes.
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveData = useCallback(async () => {
    try {
      await onSave();
      lastSavedRef.current = dataRef.current;
      setHasUnsavedChanges(false);
      // No success toast here — the "All changes saved" indicator in the
      // toolbar already covers this, and a toast on every autosave tick
      // would fire too often to be useful.
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast.error({
        title: "Auto-save failed",
        description:
          error instanceof Error
            ? `Auto-save error: ${error.message}`
            : "Failed to save changes automatically. Manual save recommended.",
      });
    }
  }, [onSave, toast]);

  useEffect(() => {
    if (!enabled) return;

    // Skip auto-save on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      dataRef.current = data;
      return;
    }

    // `data` only gets a new reference when the caller sets genuinely new
    // state (a real edit) — reference equality is enough here, no need to
    // deep-compare the whole page tree on every change.
    if (data === lastSavedRef.current) {
      return;
    }

    dataRef.current = data;
    setHasUnsavedChanges(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(saveData, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveData, delay, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Function to mark current data as saved (for manual saves)
  const markAsSaved = useCallback((dataToMark?: unknown) => {
    lastSavedRef.current = dataToMark ?? dataRef.current;
    setHasUnsavedChanges(false);
  }, []);

  return {
    hasUnsavedChanges,
    forceSave: saveData,
    markAsSaved,
  };
}
