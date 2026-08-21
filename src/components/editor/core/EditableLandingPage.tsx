"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LandingPage,
  ComponentConfig,
  Theme,
  LandingConfig,
  PageNavigation,
} from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { EditableBlock } from "@/components/editor/core/EditableBlock";
import { ComponentEditor } from "@/components/editor/core/ComponentEditor";
import { EditableLandingPageToolbar } from "@/components/editor/core/EditableLandingPageToolbar";
import { EditableLandingPageDialogs } from "@/components/editor/core/EditableLandingPageDialogs";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import { useHeaderTabSync } from "@/hooks/use-header-tab-sync";
import { useComponentClipboard } from "@/hooks/use-component-clipboard";
import { useComponentActions } from "@/hooks/use-component-actions";
import { usePageSettings } from "@/hooks/use-page-settings";
import { useCanvasDnd } from "@/hooks/use-canvas-dnd";
import { useCanvasZoom } from "@/hooks/use-canvas-zoom";
import { processImages } from "@/lib/process-images";
import { getTheme, applyTheme } from "@/lib/themes";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { SortableItem } from "./SortableItem";

// The Edit menu (Undo/Redo/Cut/Copy/Paste) lives in the outer editor chrome
// (AdminDashboard), outside this component, but the state it acts on
// (undo history, current selection, clipboard) lives in here — this is what
// gets bubbled up via onEditMenuStateChange so that menu can render/act on it.
export interface EditMenuState {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  canCut: boolean;
  canCopy: boolean;
  canPaste: boolean;
  cut: () => void;
  copy: () => void;
  paste: () => void;
}

export const DISABLED_EDIT_MENU_STATE: EditMenuState = {
  canUndo: false,
  canRedo: false,
  undo: () => {},
  redo: () => {},
  canCut: false,
  canCopy: false,
  canPaste: false,
  cut: () => {},
  copy: () => {},
  paste: () => {},
};

