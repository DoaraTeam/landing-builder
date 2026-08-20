"use client";

import { useEffect, useMemo, useState } from "react";
import { LandingPage, SubPage, LandingConfig, Theme, PageNavigation } from "@/types/landing";
import {
  EditableLandingPage,
  DISABLED_EDIT_MENU_STATE,
  type EditMenuState,
} from "@/components/editor/core/EditableLandingPage";
import PageTree, { MAIN_PAGE_ID } from "@/components/editor/core/PageTree";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";

interface MultiPageEditorProps {
  page: LandingPage;
  config: LandingConfig;
  onSave: (page: LandingPage) => Promise<void>;
  onSaveCustomTheme?: (theme: Theme, themeId: string) => Promise<void>;
  // Lifted up so AdminDashboard can force it collapsed (e.g. when opening the
  // version history sidebar) — MultiPageEditor still owns the localStorage
  // persistence side effect, just not the boolean itself.
  sidebarCollapsed: boolean;
  onSidebarCollapsedChange: (collapsed: boolean) => void;
  // Read-only preview mode (browsing version history) — see EditableLandingPage.
  readOnly?: boolean;
  // Bubbled straight through from whichever page (main or active sub-page)
  // is currently mounted — see EditableLandingPage's EditMenuState.
  onEditMenuStateChange?: (state: EditMenuState) => void;
  // Passed straight through to whichever page is currently mounted — see
  // EditableLandingPage's exportImportRequest.
  exportImportRequest?: { tab: "export" | "import" } | null;
}

const SIDEBAR_COLLAPSED_STORAGE_KEY = "landing-builder:page-sidebar-collapsed";

