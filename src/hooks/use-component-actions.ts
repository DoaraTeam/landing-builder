"use client";

import { useCallback, useState, type MutableRefObject } from "react";
import { useToast } from "@/hooks/use-toast";
import { mergeConfigs } from "@/lib/merge-configs";
import { ComponentConfig, LandingPage } from "@/types/landing";

interface UseComponentActionsParams {
  editingPage: LandingPage;
  editingPageRef: MutableRefObject<LandingPage>;
  setEditingPage: (page: LandingPage) => void;
  syncHeaderTabs: (components: ComponentConfig[]) => ComponentConfig[];
  toast: ReturnType<typeof useToast>["toast"];
  selectedComponentIdRef: MutableRefObject<string | null>;
  setSelectedComponentId: (id: string | null) => void;
}

// Owns the per-component CRUD actions (toggle visibility, delete, duplicate,
// move up/down, change template) plus the Change Template dialog's own state
// — extracted verbatim from EditableLandingPage.tsx.
export function useComponentActions({
  editingPage,
  editingPageRef,
  setEditingPage,
  syncHeaderTabs,
  toast,
  selectedComponentIdRef,
  setSelectedComponentId,
}: UseComponentActionsParams) {
  const [changeTemplateDialogOpen, setChangeTemplateDialogOpen] = useState(false);
  const [componentToChangeTemplate, setComponentToChangeTemplate] =
    useState<ComponentConfig | null>(null);

  // Toggle component visibility
  const handleToggleVisibility = useCallback(
    (componentId: string) => {
      const current = editingPageRef.current;
      const component = current.components.find((c) => c.id === componentId);
      const updatedComponents = current.components.map((c) =>
        c.id === componentId ? { ...c, visible: !c.visible } : c
      );

      // Auto-sync header tabs if header exists
      const syncedComponents = syncHeaderTabs(updatedComponents);

      setEditingPage({
        ...current,
        components: syncedComponents,
      });

      toast.success({
        title: component?.visible ? "Component Hidden" : "Component Visible",
        description: `${component?.type || "Component"} is now ${component?.visible ? "hidden" : "visible"} on the page`,
      });
    },
    [toast, syncHeaderTabs, setEditingPage, editingPageRef]
  );

  // Delete a component
  const handleDeleteComponent = useCallback(
    (componentId: string) => {
      const current = editingPageRef.current;
      const updatedComponents = current.components.filter((c) => c.id !== componentId);

      // Auto-sync header tabs if header exists
      const syncedComponents = syncHeaderTabs(updatedComponents);

      setEditingPage({
        ...current,
        components: syncedComponents,
      });

      if (selectedComponentIdRef.current === componentId) {
        setSelectedComponentId(null);
      }

      const deletedComponent = current.components.find((c) => c.id === componentId);
      toast.success({
        title: "Component Deleted",
        description: `${deletedComponent?.type || "Component"} has been removed from the page`,
      });
    },
    [
      toast,
      syncHeaderTabs,
      setEditingPage,
      editingPageRef,
      selectedComponentIdRef,
      setSelectedComponentId,
    ]
  );

  // Duplicate a component
  const handleDuplicateComponent = useCallback(
    (componentId: string) => {
      const current = editingPageRef.current;
      const component = current.components.find((c) => c.id === componentId);
      if (!component) return;

      const maxOrder = Math.max(0, ...current.components.map((c) => c.order));
      const duplicatedComponent: ComponentConfig = {
        ...component,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        order: maxOrder + 1,
      };

      setEditingPage({
        ...current,
        components: [...current.components, duplicatedComponent],
      });

      toast.success({
        title: "Duplicated",
        description: "Component duplicated successfully",
      });
    },
    [toast, setEditingPage, editingPageRef]
  );

  // Open change template dialog
  const handleOpenChangeTemplate = useCallback(
    (componentId: string) => {
      const component = editingPageRef.current.components.find((c) => c.id === componentId);
      if (component) {
        setComponentToChangeTemplate(component);
        setChangeTemplateDialogOpen(true);
      }
    },
    [editingPageRef]
  );

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

  // Move component up
  const handleMoveUp = useCallback(
    (componentId: string) => {
      const current = editingPageRef.current;
      const index = current.components.findIndex((c) => c.id === componentId);
      if (index <= 0) return;

      const newComponents = [...current.components];
      [newComponents[index - 1], newComponents[index]] = [
        newComponents[index],
        newComponents[index - 1],
      ];

      // Update order numbers
      const reorderedComponents = newComponents.map((c, i) => ({ ...c, order: i }));

      setEditingPage({
        ...current,
        components: reorderedComponents,
      });
    },
    [setEditingPage, editingPageRef]
  );

  // Move component down
  const handleMoveDown = useCallback(
    (componentId: string) => {
      const current = editingPageRef.current;
      const index = current.components.findIndex((c) => c.id === componentId);
      if (index < 0 || index >= current.components.length - 1) return;

      const newComponents = [...current.components];
      [newComponents[index], newComponents[index + 1]] = [
        newComponents[index + 1],
        newComponents[index],
      ];

      // Update order numbers
      const reorderedComponents = newComponents.map((c, i) => ({ ...c, order: i }));

      setEditingPage({
        ...current,
        components: reorderedComponents,
      });
    },
    [setEditingPage, editingPageRef]
  );

  return {
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
  };
}