interface EditableLandingPageProps {
  page: LandingPage;
  theme?: Theme;
  config: LandingConfig;
  onSave: (page: LandingPage) => Promise<void>;
  onSaveCustomTheme?: (theme: Theme, themeId: string) => Promise<void>;
  onUpdateNavigation?: (navigation: PageNavigation) => void;
  // Reports whether ComponentEditor has unsaved edits, so a parent that
  // switches between multiple pages (MultiPageEditor) can guard against
  // silently discarding them when switching away from this page.
  onComponentEditorDirtyChange?: (isDirty: boolean) => void;
  // Bubbles up the current Undo/Redo/Cut/Copy/Paste state so the outer
  // editor chrome's Edit menu can render and act on it — see EditMenuState.
  onEditMenuStateChange?: (state: EditMenuState) => void;
  // The component id the page-tree sidebar's section list currently has
  // active. Only drives the visual highlight on that block — it does not
  // open ComponentEditor, since clicking a section tab is navigation, not an
  // edit intent.
  activeSectionId?: string | null;
  // Set to a fresh object whenever the page-tree sidebar drag-reorders this
  // page's sections, carrying the new component id order to apply.
  reorderRequest?: { ids: string[] } | null;
  // Set to a fresh object whenever the outer editor chrome's File > Export or
  // Template > Import menu item is clicked, so this can open its own
  // Export/Import sheet already on the right tab.
  exportImportRequest?: { tab: "export" | "import" } | null;
  // When true, renders this page as a read-only preview (used for browsing
  // version history) — every edit surface (toolbar actions, drag-reorder,
  // component selection/ComponentEditor, autosave, keyboard shortcuts) is
  // inert. The canvas still renders live components, just non-interactively.
  readOnly?: boolean;
  // Bubbles up autosave's hasUnsavedChanges so the outer editor chrome can
  // warn before a reload/tab-close/navigate-away would silently drop
  // whatever hasn't been autosaved yet.
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

// A zero-height hover strip rendered between (and around) sections. Hovering
// near the seam reveals a line + "+" button to insert a new section right
// there, instead of only ever being able to append via the toolbar. The
// outermost canvas card clips overflow (for its rounded corners), so the
// very first/last divider must not protrude past the edge they sit on —
// `edge` restricts which direction the hover zone extends.
function InsertSectionDivider({ onClick, edge }: { onClick: () => void; edge?: "top" | "bottom" }) {
  return (
    <div className="group/insert relative z-20 h-0">
      <div
        className={`absolute inset-x-0 flex items-center justify-center ${
          edge === "top" ? "top-0 h-6" : edge === "bottom" ? "bottom-0 h-6" : "-top-3 -bottom-3"
        }`}
      >
        <div className="absolute inset-x-0 h-px bg-blue-400 opacity-0 transition-opacity group-hover/insert:opacity-100" />
        <button
          type="button"
          onClick={onClick}
          className="relative flex h-6 w-6 items-center justify-center rounded-full border border-blue-400 bg-white text-blue-600 opacity-0 shadow-sm transition-opacity hover:bg-blue-50 group-hover/insert:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * EditableLandingPage - Visual editor for landing pages
 * Wraps components in EditableBlock, shows ComponentEditor panel
 */
export function EditableLandingPage({
  page,
  theme,
  config,
  onSave,
  onSaveCustomTheme,
  onUpdateNavigation,
  onComponentEditorDirtyChange,
  onEditMenuStateChange,
  activeSectionId,
  reorderRequest,
  exportImportRequest,
  readOnly = false,
  onUnsavedChangesChange,
}: EditableLandingPageProps) {
  const {
    state: editingPage,
    set: setEditingPage,
    replace: replaceEditingPage,
    reset: resetEditingPage,
    undo: undoEditingPage,
    redo: redoEditingPage,
    canUndo,
    canRedo,
  } = useUndoRedo<LandingPage>(page);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  // Where a new (non-header) section should be inserted: an index into the
  // sorted components list, or null to append at the end (the toolbar "+"
  // button's behavior). Set by the hover "+" between/around sections.
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customCodeOpen, setCustomCodeOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const [exportImportTab, setExportImportTab] = useState<"export" | "import">("export");
  const [themeManagerOpen, setThemeManagerOpen] = useState(false);
  const [navigationSettingsOpen, setNavigationSettingsOpen] = useState(false);
  const [componentEditorDirty, setComponentEditorDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{ id: string | null } | null>(null);
  const { toast } = useToast();
  const { zoomPercent, setZoomPercent, canvasWrapperRef, canvasContentRef, handleFitZoom } =
    useCanvasZoom();

  // Mirrors of state that several block-level handlers below need to read
  // but shouldn't have to depend on — depending on them directly would give
  // those handlers a new identity on every selection change/content edit,
  // which (combined with EditableBlock's React.memo) would re-render every
  // block on the canvas instead of just the one that actually changed.
  const editingPageRef = useRef(editingPage);
  useEffect(() => {
    editingPageRef.current = editingPage;
  }, [editingPage]);
  const selectedComponentIdRef = useRef(selectedComponentId);
  useEffect(() => {
    selectedComponentIdRef.current = selectedComponentId;
  }, [selectedComponentId]);
  const componentEditorDirtyRef = useRef(componentEditorDirty);
  useEffect(() => {
    componentEditorDirtyRef.current = componentEditorDirty;
  }, [componentEditorDirty]);

  // Switching the selected component resets ComponentEditor's local edits (it
  // re-syncs from the newly selected component's config). If there are
  // unsaved edits, confirm before discarding them instead of switching silently.
  const requestSelectComponent = useCallback((id: string | null) => {
    if (componentEditorDirtyRef.current && id !== selectedComponentIdRef.current) {
      setPendingSelection({ id });
    } else {
      setSelectedComponentId(id);
    }
  }, []);

  const selectedComponent = editingPage.components.find((c) => c.id === selectedComponentId);

  // Sync editingPage when prop page changes (e.g., when applying version).
  // Resets undo history too — undoing across an unrelated document swap
  // wouldn't make sense.
  useEffect(() => {
    resetEditingPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Apply theme when page loads or theme changes
  useEffect(() => {
    const currentTheme = getTheme(editingPage.theme || "modern", config.themes);
    applyTheme(currentTheme);
  }, [editingPage.theme, config.themes]);

  const { syncHeaderTabs } = useHeaderTabSync({ editingPage, setEditingPage, editingPageRef });

  // Preview page - opens draft preview, not the published page
  const handlePreview = async () => {
    try {
      // Save current state before preview
      await onSave(editingPage);

      // Small delay to ensure save completes
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Open preview page (shows draft)
      window.open("/preview", "_blank");
    } catch (error) {
      console.error("Failed to save before preview:", error);
      // Open preview anyway
      window.open("/preview", "_blank");
    }
  };

  // Note: "Back to Dashboard" removed in new flow
  // Admin page is now the editor itself, no separate dashboard

  // Auto-save functionality
  const { hasUnsavedChanges, markAsSaved } = useAutoSave({
    data: editingPage,
    onSave: async () => {
      await onSave(editingPage);
    },
    delay: 5000, // Auto-save every 5 seconds
    enabled: !readOnly,
  });

  // Bubble hasUnsavedChanges up so the outer editor chrome can warn before a
  // reload/tab-close/navigate-to-home would silently drop it. Reports false
  // on unmount (e.g. switching away to a different page) so a stale "true"
  // never lingers after the instance that owned it is gone.
  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);
  useEffect(() => {
    return () => onUnsavedChangesChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The page-tree sidebar drag-reordered this page's sections — reorder the
  // live components (preserving their current, possibly-unsaved config) and
  // persist immediately, same as sub-page drag-reorder already does, so the
  // sidebar's own list doesn't snap back to the old order.
  useEffect(() => {
    if (!reorderRequest) return;

    const byId = new Map(editingPage.components.map((c) => [c.id, c]));
    const reordered = reorderRequest.ids
      .map((id) => byId.get(id))
      .filter((c): c is ComponentConfig => !!c);
    const reorderedIds = new Set(reorderRequest.ids);
    const remaining = editingPage.components.filter((c) => !reorderedIds.has(c.id));

    const updatedComponents = [...reordered, ...remaining].map((c, i) => ({ ...c, order: i }));
    const updatedPage = { ...editingPage, components: updatedComponents };

    setEditingPage(updatedPage);
    onSave(updatedPage);
    setTimeout(() => markAsSaved(updatedPage), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reorderRequest]);

  // The outer editor chrome's File > Export or Template > Import menu item
  // was clicked — open the Export/Import sheet already on the right tab.
  useEffect(() => {
    if (!exportImportRequest) return;
    setExportImportTab(exportImportRequest.tab);
    setExportImportOpen(true);
  }, [exportImportRequest]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...COMMON_SHORTCUTS.SAVE,
        action: () => !saving && hasUnsavedChanges && handleSave(),
      },
      {
        ...COMMON_SHORTCUTS.ADD_COMPONENT,
        action: () => {
          setInsertIndex(null);
          setTemplatesOpen(true);
        },
      },
      {
        ...COMMON_SHORTCUTS.TOGGLE_PREVIEW,
        action: handlePreview,
      },
      {
        ...COMMON_SHORTCUTS.ESCAPE,
        action: () => {
          requestSelectComponent(null);
          setTemplatesOpen(false);
          setSettingsOpen(false);
          setExportImportOpen(false);
        },
      },
      {
        ...COMMON_SHORTCUTS.DELETE,
        action: () => {
          if (selectedComponentId) {
            handleDeleteComponent(selectedComponentId);
          }
        },
      },
      {
        ...COMMON_SHORTCUTS.UNDO,
        ignoreWhenTyping: true,
        action: () => canUndo && undoEditingPage(),
      },
      {
        ...COMMON_SHORTCUTS.REDO,
        ignoreWhenTyping: true,
        action: () => canRedo && redoEditingPage(),
      },
      {
        ...COMMON_SHORTCUTS.DUPLICATE,
        ignoreWhenTyping: true,
        action: () => selectedComponentId && handleDuplicateComponent(selectedComponentId),
      },
      {
        ...COMMON_SHORTCUTS.MOVE_UP,
        ignoreWhenTyping: true,
        action: () => selectedComponentId && handleMoveUp(selectedComponentId),
      },
      {
        ...COMMON_SHORTCUTS.MOVE_DOWN,
        ignoreWhenTyping: true,
        action: () => selectedComponentId && handleMoveDown(selectedComponentId),
      },
      {
        ...COMMON_SHORTCUTS.CUT,
        ignoreWhenTyping: true,
        action: () => selectedComponentId && handleCutComponent(selectedComponentId),
      },
      {
        ...COMMON_SHORTCUTS.COPY,
        ignoreWhenTyping: true,
        action: () => selectedComponentId && handleCopyComponent(selectedComponentId),
      },
      {
        ...COMMON_SHORTCUTS.PASTE,
        ignoreWhenTyping: true,
        action: () => handlePasteComponent(),
      },
    ],
    enabled: !readOnly,
  });

  // Update a component's config. Saves immediately (same pattern as the
  // section-reorder handler below) and marks the data as saved so the 5s
  // autosave timer doesn't also fire its own "Auto-saved" toast for the
  // same edit a moment later.
  const handleComponentUpdate = async (updatedComponent: ComponentConfig) => {
    const updatedComponents = editingPage.components.map((c) =>
      c.id === updatedComponent.id ? updatedComponent : c
    );

    const updatedPage = {
      ...editingPage,
      components: updatedComponents,
    };

    // Undo-worthy edit first, showing the (possibly still temporary base64)
    // image right away instead of waiting on the upload round-trip.
    setEditingPage(updatedPage);

    // Then convert any temporary base64 images to permanent files before
    // persisting — same as the top-toolbar Save flow below, and for the same
    // reason: skipping this here was letting raw (often multi-KB/MB) base64
    // data get written straight into landing-config.json, then re-sent by
    // every 5s autosave tick until the toolbar's own Save was eventually
    // clicked. replaceEditingPage (not setEditingPage) swaps the URLs in
    // without adding a second undo step — undoing back to transient base64
    // that's no longer what's actually persisted wouldn't make sense.
    const processedPage = await processImages(updatedPage);
    replaceEditingPage(processedPage);
    onSave(processedPage);
    setTimeout(() => markAsSaved(processedPage), 0);

    toast.success({
      title: "Component Updated",
      description: `${updatedComponent.type} component has been modified`,
    });
  };

  const {
    changeTemplateDialogOpen,
    setChangeTemplateDialogOpen,
    componentToChangeTemplate,
    setComponentToChangeTemplate,
    handleToggleVisibility,
    handleDeleteComponent,
    handleDuplicateComponent,
    handleOpenChangeTemplate,
    handleChangeTemplate,
    handleMoveUp,
    handleMoveDown,
  } = useComponentActions({
    editingPage,
    editingPageRef,
    setEditingPage,
    syncHeaderTabs,
    toast,
    selectedComponentIdRef,
    setSelectedComponentId,
  });

  const {
    componentClipboard,
    handleAddComponent,
    handleCopyComponent,
    handleCutComponent,
    handlePasteComponent,
  } = useComponentClipboard({
    editingPage,
    setEditingPage,
    syncHeaderTabs,
    toast,
    selectedComponentId,
    insertIndex,
    setInsertIndex,
    handleDeleteComponent,
  });

  // Bubble the current Undo/Redo/Cut/Copy/Paste state up to the outer editor
  // chrome's Edit menu, which lives outside this component. Re-runs whenever
  // anything the menu depends on changes; onEditMenuStateChange itself is
  // intentionally excluded so this doesn't loop just because the parent
  // re-rendered (same pattern as ComponentEditor's onDirtyChange bubble).
  useEffect(() => {
    if (readOnly) {
      onEditMenuStateChange?.(DISABLED_EDIT_MENU_STATE);
      return;
    }

    onEditMenuStateChange?.({
      canUndo,
      canRedo,
      undo: undoEditingPage,
      redo: redoEditingPage,
      canCut: !!selectedComponentId,
      canCopy: !!selectedComponentId,
      canPaste: !!componentClipboard.value,
      cut: () => selectedComponentId && handleCutComponent(selectedComponentId),
      copy: () => selectedComponentId && handleCopyComponent(selectedComponentId),
      paste: handlePasteComponent,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, canUndo, canRedo, selectedComponentId, componentClipboard.value, editingPage]);

  // Opens the Add Section panel targeting a specific insert position (the
  // hover "+" between/around sections), instead of always appending.
  const handleOpenInsertAt = (index: number) => {
    setInsertIndex(index);
    setTemplatesOpen(true);
  };

  const { handleSaveSettings, handleThemeChange, handleSaveCustomTheme, handleUpdateNavigation } =
    usePageSettings({
      editingPage,
      setEditingPage,
      toast,
      config,
      onSaveCustomTheme,
      onUpdateNavigation,
    });

  const { activeId, sensors, handleDragStart, handleDragEnd } = useCanvasDnd({
    editingPage,
    setEditingPage,
    toast,
  });

  // Save changes
  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    const startTime = Date.now();

    // Loading toast: an exception to the success/error/warning helpers above
    // since it's dismissed manually once the save settles, not by its own
    // timer — kept on the base toast() with a long duration as a safety net.
    const savingToast = toast({
      title: "Saving Changes...",
      description: "Processing your updates, please wait a moment",
      duration: 30000,
    });

    try {
      // Process temporary images (base64 -> permanent files)
      const processedPage = await processImages(editingPage);

      // Save to API
      await onSave(processedPage);

      // Update local state with processed page — not an undo step, since
      // undoing it would revert real image URLs back to transient base64
      // data that's no longer what's actually persisted.
      replaceEditingPage(processedPage);

      // Mark as saved to reset unsaved changes indicator (after state update)
      setTimeout(() => markAsSaved(processedPage), 0);

      // Calculate save duration
      const duration = Date.now() - startTime;
      const durationText = duration > 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;

      savingToast.dismiss();
      toast.success({
        title: "Saved Successfully!",
        description: `Landing page "${editingPage.title}" saved in ${durationText} (${editingPage.components.length} components)`,
      });
    } catch (error) {
      console.error("Save error:", error);

      const duration = Date.now() - startTime;

      savingToast.dismiss();
      toast.error({
        title: "Save Failed",
        description:
          error instanceof Error
            ? `Error after ${duration}ms: ${error.message}`
            : "Failed to save page. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Sort components by order
  const sortedComponents = useMemo(
    () => [...editingPage.components].sort((a, b) => a.order - b.order),
    [editingPage.components]
  );

  return (
    <EditModeProvider isEditMode={true}>
      <div className="min-h-screen bg-gray-100">
        <EditableLandingPageToolbar
          pageTitle={editingPage.title}
          readOnly={readOnly}
          saving={saving}
          hasUnsavedChanges={hasUnsavedChanges}
          zoomPercent={zoomPercent}
          onZoomChange={setZoomPercent}
          onFitZoom={handleFitZoom}
          components={editingPage.components}
          onToggleVisibility={handleToggleVisibility}
          onSelectComponent={requestSelectComponent}
          onAddSection={() => {
            setInsertIndex(null);
            setTemplatesOpen(true);
          }}
          onOpenTheme={() => setThemeManagerOpen(true)}
          showNavigationMenuItem={(editingPage.subPages?.length ?? 0) > 0 && !!onUpdateNavigation}
          onOpenNavigationSettings={() => setNavigationSettingsOpen(true)}
          onOpenCustomCode={() => setCustomCodeOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onSave={handleSave}
        />

        {/* Editor Content */}
        <div ref={canvasWrapperRef} className="overflow-x-auto">
          <div ref={canvasContentRef} className="w-full p-4">
            <div
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              style={
                zoomPercent !== 100
                  ? { transform: `scale(${zoomPercent / 100})`, transformOrigin: "top center" }
                  : undefined
              }
            >
              {readOnly ? (
                sortedComponents.map((component) => (
                  <div
                    key={component.id}
                    className={`w-full ${component.type === "header" ? "relative" : "overflow-hidden"}`}
                    style={
                      component.type === "header"
                        ? { position: "relative", isolation: "isolate" }
                        : undefined
                    }
                  >
                    <ComponentRenderer component={component} theme={theme} />
                  </div>
                ))
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedComponents.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedComponents.map((component, index) => (
                      <div key={component.id}>
                        <InsertSectionDivider
                          onClick={() => handleOpenInsertAt(index)}
                          edge={index === 0 ? "top" : undefined}
                        />
                        <EditableBlock
                          component={component}
                          theme={theme}
                          isSelected={
                            selectedComponentId === component.id || activeSectionId === component.id
                          }
                          onSelect={requestSelectComponent}
                          onToggleVisibility={handleToggleVisibility}
                          onDelete={handleDeleteComponent}
                          onDuplicate={handleDuplicateComponent}
                          onChangeTemplate={handleOpenChangeTemplate}
                          onMoveUp={handleMoveUp}
                          onMoveDown={handleMoveDown}
                          canMoveUp={index > 0}
                          canMoveDown={index < sortedComponents.length - 1}
                          isFirst={index === 0}
                          isLast={index === sortedComponents.length - 1}
                        />
                      </div>
                    ))}
                    {sortedComponents.length > 0 && (
                      <InsertSectionDivider
                        onClick={() => handleOpenInsertAt(sortedComponents.length)}
                        edge="bottom"
                      />
                    )}
                  </SortableContext>

                  <DragOverlay>
                    {activeId ? (
                      <div className="opacity-50 bg-white rounded-lg shadow-lg p-4 border-2 border-blue-400">
                        <div className="text-sm font-semibold text-gray-700">
                          Moving component...
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}

              {sortedComponents.length === 0 && (
                <div className="min-h-[70vh] flex items-center justify-center text-center text-gray-500">
                  <p>No components yet. Add your first component to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Component Editor Panel — always mounted (even with nothing
            selected) so it can play its close transition instead of
            vanishing instantly. Not rendered at all in read-only mode, since
            nothing can select a component to edit there. */}
        {!readOnly && (
          <ComponentEditor
            component={selectedComponent ?? null}
            onUpdate={handleComponentUpdate}
            onClose={() => setSelectedComponentId(null)}
            allComponents={editingPage.components}
            subPages={editingPage.subPages || []}
            pageSlug={editingPage.slug}
            onDirtyChange={(isDirty) => {
              setComponentEditorDirty(isDirty);
              onComponentEditorDirtyChange?.(isDirty);
            }}
          />
        )}

        <EditableLandingPageDialogs
          editingPage={editingPage}
          config={config}
          pendingSelection={pendingSelection}
          onPendingSelectionOpenChange={(open) => !open && setPendingSelection(null)}
          onConfirmPendingSelection={() => {
            if (pendingSelection) {
              setSelectedComponentId(pendingSelection.id);
            }
            setPendingSelection(null);
          }}
          templatesOpen={templatesOpen}
          onTemplatesOpenChange={(open) => {
            setTemplatesOpen(open);
            if (!open) setInsertIndex(null);
          }}
          onAddComponent={handleAddComponent}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={setSettingsOpen}
          onSaveSettings={handleSaveSettings}
          customCodeOpen={customCodeOpen}
          onCustomCodeOpenChange={setCustomCodeOpen}
          exportImportOpen={exportImportOpen}
          exportImportTab={exportImportTab}
          onExportImportClose={() => setExportImportOpen(false)}
          onImportComponents={(components) => {
            setEditingPage({
              ...editingPage,
              components: components.map((c, index) => ({ ...c, order: index })),
            });
            setExportImportOpen(false);
          }}
          themeManagerOpen={themeManagerOpen}
          onThemeManagerOpenChange={setThemeManagerOpen}
          onThemeChange={handleThemeChange}
          onSaveCustomTheme={handleSaveCustomTheme}
          navigationSettingsOpen={navigationSettingsOpen}
          onNavigationSettingsOpenChange={setNavigationSettingsOpen}
          onUpdateNavigation={onUpdateNavigation}
          onUpdateNavigationSettings={handleUpdateNavigation}
          changeTemplateDialogOpen={changeTemplateDialogOpen}
          componentToChangeTemplate={componentToChangeTemplate}
          onCloseChangeTemplate={() => {
            setChangeTemplateDialogOpen(false);
            setComponentToChangeTemplate(null);
          }}
          onChangeTemplate={handleChangeTemplate}
        />

        {/* Sidebar Open Indicator */}
        {selectedComponentId && (
          <div className="fixed top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium z-40 shadow-sm border border-blue-200">
            <span className="mr-2">📝</span>
            Editing Component
          </div>
        )}
      </div>
    </EditModeProvider>
  );
}
