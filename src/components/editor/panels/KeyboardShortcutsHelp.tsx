"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Command } from "lucide-react";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["Ctrl", "S"], description: "Save changes" },
  { keys: ["Ctrl", "N"], description: "Add new component" },
  { keys: ["Ctrl", "P"], description: "Toggle preview" },
  { keys: ["Ctrl", "↑"], description: "Move component up" },
  { keys: ["Ctrl", "↓"], description: "Move component down" },
  { keys: ["Delete"], description: "Delete selected component" },
  { keys: ["Escape"], description: "Close panels/dialogs" },
  { keys: ["Ctrl", "D"], description: "Duplicate component" },
  { keys: ["Ctrl", "Z"], description: "Undo action" },
  { keys: ["Ctrl", "Y"], description: "Redo action" },
  { keys: ["Ctrl", "X"], description: "Cut selected component" },
  { keys: ["Ctrl", "C"], description: "Copy selected component" },
  { keys: ["Ctrl", "V"], description: "Paste component" },
];

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
