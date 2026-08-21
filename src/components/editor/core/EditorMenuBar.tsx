"use client";

import type { EditMenuState } from "@/components/editor/core/EditableLandingPage";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COMMON_SHORTCUTS, getShortcutKeys } from "@/hooks/use-keyboard-shortcuts";
import {
  Upload,
  Download,
  LayoutTemplate,
  FilePlus,
  FolderOpen,
  Copy,
  Pencil,
  Keyboard,
  BookOpen,
  Undo2,
  Redo2,
  Scissors,
  ClipboardPaste,
  CheckSquare,
} from "lucide-react";

// Plain "Ctrl+Shift+N"-style label for a File/Edit menu item's shortcut hint.
const shortcutLabel = (shortcut: Parameters<typeof getShortcutKeys>[0]) =>
  getShortcutKeys(shortcut).join("+");

type OpenMenu = "file" | "edit" | "template" | "help" | null;

interface EditorMenuBarProps {
  // Inline site-title editing
  siteName: string;
  editingTitle: boolean;
  titleDraft: string;
  onTitleDraftChange: (value: string) => void;
  onStartEditingTitle: () => void;
  onCancelEditingTitle: () => void;
  onCommitTitleEdit: () => void;

  openMenu: OpenMenu;
  onOpenMenuChange: (menu: OpenMenu) => void;

  // File menu
  onNewPage: () => void;
  onOpenPage: () => void;
  onMakeACopy: () => void;
  onRenamePage: () => void;

  // Edit menu
  editMenuState: EditMenuState;

  // Template menu
  onChangeTemplateClick: () => void;
  onExportRequest: () => void;
  onImportRequest: () => void;

  // Help menu
  onHelpClick: () => void;
}

/** The site-title editor + File/Edit/Template/Help dropdown menus in the
 * editor's top header bar — extracted verbatim from editor/page.tsx. */
export function EditorMenuBar({
  siteName,
  editingTitle,
  titleDraft,
  onTitleDraftChange,
  onStartEditingTitle,
  onCancelEditingTitle,
  onCommitTitleEdit,
  openMenu,
  onOpenMenuChange,
  onNewPage,
  onOpenPage,
  onMakeACopy,
  onRenamePage,
  editMenuState,
  onChangeTemplateClick,
  onExportRequest,
  onImportRequest,
  onHelpClick,
}: EditorMenuBarProps) {
  return (
    <>
      {editingTitle ? (
        <input
          autoFocus
          value={titleDraft}
          onChange={(e) => onTitleDraftChange(e.target.value)}
          onBlur={onCommitTitleEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitTitleEdit();
            if (e.key === "Escape") onCancelEditingTitle();
          }}
          className="text-sm font-medium text-gray-900 max-w-[16rem] rounded border border-blue-400 px-1 outline-none"
        />
      ) : (
        <button
          onClick={onStartEditingTitle}
          title="Click to rename"
          className="text-sm font-medium text-gray-900 truncate max-w-[16rem] rounded px-1 text-left hover:bg-gray-100"
        >
          {siteName}
        </button>
      )}

      <div className="h-6 w-px bg-gray-300" />
      <div className="flex items-center gap-0.5">
        <DropdownMenu
          open={openMenu === "file"}
          onOpenChange={(isOpen) => onOpenMenuChange(isOpen ? "file" : null)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
            >
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setTimeout(onNewPage, 0)}>
              <FilePlus className="h-4 w-4" />
              New
              <DropdownMenuShortcut>
                {shortcutLabel(COMMON_SHORTCUTS.NEW_PAGE)}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeout(onOpenPage, 0)}>
              <FolderOpen className="h-4 w-4" />
              Open
              <DropdownMenuShortcut>
                {shortcutLabel(COMMON_SHORTCUTS.OPEN_PAGE)}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMakeACopy()}>
              <Copy className="h-4 w-4" />
              Make a Copy
              <DropdownMenuShortcut>
                {shortcutLabel(COMMON_SHORTCUTS.MAKE_A_COPY)}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTimeout(onRenamePage, 0)}>
              <Pencil className="h-4 w-4" />
              Rename
              <DropdownMenuShortcut>
                {shortcutLabel(COMMON_SHORTCUTS.RENAME_PAGE)}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu
          open={openMenu === "edit"}
          onOpenChange={(isOpen) => onOpenMenuChange(isOpen ? "edit" : null)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
            >
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              disabled={!editMenuState.canUndo}
              onClick={() => editMenuState.undo()}
            >
              <Undo2 className="h-4 w-4" />
              Undo
              <DropdownMenuShortcut>{shortcutLabel(COMMON_SHORTCUTS.UNDO)}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editMenuState.canRedo}
              onClick={() => editMenuState.redo()}
            >
              <Redo2 className="h-4 w-4" />
              Redo
              <DropdownMenuShortcut>{shortcutLabel(COMMON_SHORTCUTS.REDO)}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!editMenuState.canCut} onClick={() => editMenuState.cut()}>
              <Scissors className="h-4 w-4" />
              Cut
              <DropdownMenuShortcut>{shortcutLabel(COMMON_SHORTCUTS.CUT)}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editMenuState.canCopy}
              onClick={() => editMenuState.copy()}
            >
              <Copy className="h-4 w-4" />
              Copy
              <DropdownMenuShortcut>{shortcutLabel(COMMON_SHORTCUTS.COPY)}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editMenuState.canPaste}
              onClick={() => editMenuState.paste()}
            >
              <ClipboardPaste className="h-4 w-4" />
              Paste
              <DropdownMenuShortcut>{shortcutLabel(COMMON_SHORTCUTS.PASTE)}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <CheckSquare className="h-4 w-4" />
              Select All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu
          open={openMenu === "template"}
          onOpenChange={(isOpen) => onOpenMenuChange(isOpen ? "template" : null)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
            >
              Template
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setTimeout(() => onChangeTemplateClick(), 0)}>
              <LayoutTemplate className="h-4 w-4 text-amber-600" />
              Change Template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTimeout(() => onExportRequest(), 0)}>
              <Download className="h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeout(() => onImportRequest(), 0)}>
              <Upload className="h-4 w-4" />
              Import
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu
          open={openMenu === "help"}
          onOpenChange={(isOpen) => onOpenMenuChange(isOpen ? "help" : null)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
            >
              Help
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setTimeout(() => onHelpClick(), 0)}>
              <Keyboard className="h-4 w-4 text-gray-600" />
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <BookOpen className="h-4 w-4" />
              Documentation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
