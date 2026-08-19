"use client";

import { useCallback, useMemo, useReducer } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type HistoryAction<T> =
  | { type: "SET"; payload: T }
  | { type: "REPLACE"; payload: T }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; payload: T };

function createHistoryReducer<T>(maxHistory: number) {
  return (state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> => {
    switch (action.type) {
      case "SET": {
        const past = [...state.past, state.present].slice(-maxHistory);
        return { past, present: action.payload, future: [] };
      }
      case "REPLACE":
        return { ...state, present: action.payload, future: [] };
      case "UNDO": {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        return {
          past: state.past.slice(0, -1),
          present: previous,
          future: [state.present, ...state.future],
        };
      }
      case "REDO": {
        if (state.future.length === 0) return state;
        const [next, ...rest] = state.future;
        return { past: [...state.past, state.present], present: next, future: rest };
      }
      case "RESET":
        return { past: [], present: action.payload, future: [] };
      default:
        return state;
    }
  };
}

export interface UseUndoRedoOptions {
  // Oldest entries are dropped once the stack grows past this many steps.
  maxHistory?: number;
}

export interface UseUndoRedoReturn<T> {
  state: T;
  // Push a new state onto history — use for any user-initiated content change.
  set: (next: T) => void;
  // Swap the current state without touching undo/redo history — use for
  // internal bookkeeping updates (e.g. substituting persisted URLs in place
  // of temporary ones) that shouldn't themselves become an undo step.
  replace: (next: T) => void;
  // Replace the state AND clear all history — use when switching to an
  // unrelated document (e.g. a different page, or a restored version), where
  // undoing back into the previous document's history wouldn't make sense.
  reset: (next: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Generic undo/redo history for a single piece of state. Not tied to any
 * particular document shape — the caller decides what counts as an
 * undoable step by choosing when to call `set` vs `replace`.
 */
export function useUndoRedo<T>(initial: T, options: UseUndoRedoOptions = {}): UseUndoRedoReturn<T> {
  const { maxHistory = 50 } = options;
  const reducer = useMemo(() => createHistoryReducer<T>(maxHistory), [maxHistory]);
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    present: initial,
    future: [],
  } as HistoryState<T>);

  const set = useCallback((payload: T) => dispatch({ type: "SET", payload }), []);
  const replace = useCallback((payload: T) => dispatch({ type: "REPLACE", payload }), []);
  const reset = useCallback((payload: T) => dispatch({ type: "RESET", payload }), []);
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  return {
    state: state.present,
    set,
    replace,
    reset,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
