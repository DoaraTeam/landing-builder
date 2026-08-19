"use client";

import { useEffect, useRef, useCallback } from "react";
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

  const saveData = useCallback(async () => {
    try {
      await onSave();
      lastSavedRef.current = dataRef.current;
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

    // Check if data actually changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
      return;
    }

    dataRef.current = data;

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

  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(lastSavedRef.current);

  // Function to mark current data as saved (for manual saves)
  const markAsSaved = useCallback(
    (dataToMark?: unknown) => {
      lastSavedRef.current = dataToMark ?? data;
    },
    [data]
  );

  return {
    hasUnsavedChanges,
    forceSave: saveData,
    markAsSaved,
  };
}
