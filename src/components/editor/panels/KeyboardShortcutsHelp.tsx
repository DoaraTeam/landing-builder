"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Command } from "lucide-react";
import { COMMON_SHORTCUTS, getShortcutKeys } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

// Display order — grouped page-level first, then component-editing ones.
// Sourced from COMMON_SHORTCUTS so this list can never drift from what
// useKeyboardShortcuts actually listens for.
const SHORTCUT_ORDER = [
  "NEW_PAGE",
  "OPEN_PAGE",
  "MAKE_A_COPY",
  "RENAME_PAGE",
  "SAVE",
  "TOGGLE_PREVIEW",
  "UNDO",
  "REDO",
  "CUT",
  "COPY",
  "PASTE",
  "DUPLICATE",
  "ADD_COMPONENT",
  "MOVE_UP",
  "MOVE_DOWN",
  "DELETE",
  "ESCAPE",
] as const satisfies ReadonlyArray<keyof typeof COMMON_SHORTCUTS>;

const shortcuts = SHORTCUT_ORDER.map((name) => ({
  keys: getShortcutKeys(COMMON_SHORTCUTS[name]),
  description: COMMON_SHORTCUTS[name].description,
}));

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-1">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <div key={keyIndex} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs px-2 py-1 font-mono">
                      {key === "Ctrl" ? (
                        <div className="flex items-center gap-1">
                          <Command className="h-3 w-3" />
                          <span>Ctrl</span>
                        </div>
                      ) : (
                        key
                      )}
                    </Badge>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-gray-400">+</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
