"use client";

import { useToast } from "@/hooks/use-toast";
import { useClipboard } from "@/hooks/use-clipboard";
import { ComponentConfig, LandingPage } from "@/types/landing";

interface UseComponentClipboardParams {
  editingPage: LandingPage;
  setEditingPage: (page: LandingPage) => void;
  syncHeaderTabs: (components: ComponentConfig[]) => ComponentConfig[];
  toast: ReturnType<typeof useToast>["toast"];
  selectedComponentId: string | null;
  insertIndex: number | null;
  setInsertIndex: (index: number | null) => void;
  handleDeleteComponent: (componentId: string) => void;
}

// Owns the shared component clipboard plus the add/copy/cut/paste flow built
// on top of it (including insert-at-position, shared by both Add Section and
// Paste). Extracted verbatim from EditableLandingPage.tsx.
export function useComponentClipboard({
  editingPage,
  setEditingPage,
  syncHeaderTabs,
  toast,
  selectedComponentId,
  insertIndex,
  setInsertIndex,
  handleDeleteComponent,
}: UseComponentClipboardParams) {
  const componentClipboard = useClipboard<ComponentConfig>();

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

  return {
    componentClipboard,
    handleAddComponent,
    handleCopyComponent,
    handleCutComponent,
    handlePasteComponent,
  };
}