export default function MultiPageEditor({
  page,
  config,
  onSave,
  onSaveCustomTheme,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  readOnly = false,
  onEditMenuStateChange,
  exportImportRequest,
}: MultiPageEditorProps) {
  const [editingPage, setEditingPage] = useState<LandingPage>(page);
  const [activePageId, setActivePageId] = useState<string | null>(MAIN_PAGE_ID);
  const [pageEditorDirty, setPageEditorDirty] = useState(false);
  const [pendingPageSelection, setPendingPageSelection] = useState<{ id: string | null } | null>(
    null
  );
  // The section the page-tree sidebar currently has active — purely a visual
  // highlight passed down to the canvas, not a "select for editing" action.
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  // A fresh object each time the sidebar drag-reorders the active page's
  // sections, so EditableLandingPage's effect that consumes it always
  // re-fires even if the id list happens to repeat.
  const [reorderRequest, setReorderRequest] = useState<{ ids: string[] } | null>(null);

  // Sync editingPage when prop page changes (e.g., when applying version)
  useEffect(() => {
    setEditingPage(page);
  }, [page]);

  // Restore the sidebar's collapsed/expanded preference on first mount only.
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (stored !== null) {
      onSidebarCollapsedChange(stored === "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSidebarCollapsed = () => {
    const next = !sidebarCollapsed;
    localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
    onSidebarCollapsedChange(next);
  };

  const subPages = editingPage.subPages || [];

  // Neither EditableLandingPage instance is mounted in this (practically
  // unreachable, defensive-only) state, so nothing would otherwise clear a
  // stale Edit-menu state left over from whichever page was active before.
  useEffect(() => {
    if (activePageId === null) {
      onEditMenuStateChange?.(DISABLED_EDIT_MENU_STATE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId]);

  // Switching the active page resets whichever EditableLandingPage instance is
  // mounted for it (new page prop -> its own state re-syncs), which would
  // silently discard any unsaved ComponentEditor edits on the page being left.
  // Confirm first, same pattern as switching selected components within a page.
  const requestSelectPage = (pageId: string) => {
    if (pageEditorDirty && pageId !== activePageId) {
      setPendingPageSelection({ id: pageId });
    } else {
      setActivePageId(pageId);
    }
  };

  const handleUpdateSubPages = (updated: SubPage[]) => {
    const updatedPage = {
      ...editingPage,
      subPages: updated,
    };
    setEditingPage(updatedPage);
    onSave(updatedPage);

    // If the active sub-page no longer exists (deleted), fall back to whichever
    // page was immediately before it in tree order. Main Page is always first
    // and can't be deleted, so this always resolves to a real page in
    // practice — the null branch is a defensive fallback, not a reachable case
    // today, and renders an empty canvas state instead of erroring.
    if (
      activePageId &&
      activePageId !== MAIN_PAGE_ID &&
      !updated.some((sp) => sp.id === activePageId)
    ) {
      const order = [
        MAIN_PAGE_ID,
        ...[...subPages].sort((a, b) => a.order - b.order).map((sp) => sp.id),
      ];
      const deletedIndex = order.indexOf(activePageId);
      setActivePageId(deletedIndex > 0 ? order[deletedIndex - 1] : null);
    }
  };

  const handleUpdateMainPage = async (updated: LandingPage) => {
    // Preserve multi-page properties
    const updatedPage = {
      ...updated,
      subPages: editingPage.subPages, // Preserve subPages
      navigation: editingPage.navigation, // Preserve navigation
    };
    setEditingPage(updatedPage);
    await onSave(updatedPage);
  };

  const handleUpdateSubPage = async (updated: SubPage) => {
    const updatedSubPages = subPages.map((sp) => (sp.id === updated.id ? updated : sp));
    const updatedPage = { ...editingPage, subPages: updatedSubPages };
    setEditingPage(updatedPage);
    await onSave(updatedPage);
  };

  // Navigation lives on the top-level page regardless of which page (main or
  // sub-page) is being viewed in EditableLandingPage, so it's saved directly
  // here rather than through the per-view onSave/onUpdateMainPage/onUpdateSubPage
  // paths, which each interpret an incoming page differently.
  const handleUpdateNavigation = (navigation: PageNavigation) => {
    const updatedPage = { ...editingPage, navigation };
    setEditingPage(updatedPage);
    onSave(updatedPage);
  };

  const activeSubPage =
    activePageId && activePageId !== MAIN_PAGE_ID
      ? subPages.find((sp) => sp.id === activePageId)
      : null;

  // Stable reference unless the underlying data actually changes — EditableLandingPage
  // re-syncs (and resets undo history) whenever its `page` prop identity changes, so a
  // fresh object literal on every render here would re-trigger that on every unrelated
  // re-render (e.g. bubbling Edit-menu state up), which itself re-renders this component
  // — an infinite loop.
  const activeSubPageData = useMemo(() => {
    if (!activeSubPage) return null;
    return {
      ...editingPage,
      title: activeSubPage.title,
      slug: activeSubPage.slug,
      components: activeSubPage.components,
    };
  }, [editingPage, activeSubPage]);

  return (
    <div className="flex h-full">
      <PageTree
        mainPageTitle={editingPage.title}
        mainPageComponents={editingPage.components}
        subPages={subPages}
        activePageId={activePageId ?? ""}
        onSelectPage={requestSelectPage}
        onUpdateSubPages={handleUpdateSubPages}
        onSelectSection={setActiveSectionId}
        onReorderSections={(ids) => setReorderRequest({ ids })}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
        readOnly={readOnly}
      />

      <div className="min-w-0 flex-1 overflow-y-auto">
        {activePageId === MAIN_PAGE_ID && (
          <EditableLandingPage
            page={editingPage}
            config={config}
            onSave={handleUpdateMainPage}
            onSaveCustomTheme={onSaveCustomTheme}
            onUpdateNavigation={handleUpdateNavigation}
            onComponentEditorDirtyChange={setPageEditorDirty}
            onEditMenuStateChange={onEditMenuStateChange}
            activeSectionId={activeSectionId}
            reorderRequest={reorderRequest}
            exportImportRequest={exportImportRequest}
            readOnly={readOnly}
          />
        )}

        {activeSubPage && activeSubPageData && (
          <EditableLandingPage
            key={activeSubPage.id}
            page={activeSubPageData}
            config={config}
            onSave={async (updatedSubPageData) => {
              await handleUpdateSubPage({
                ...activeSubPage,
                components: updatedSubPageData.components,
              });
            }}
            onSaveCustomTheme={onSaveCustomTheme}
            onUpdateNavigation={handleUpdateNavigation}
            onComponentEditorDirtyChange={setPageEditorDirty}
            onEditMenuStateChange={onEditMenuStateChange}
            activeSectionId={activeSectionId}
            reorderRequest={reorderRequest}
            exportImportRequest={exportImportRequest}
            readOnly={readOnly}
          />
        )}

        {activePageId === null && (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No page selected
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingPageSelection}
        onOpenChange={(open) => !open && setPendingPageSelection(null)}
        title="Discard unsaved changes?"
        description="You have unsaved changes to the current component. Switching pages now will discard them."
        confirmText="Discard"
        variant="destructive"
        onConfirm={() => {
          if (pendingPageSelection) {
            setActivePageId(pendingPageSelection.id);
          }
          setPendingPageSelection(null);
        }}
      />
    </div>
  );
}
