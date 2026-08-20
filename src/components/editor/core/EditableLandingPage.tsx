"use client";

import { useState, useEffect, useRef } from "react";
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
import ComponentTemplatesPanel from "@/components/editor/panels/ComponentTemplatesPanel";
import PageSettingsModal from "@/components/editor/dialogs/PageSettingsModal";
import { ExportImportDialog } from "@/components/editor/dialogs/ExportImportDialog";
import { HiddenComponentsList } from "@/components/editor/panels/HiddenComponentsList";
import { ChangeTemplateDialog } from "@/components/editor/dialogs/ChangeTemplateDialog";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import ThemeSelector from "@/components/editor/selectors/ThemeSelector";
import CustomThemeCreator from "@/components/editor/selectors/CustomThemeCreator";
import NavigationSettings from "@/components/editor/selectors/NavigationSettings";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save,
  Plus,
  Settings,
  Download,
  Palette,
  Paintbrush,
  SlidersHorizontal,
  ChevronDown,
  Navigation as NavigationIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import { useClipboard } from "@/hooks/use-clipboard";
import { getTheme, applyTheme } from "@/lib/themes";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  // When true, renders this page as a read-only preview (used for browsing
  // version history) — every edit surface (toolbar actions, drag-reorder,
  // component selection/ComponentEditor, autosave, keyboard shortcuts) is
  // inert. The canvas still renders live components, just non-interactively.
  readOnly?: boolean;
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
  readOnly = false,
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
  const componentClipboard = useClipboard<ComponentConfig>();
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  // Where a new (non-header) section should be inserted: an index into the
  // sorted components list, or null to append at the end (the toolbar "+"
  // button's behavior). Set by the hover "+" between/around sections.
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [customThemeCreatorOpen, setCustomThemeCreatorOpen] = useState(false);
  const [navigationSettingsOpen, setNavigationSettingsOpen] = useState(false);
  const [changeTemplateDialogOpen, setChangeTemplateDialogOpen] = useState(false);
  const [componentToChangeTemplate, setComponentToChangeTemplate] =
    useState<ComponentConfig | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [componentEditorDirty, setComponentEditorDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{ id: string | null } | null>(null);
  // Zoom applies only to this page's canvas, not the surrounding editor chrome.
  const [zoomPercent, setZoomPercent] = useState(100);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Switching the selected component resets ComponentEditor's local edits (it
  // re-syncs from the newly selected component's config). If there are
  // unsaved edits, confirm before discarding them instead of switching silently.
  const requestSelectComponent = (id: string | null) => {
    if (componentEditorDirty && id !== selectedComponentId) {
      setPendingSelection({ id });
    } else {
      setSelectedComponentId(id);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Sync header tabs when subpages change
  useEffect(() => {
    const headerComponent = editingPage.components.find((c) => c.type === "header");
    if (headerComponent) {
      const syncedComponents = syncHeaderTabs(editingPage.components);
      if (JSON.stringify(syncedComponents) !== JSON.stringify(editingPage.components)) {
        setEditingPage({
          ...editingPage,
          components: syncedComponents,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPage.subPages]);

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
        key: "Escape",
        description: "Close panels",
        action: () => {
          requestSelectComponent(null);
          setTemplatesOpen(false);
          setSettingsOpen(false);
          setExportImportOpen(false);
        },
      },
      {
        key: "Delete",
        description: "Delete selected component",
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
  const handleComponentUpdate = (updatedComponent: ComponentConfig) => {
    const updatedComponents = editingPage.components.map((c) =>
      c.id === updatedComponent.id ? updatedComponent : c
    );

    const updatedPage = {
      ...editingPage,
      components: updatedComponents,
    };

    setEditingPage(updatedPage);
    onSave(updatedPage);
    setTimeout(() => markAsSaved(updatedPage), 0);

    toast.success({
      title: "Component Updated",
      description: `${updatedComponent.type} component has been modified`,
    });
  };

  // Toggle component visibility
  const handleToggleVisibility = (componentId: string) => {
    const component = editingPage.components.find((c) => c.id === componentId);
    const updatedComponents = editingPage.components.map((c) =>
      c.id === componentId ? { ...c, visible: !c.visible } : c
    );

    // Auto-sync header tabs if header exists
    const syncedComponents = syncHeaderTabs(updatedComponents);

    setEditingPage({
      ...editingPage,
      components: syncedComponents,
    });

    toast.success({
      title: component?.visible ? "Component Hidden" : "Component Visible",
      description: `${component?.type || "Component"} is now ${component?.visible ? "hidden" : "visible"} on the page`,
    });
  };

  // Delete a component
  const handleDeleteComponent = (componentId: string) => {
    const updatedComponents = editingPage.components.filter((c) => c.id !== componentId);

    // Auto-sync header tabs if header exists
    const syncedComponents = syncHeaderTabs(updatedComponents);

    setEditingPage({
      ...editingPage,
      components: syncedComponents,
    });

    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }

    const deletedComponent = editingPage.components.find((c) => c.id === componentId);
    toast.success({
      title: "Component Deleted",
      description: `${deletedComponent?.type || "Component"} has been removed from the page`,
    });
  };

  // Auto-sync header tabs with components and subpages
  const syncHeaderTabs = (components: ComponentConfig[]) => {
    const headerComponent = components.find((c) => c.type === "header");
    if (!headerComponent) return components;

    // Get all visible non-header components
    const visibleComponents = components.filter(
      (c) => c.type !== "header" && c.visible && c.type !== "footer"
    );

    // Create tabs for each component (hash links)
    const componentTabs = visibleComponents.map((comp) => ({
      id: comp.id,
      text: getComponentDisplayName(comp),
      link: `#${comp.id}`,
    }));

    // Add subpage tabs to header — every page's sub-pages live under its own
    // slug uniformly (e.g. /my-page/blog), no special case for any page.
    let newTabs = [...componentTabs];

    if ((editingPage.subPages?.length ?? 0) > 0) {
      const subPageTabs =
        editingPage.subPages
          ?.filter((sp) => sp.visible)
          .map((sp) => ({
            id: sp.id,
            text: sp.title,
            link: `/${editingPage.slug}/${sp.slug}`,
          })) || [];
      newTabs = [...componentTabs, ...subPageTabs];
    }

    // Update header config with new tabs
    const updatedHeader = {
      ...headerComponent,
      config: {
        ...headerComponent.config,
        tabs: newTabs,
      },
    };

    return components.map((c) => (c.id === headerComponent.id ? updatedHeader : c));
  };

  // Get display name for component type
  const getComponentDisplayName = (component: ComponentConfig): string => {
    const typeNames: Record<string, string> = {
      hero: "Home",
      features: "Features",
      pricing: "Pricing",
      testimonials: "Testimonials",
      cta: "Get Started",
      stats: "Stats",
      team: "Team",
      faq: "FAQ",
      gallery: "Gallery",
      "logo-cloud": "Partners",
      contact: "Contact",
      content: "About",
      newsletter: "Newsletter",
      video: "Video",
    };

    // Return component type name (short, clean text)
    return typeNames[component.type] || component.type;
  };

  // Insert a component at a specific position (or append at the end when
  // targetIndex is null), enforcing the "one header per page" rule and
  // re-syncing header nav tabs. Shared by the Add Section flow (via
  // handleAddComponent, which reads the hover-"+" insertIndex) and Paste
  // (which targets right after the current selection).
  const insertComponentAt = (component: ComponentConfig, targetIndex: number | null) => {
    // Header components should always be at the top
    if (component.type === "header") {
      // Check if header already exists
      const hasHeader = editingPage.components.some((c) => c.type === "header");
      if (hasHeader) {
        toast.warning({
          title: "Cannot Add Header",
          description:
            "Only one header is allowed per page. Please remove the existing header first.",
        });
        return;
      }

      const newComponent = {
        ...component,
        order: 0,
      };

      // Reorder all existing components
      const reorderedComponents = editingPage.components.map((c) => ({
        ...c,
        order: c.order + 1,
      }));

      // Sync header tabs with existing components
      const allComponents = [newComponent, ...reorderedComponents];
      const syncedComponents = syncHeaderTabs(allComponents);

      setEditingPage({
        ...editingPage,
        components: syncedComponents,
      });

      toast.success({
        title: "Header Added",
        description: "Header component has been added with navigation tabs",
      });
    } else {
      const sorted = [...editingPage.components].sort((a, b) => a.order - b.order);
      const index = targetIndex ?? sorted.length;
      const newComponents = [...sorted];
      newComponents.splice(index, 0, component);
      const reorderedComponents = newComponents.map((c, i) => ({ ...c, order: i }));

      // Auto-sync header tabs if header exists
      const syncedComponents = syncHeaderTabs(reorderedComponents);

      setEditingPage({
        ...editingPage,
        components: syncedComponents,
      });

      toast.success({
        title: "Component Added",
        description: `${component.type} component has been added to your page`,
      });
    }
  };

  // Add a new component from the Add Section panel, at the hover-"+"
  // position it was opened from (or appended at the end from the toolbar).
  const handleAddComponent = (component: ComponentConfig) => {
    insertComponentAt(component, insertIndex);
    setInsertIndex(null);
  };

  // Copy the selected component onto the shared clipboard (see use-clipboard),
  // without altering the page.
  const handleCopyComponent = (componentId: string) => {
    const component = editingPage.components.find((c) => c.id === componentId);
    if (!component) return;

    componentClipboard.copy(component);
    toast.success({
      title: "Copied",
      description: `${component.type} component copied — paste it with Ctrl+V`,
    });
  };

  // Cut = copy, then remove — reuses handleDeleteComponent for the removal
  // (and its own "Component Deleted" toast), so cut doesn't need one of its own.
  const handleCutComponent = (componentId: string) => {
    const component = editingPage.components.find((c) => c.id === componentId);
    if (!component) return;

    componentClipboard.copy(component);
    handleDeleteComponent(componentId);
  };

  // Paste the clipboard's component right after the current selection (or
  // append at the end when nothing is selected), as a fresh copy with a new
  // id so it doesn't collide with the one still on the page (or elsewhere,
  // if pasted into a different page's editor).
  const handlePasteComponent = () => {
    const copied = componentClipboard.value;
    if (!copied) return;

    const sorted = [...editingPage.components].sort((a, b) => a.order - b.order);
    const selectedIndex = sorted.findIndex((c) => c.id === selectedComponentId);
    const targetIndex = selectedIndex === -1 ? null : selectedIndex + 1;

    insertComponentAt(
      { ...copied, id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
      targetIndex
    );
  };

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

  // Duplicate a component
  const handleDuplicateComponent = (componentId: string) => {
    const component = editingPage.components.find((c) => c.id === componentId);
    if (!component) return;

    const maxOrder = Math.max(0, ...editingPage.components.map((c) => c.order));
    const duplicatedComponent: ComponentConfig = {
      ...component,
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: maxOrder + 1,
    };

    setEditingPage({
      ...editingPage,
      components: [...editingPage.components, duplicatedComponent],
    });

    toast.success({
      title: "Duplicated",
      description: "Component duplicated successfully",
    });
  };

  // Open change template dialog
  const handleOpenChangeTemplate = (componentId: string) => {
    const component = editingPage.components.find((c) => c.id === componentId);
    if (component) {
      setComponentToChangeTemplate(component);
      setChangeTemplateDialogOpen(true);
    }
  };

  // Change template for a component with smart merging
  const handleChangeTemplate = (newConfig: Partial<ComponentConfig>) => {
    if (!componentToChangeTemplate) return;

    // Smart merge: Keep user's content (text, images, etc.) from old config
    const mergedConfig = mergeConfigs(
      componentToChangeTemplate.config as Record<string, unknown>,
      (newConfig.config || {}) as Record<string, unknown>
    );

    const updatedComponents = editingPage.components.map((c) =>
      c.id === componentToChangeTemplate.id
        ? {
            ...c,
            ...newConfig,
            config: mergedConfig, // Use merged config instead of completely replacing
          }
        : c
    );

    // Auto-sync header tabs if header exists
    const syncedComponents = syncHeaderTabs(updatedComponents);

    setEditingPage({
      ...editingPage,
      components: syncedComponents,
    });

    toast.success({
      title: "Template Changed",
      description: `Component template updated while preserving your content`,
    });

    setComponentToChangeTemplate(null);
    setChangeTemplateDialogOpen(false);
  };

  // Helper function to merge old user content with new template structure
  const mergeConfigs = (
    oldConfig: Record<string, unknown>,
    newConfig: Record<string, unknown>
  ): Record<string, unknown> => {
    if (!oldConfig || !newConfig) return newConfig;

    const merged = { ...newConfig }; // Start with new template structure

    // Preserve important user-edited fields
    const preserveFields = [
      "title",
      "subtitle",
      "description",
      "content",
      "image",
      "logo",
      "tagline",
      "email",
      "phone",
      "address",
      "copyright",
    ];

    // Copy preserved fields from old config if they exist and are not empty
    preserveFields.forEach((field) => {
      if (oldConfig[field] && oldConfig[field] !== "") {
        merged[field] = oldConfig[field];
      }
    });

    // Special handling for arrays (features, testimonials, plans, etc.)
    if (Array.isArray(oldConfig.features) && Array.isArray(newConfig.features)) {
      // Keep old features if user has customized them, otherwise use new template
      if (oldConfig.features.length > 0) {
        merged.features = oldConfig.features;
      }
    }

    if (Array.isArray(oldConfig.testimonials) && Array.isArray(newConfig.testimonials)) {
      if (oldConfig.testimonials.length > 0) {
        merged.testimonials = oldConfig.testimonials;
      }
    }

    if (Array.isArray(oldConfig.plans) && Array.isArray(newConfig.plans)) {
      if (oldConfig.plans.length > 0) {
        merged.plans = oldConfig.plans;
      }
    }

    if (Array.isArray(oldConfig.stats) && Array.isArray(newConfig.stats)) {
      if (oldConfig.stats.length > 0) {
        merged.stats = oldConfig.stats;
      }
    }

    if (Array.isArray(oldConfig.faqs) && Array.isArray(newConfig.faqs)) {
      if (oldConfig.faqs.length > 0) {
        merged.faqs = oldConfig.faqs;
      }
    }

    if (Array.isArray(oldConfig.members) && Array.isArray(newConfig.members)) {
      if (oldConfig.members.length > 0) {
        merged.members = oldConfig.members;
      }
    }

    if (Array.isArray(oldConfig.images) && Array.isArray(newConfig.images)) {
      if (oldConfig.images.length > 0) {
        merged.images = oldConfig.images;
      }
    }

    if (Array.isArray(oldConfig.logos) && Array.isArray(newConfig.logos)) {
      if (oldConfig.logos.length > 0) {
        merged.logos = oldConfig.logos;
      }
    }

    if (Array.isArray(oldConfig.columns) && Array.isArray(newConfig.columns)) {
      if (oldConfig.columns.length > 0) {
        merged.columns = oldConfig.columns;
      }
    }

    if (Array.isArray(oldConfig.tabs) && Array.isArray(newConfig.tabs)) {
      if (oldConfig.tabs.length > 0) {
        merged.tabs = oldConfig.tabs;
      }
    }

    if (Array.isArray(oldConfig.fields) && Array.isArray(newConfig.fields)) {
      if (oldConfig.fields.length > 0) {
        merged.fields = oldConfig.fields;
      }
    }

    // Preserve CTA buttons if user customized them
    if (oldConfig.primaryCTA) {
      merged.primaryCTA = oldConfig.primaryCTA;
    }

    if (oldConfig.secondaryCTA) {
      merged.secondaryCTA = oldConfig.secondaryCTA;
    }

    if (oldConfig.cta) {
      merged.cta = oldConfig.cta;
    }

    if (oldConfig.ctaButton) {
      merged.ctaButton = oldConfig.ctaButton;
    }

    // Preserve background if customized (but allow new template's background if old was default)
    if (oldConfig.background && typeof oldConfig.background === "object") {
      const bg = oldConfig.background as { type?: string; color?: string };
      if (bg.type && bg.type !== "solid") {
        merged.background = oldConfig.background;
      } else if (bg.color && bg.color !== "#ffffff" && bg.color !== "#f9fafb") {
        // Keep custom colors
        merged.background = oldConfig.background;
      }
    }

    // Preserve animation settings if user customized them
    if (oldConfig.animation && typeof oldConfig.animation === "object") {
      const anim = oldConfig.animation as { type?: string };
      if (anim.type && anim.type !== "none") {
        merged.animation = oldConfig.animation;
      }
    }

    // Preserve spacing if customized
    if (oldConfig.spacing) {
      merged.spacing = oldConfig.spacing;
    }

    // Preserve contactInfo if exists
    if (oldConfig.contactInfo) {
      merged.contactInfo = oldConfig.contactInfo;
    }

    // Preserve social links if exists
    if (oldConfig.social && Array.isArray(oldConfig.social) && oldConfig.social.length > 0) {
      merged.social = oldConfig.social;
    }

    // Preserve video URL if exists
    if (oldConfig.videoUrl) {
      merged.videoUrl = oldConfig.videoUrl;
    }

    return merged;
  };

  // Save page settings
  const handleSaveSettings = async (updates: Partial<LandingPage>) => {
    const updatedPage = {
      ...editingPage,
      ...updates,
    };

    setEditingPage(updatedPage);

    toast.success({
      title: "Settings Updated",
      description: "Page settings saved successfully",
    });
  };

  // Change theme
  const handleThemeChange = (themeId: string) => {
    const updatedPage = {
      ...editingPage,
      theme: themeId,
    };

    setEditingPage(updatedPage);

    const themeName = getTheme(themeId, config.themes).name;

    toast.success({
      title: "Theme Changed",
      description: `Switched to ${themeName} theme`,
    });
  };

  // Save custom theme
  const handleSaveCustomTheme = async (theme: Theme, themeId: string) => {
    if (!onSaveCustomTheme) {
      handleThemeChange(themeId);
      return;
    }

    try {
      await onSaveCustomTheme(theme, themeId);
      handleThemeChange(themeId);

      toast.success({
        title: "Custom Theme Created",
        description: `"${theme.name}" has been created and applied!`,
      });
    } catch (error) {
      console.error("Error saving custom theme:", error);
      toast.error({
        title: "Failed to Save Theme",
        description: "Your custom theme could not be saved. Please try again.",
      });
    }
  };

  // Update site-wide navigation settings (multi-page only). This is a separate
  // channel from onSave: navigation lives on the top-level LandingPage regardless
  // of which page (main or sub-page) is currently being viewed here, so it's
  // persisted directly via onUpdateNavigation rather than through the generic
  // onSave, which has different per-page semantics depending on the caller.
  const handleUpdateNavigation = (navigation: PageNavigation) => {
    setEditingPage({ ...editingPage, navigation });
    onUpdateNavigation?.(navigation);
  };

  // Move component up
  const handleMoveUp = (componentId: string) => {
    const index = editingPage.components.findIndex((c) => c.id === componentId);
    if (index <= 0) return;

    const newComponents = [...editingPage.components];
    [newComponents[index - 1], newComponents[index]] = [
      newComponents[index],
      newComponents[index - 1],
    ];

    // Update order numbers
    const reorderedComponents = newComponents.map((c, i) => ({ ...c, order: i }));

    setEditingPage({
      ...editingPage,
      components: reorderedComponents,
    });
  };

  // Move component down
  const handleMoveDown = (componentId: string) => {
    const index = editingPage.components.findIndex((c) => c.id === componentId);
    if (index < 0 || index >= editingPage.components.length - 1) return;

    const newComponents = [...editingPage.components];
    [newComponents[index], newComponents[index + 1]] = [
      newComponents[index + 1],
      newComponents[index],
    ];

    // Update order numbers
    const reorderedComponents = newComponents.map((c, i) => ({ ...c, order: i }));

    setEditingPage({
      ...editingPage,
      components: reorderedComponents,
    });
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editingPage.components.findIndex((c) => c.id === active.id);
      const newIndex = editingPage.components.findIndex((c) => c.id === over.id);

      const newComponents = arrayMove(editingPage.components, oldIndex, newIndex);

      // Update order numbers
      const reorderedComponents = newComponents.map((c, i) => ({ ...c, order: i }));

      setEditingPage({
        ...editingPage,
        components: reorderedComponents,
      });

      toast.success({
        title: "Components Reordered",
        description: "Component order has been updated successfully",
      });
    }

    setActiveId(null);
  };

  // Compute the zoom percentage that makes the canvas fit the currently
  // available width. CSS transform (used to apply zoom) is purely a paint-time
  // effect — it doesn't change the element's own layout size — so
  // content.scrollWidth is already the natural, unzoomed width regardless of
  // the current zoomPercent and needs no compensation for it.
  const handleFitZoom = () => {
    const wrapper = canvasWrapperRef.current;
    const content = canvasContentRef.current;
    if (!wrapper || !content) return;

    const naturalWidth = content.scrollWidth;
    if (naturalWidth <= 0) return;

    const fitPercent = Math.round(
      Math.min(200, Math.max(25, (wrapper.clientWidth / naturalWidth) * 100))
    );
    setZoomPercent(fitPercent);
  };

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

  // Process images: convert base64 to permanent files
  const processImages = async (pageData: LandingPage): Promise<LandingPage> => {
    const imagesToSave: Array<{ url: string; filename?: string }> = [];

    // Quick check - only scan if we might have base64 images
    const pageJsonString = JSON.stringify(pageData.components);
    if (!pageJsonString.includes("data:image/")) {
      // No base64 images found, return immediately
      return pageData;
    }

    // Collect all base64 images from components
    const collectImages = (obj: unknown) => {
      if (typeof obj === "string" && obj.startsWith("data:image/")) {
        imagesToSave.push({ url: obj });
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj).forEach(collectImages);
      }
    };

    pageData.components.forEach((component) => collectImages(component.config));

    // If no images to process, return as is
    if (imagesToSave.length === 0) {
      return pageData;
    }

    try {
      // Save images to permanent files with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/save-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagesToSave }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Image save failed: ${response.status} ${response.statusText}`);
      }

      const { savedImages } = await response.json();

      // Replace base64 URLs with permanent URLs
      const replaceImages = (obj: unknown): unknown => {
        if (typeof obj === "string") {
          const replacement = savedImages.find(
            (img: { originalUrl: string; newUrl: string }) => img.originalUrl === obj
          );
          return replacement ? replacement.newUrl : obj;
        }
        if (Array.isArray(obj)) {
          return obj.map(replaceImages);
        }
        if (typeof obj === "object" && obj !== null) {
          const result: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(obj)) {
            result[key] = replaceImages(value);
          }
          return result;
        }
        return obj;
      };

      const processedComponents = pageData.components.map((component) => ({
        ...component,
        config: replaceImages(component.config),
      }));

      return {
        ...pageData,
        components: processedComponents as ComponentConfig[],
      };
    } catch (error) {
      console.warn("Image processing failed, saving without image conversion:", error);
      // Return original data if image processing fails
      return pageData;
    }
  };

  // Sort components by order
  const sortedComponents = [...editingPage.components].sort((a, b) => a.order - b.order);

  return (
    <EditModeProvider isEditMode={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">{editingPage.title}</h1>
              {readOnly && (
                <div className="flex items-center gap-1 shrink-0 rounded-full bg-gray-100 px-2 py-0.5">
                  <span className="text-xs text-gray-600 font-medium">Read-only preview</span>
                </div>
              )}
              {!readOnly && saving && (
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-600 font-medium">Saving...</span>
                </div>
              )}
              {!readOnly && !saving && hasUnsavedChanges && (
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-orange-600 font-medium">Unsaved changes</span>
                </div>
              )}
              {!readOnly && !saving && !hasUnsavedChanges && (
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">All changes saved</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                    {zoomPercent}%
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleFitZoom}>Fit</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {[50, 75, 90, 100, 125, 150, 200].map((value) => (
                    <DropdownMenuItem key={value} onClick={() => setZoomPercent(value)}>
                      {value}%
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {!readOnly && (
                <>
                  <HiddenComponentsList
                    components={editingPage.components}
                    onToggleVisibility={handleToggleVisibility}
                    onSelectComponent={requestSelectComponent}
                  />
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setInsertIndex(null);
                            setTemplatesOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add Section</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenu>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Page Settings</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setTimeout(() => setThemeSelectorOpen(true), 0)}
                      >
                        <Palette className="h-4 w-4" />
                        Theme
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTimeout(() => setCustomThemeCreatorOpen(true), 0)}
                      >
                        <Paintbrush className="h-4 w-4" />
                        Custom Theme
                      </DropdownMenuItem>
                      {(editingPage.subPages?.length ?? 0) > 0 && onUpdateNavigation && (
                        <DropdownMenuItem
                          onClick={() => setTimeout(() => setNavigationSettingsOpen(true), 0)}
                        >
                          <NavigationIcon className="h-4 w-4" />
                          Navigation
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setTimeout(() => setExportImportOpen(true), 0)}
                      >
                        <Download className="h-4 w-4" />
                        Export/Import
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTimeout(() => setSettingsOpen(true), 0)}>
                        <Settings className="h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !hasUnsavedChanges}
                    size="sm"
                    variant={saving || hasUnsavedChanges ? "default" : "outline"}
                    className={`h-7 gap-1 px-2 text-xs transition-all duration-200 ${
                      saving
                        ? "bg-blue-400 cursor-not-allowed"
                        : hasUnsavedChanges
                          ? "bg-orange-600 hover:bg-orange-700"
                          : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <Save className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`} />
                    {saving ? "Saving..." : hasUnsavedChanges ? "Save Changes*" : "Saved"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

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
                          isSelected={
                            selectedComponentId === component.id || activeSectionId === component.id
                          }
                          onSelect={() => requestSelectComponent(component.id)}
                          onToggleVisibility={() => handleToggleVisibility(component.id)}
                          onDelete={() => handleDeleteComponent(component.id)}
                          onDuplicate={() => handleDuplicateComponent(component.id)}
                          onChangeTemplate={() => handleOpenChangeTemplate(component.id)}
                          onMoveUp={() => handleMoveUp(component.id)}
                          onMoveDown={() => handleMoveDown(component.id)}
                          canMoveUp={index > 0}
                          canMoveDown={index < sortedComponents.length - 1}
                          isFirst={index === 0}
                          isLast={index === sortedComponents.length - 1}
                        >
                          {/* Special wrapper for header to ensure EditableBlock features work properly */}
                          <div
                            className={`w-full ${component.type === "header" ? "relative" : "overflow-hidden"}`}
                            style={
                              component.type === "header"
                                ? {
                                    // Contain header within EditableBlock bounds
                                    position: "relative",
                                    isolation: "isolate",
                                  }
                                : undefined
                            }
                          >
                            <ComponentRenderer component={component} theme={theme} />
                          </div>
                        </EditableBlock>
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

        {/* Guard against silently discarding edits when switching components elsewhere */}
        <ConfirmDialog
          open={!!pendingSelection}
          onOpenChange={(open) => !open && setPendingSelection(null)}
          title="Discard unsaved changes?"
          description="You have unsaved changes to the current component. Switching now will discard them."
          confirmText="Discard"
          variant="destructive"
          onConfirm={() => {
            if (pendingSelection) {
              setSelectedComponentId(pendingSelection.id);
            }
            setPendingSelection(null);
          }}
        />

        {/* Component Templates Panel */}
        <ComponentTemplatesPanel
          open={templatesOpen}
          onOpenChange={(open) => {
            setTemplatesOpen(open);
            if (!open) setInsertIndex(null);
          }}
          onAddComponent={handleAddComponent}
          existingComponents={editingPage.components}
        />

        {/* Page Settings Modal */}
        <PageSettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          page={editingPage}
          config={config}
          onSave={handleSaveSettings}
        />

        {/* Export/Import Dialog */}
        <ExportImportDialog
          isOpen={exportImportOpen}
          onClose={() => setExportImportOpen(false)}
          components={editingPage.components}
          onImport={(components) => {
            setEditingPage({
              ...editingPage,
              components: components.map((c, index) => ({ ...c, order: index })),
            });
            setExportImportOpen(false);
          }}
          isMultiPage={(editingPage.subPages?.length ?? 0) > 0}
          subPages={editingPage.subPages}
          pageTitle={editingPage.title}
        />

        {/* Theme Selector */}
        <ThemeSelector
          open={themeSelectorOpen}
          onOpenChange={setThemeSelectorOpen}
          currentThemeId={editingPage.theme}
          onThemeChange={handleThemeChange}
        />

        {/* Custom Theme Creator */}
        <CustomThemeCreator
          open={customThemeCreatorOpen}
          onOpenChange={setCustomThemeCreatorOpen}
          onSaveTheme={handleSaveCustomTheme}
        />

        {/* Navigation Settings (multi-page only) */}
        {(editingPage.subPages?.length ?? 0) > 0 && onUpdateNavigation && (
          <NavigationSettings
            open={navigationSettingsOpen}
            onOpenChange={setNavigationSettingsOpen}
            navigation={editingPage.navigation}
            onUpdate={handleUpdateNavigation}
          />
        )}

        {/* Change Template Dialog */}
        {componentToChangeTemplate && (
          <ChangeTemplateDialog
            isOpen={changeTemplateDialogOpen}
            onClose={() => {
              setChangeTemplateDialogOpen(false);
              setComponentToChangeTemplate(null);
            }}
            component={componentToChangeTemplate}
            onChangeTemplate={handleChangeTemplate}
          />
        )}

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
