"use client";

import { useState, useEffect } from "react";
import { LandingPage, ComponentConfig, Theme, LandingConfig } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { EditableBlock } from "@/components/editor/core/EditableBlock";
import { ComponentEditor } from "@/components/editor/core/ComponentEditor";
import ComponentTemplatesPanel from "@/components/editor/panels/ComponentTemplatesPanel";
import PageSettingsModal from "@/components/editor/dialogs/PageSettingsModal";
import { ExportImportDialog } from "@/components/editor/dialogs/ExportImportDialog";
import { KeyboardShortcutsHelp } from "@/components/editor/panels/KeyboardShortcutsHelp";
import { HiddenComponentsList } from "@/components/editor/panels/HiddenComponentsList";
import { ChangeTemplateDialog } from "@/components/editor/dialogs/ChangeTemplateDialog";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import ThemeSelector from "@/components/editor/selectors/ThemeSelector";
import CustomThemeCreator from "@/components/editor/selectors/CustomThemeCreator";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { Save, Plus, Settings, Download, HelpCircle, Palette, Paintbrush } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
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

interface EditableLandingPageProps {
  page: LandingPage;
  theme?: Theme;
  config: LandingConfig;
  onSave: (page: LandingPage) => Promise<void>;
  onSaveCustomTheme?: (theme: Theme, themeId: string) => Promise<void>;
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
}: EditableLandingPageProps) {
  const [editingPage, setEditingPage] = useState<LandingPage>(page);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [customThemeCreatorOpen, setCustomThemeCreatorOpen] = useState(false);
  const [changeTemplateDialogOpen, setChangeTemplateDialogOpen] = useState(false);
  const [componentToChangeTemplate, setComponentToChangeTemplate] =
    useState<ComponentConfig | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [componentEditorDirty, setComponentEditorDirty] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{ id: string | null } | null>(null);
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

  // Sync editingPage when prop page changes (e.g., when applying version)
  useEffect(() => {
    setEditingPage(page);
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
    enabled: true,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...COMMON_SHORTCUTS.SAVE,
        action: () => !saving && handleSave(),
      },
      {
        ...COMMON_SHORTCUTS.ADD_COMPONENT,
        action: () => setTemplatesOpen(true),
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
          setHelpOpen(false);
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
    ],
    enabled: true,
  });

  // Update a component's config
  const handleComponentUpdate = (updatedComponent: ComponentConfig) => {
    const updatedComponents = editingPage.components.map((c) =>
      c.id === updatedComponent.id ? updatedComponent : c
    );

    setEditingPage({
      ...editingPage,
      components: updatedComponents,
    });

    toast({
      title: "🔧 Component Updated",
      description: `${updatedComponent.type} component has been modified`,
      duration: 2000,
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

    toast({
      title: component?.visible ? "👁️ Component Hidden" : "👁️ Component Visible",
      description: `${component?.type || "Component"} is now ${component?.visible ? "hidden" : "visible"} on the page`,
      duration: 2000,
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
    toast({
      title: "🗑️ Component Deleted",
      description: `${deletedComponent?.type || "Component"} has been removed from the page`,
      duration: 3000,
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

    // For multi-page landing: Add subpage tabs to header
    // Subpages should link directly to their routes (e.g., /blog, /pricing)
    let newTabs = [...componentTabs];

    // Add subpage tabs if it's a multi-page landing
    if (editingPage.isMultiPage) {
      const subPageTabs =
        editingPage.subPages
          ?.filter((sp) => sp.visible)
          .map((sp) => ({
            id: sp.id,
            text: sp.title,
            link: `/${sp.slug}`, // Direct route to subpage
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

  // Add a new component
  const handleAddComponent = (component: ComponentConfig) => {
    // Header components should always be at the top
    if (component.type === "header") {
      // Check if header already exists
      const hasHeader = editingPage.components.some((c) => c.type === "header");
      if (hasHeader) {
        toast({
          title: "⚠️ Cannot Add Header",
          description:
            "Only one header is allowed per page. Please remove the existing header first.",
          variant: "destructive",
          duration: 4000,
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

      toast({
        title: "📱 Header Added",
        description: "Header component has been added with navigation tabs",
        duration: 3000,
      });
    } else {
      // For other components, add to the end
      const maxOrder = Math.max(0, ...editingPage.components.map((c) => c.order));
      const newComponent = {
        ...component,
        order: maxOrder + 1,
      };

      const updatedComponents = [...editingPage.components, newComponent];

      // Auto-sync header tabs if header exists
      const syncedComponents = syncHeaderTabs(updatedComponents);

      setEditingPage({
        ...editingPage,
        components: syncedComponents,
      });

      toast({
        title: "➕ Component Added",
        description: `${component.type} component has been added to your page`,
        duration: 3000,
      });
    }
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

    toast({
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

    toast({
      title: "🔄 Template Changed",
      description: `Component template updated while preserving your content`,
      duration: 3000,
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

    toast({
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

    toast({
      title: "🎨 Theme Changed",
      description: `Switched to ${themeName} theme`,
      duration: 3000,
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

      toast({
        title: "✨ Custom Theme Created",
        description: `"${theme.name}" has been created and applied!`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving custom theme:", error);
      toast({
        title: "❌ Failed to Save Theme",
        description: "Your custom theme could not be saved. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
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

      toast({
        title: "↕️ Components Reordered",
        description: "Component order has been updated successfully",
        duration: 2000,
      });
    }

    setActiveId(null);
  };

  // Save changes
  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    const startTime = Date.now();

    // Show optimistic loading toast with better UX
    const savingToast = toast({
      title: "💾 Saving Changes...",
      description: "Processing your updates, please wait a moment",
      duration: 30000, // Long duration, will be dismissed manually
    });

    try {
      // Process temporary images (base64 -> permanent files)
      const processedPage = await processImages(editingPage);

      // Save to API
      await onSave(processedPage);

      // Update local state with processed page
      setEditingPage(processedPage);

      // Mark as saved to reset unsaved changes indicator (after state update)
      setTimeout(() => markAsSaved(processedPage), 0);

      // Calculate save duration
      const duration = Date.now() - startTime;
      const durationText = duration > 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;

      // Dismiss saving toast after a brief delay to show completion
      setTimeout(() => {
        savingToast.dismiss();

        // Show success toast with timing
        toast({
          title: "✅ Saved Successfully!",
          description: `Landing page "${editingPage.title}" saved in ${durationText} (${editingPage.components.length} components)`,
          duration: 3500, // Slightly shorter for better UX
        });
      }, 800); // 800ms delay để user thấy "Saving..." hoàn thành
    } catch (error) {
      console.error("Save error:", error);

      const duration = Date.now() - startTime;

      // Dismiss saving toast after a brief delay, then show error
      setTimeout(() => {
        savingToast.dismiss();

        toast({
          title: "❌ Save Failed",
          description:
            error instanceof Error
              ? `Error after ${duration}ms: ${error.message}`
              : "Failed to save page. Please try again.",
          variant: "destructive",
          duration: 6000,
        });
      }, 600); // Shorter delay for errors
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
    <EditModeProvider isEditMode={true} sidebarOpen={!!selectedComponentId}>
      <div className="min-h-screen bg-gray-100">
        {/* Top Toolbar */}
        <div
          className={`bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all duration-300 `}
        >
          <div
            className={`px-4 py-4 flex items-center justify-between ${
              selectedComponentId ? "" : "container mx-auto"
            }`}
          >
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold">{editingPage.title}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">/{editingPage.slug}</p>
                  {saving && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-600 font-medium">Saving...</span>
                    </div>
                  )}
                  {!saving && hasUnsavedChanges && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-orange-600 font-medium">Unsaved changes</span>
                    </div>
                  )}
                  {!saving && !hasUnsavedChanges && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">All changes saved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HiddenComponentsList
                components={editingPage.components}
                onToggleVisibility={handleToggleVisibility}
                onSelectComponent={requestSelectComponent}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setThemeSelectorOpen(true)}
                className="gap-1"
              >
                <Palette className="h-4 w-4" />
                Theme
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomThemeCreatorOpen(true)}
                className="gap-1"
              >
                <Paintbrush className="h-4 w-4" />
                Custom Theme
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportImportOpen(true)}
                className="gap-1"
              >
                <Download className="h-4 w-4" />
                Export/Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTemplatesOpen(true)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Component
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="gap-1"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHelpOpen(true)}
                className="gap-1"
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className={`gap-1 transition-all duration-200 ${
                  saving
                    ? "bg-blue-400 cursor-not-allowed"
                    : hasUnsavedChanges
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                {saving ? "Saving..." : hasUnsavedChanges ? "Save Changes*" : "Saved"}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div
          className={`transition-all duration-300 ${
            selectedComponentId
              ? "md:ml-96 md:mr-4" // Add margin and reduce width on desktop
              : "container mx-auto"
          } px-4 py-8`}
          style={{
            maxWidth: selectedComponentId ? "calc(100vw - 400px)" : undefined,
          }}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                    <EditableBlock
                      component={component}
                      isSelected={selectedComponentId === component.id}
                      onSelect={() => requestSelectComponent(component.id)}
                      onToggleVisibility={() => handleToggleVisibility(component.id)}
                      onDelete={() => handleDeleteComponent(component.id)}
                      onDuplicate={() => handleDuplicateComponent(component.id)}
                      onChangeTemplate={() => handleOpenChangeTemplate(component.id)}
                      onMoveUp={() => handleMoveUp(component.id)}
                      onMoveDown={() => handleMoveDown(component.id)}
                      canMoveUp={index > 0}
                      canMoveDown={index < sortedComponents.length - 1}
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
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="opacity-50 bg-white rounded-lg shadow-lg p-4 border-2 border-blue-400">
                    <div className="text-sm font-semibold text-gray-700">Moving component...</div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {sortedComponents.length === 0 && (
              <div className="py-20 text-center text-gray-500">
                <p>No components yet. Add your first component to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Component Editor Panel */}
        {selectedComponent && (
          <ComponentEditor
            component={selectedComponent}
            onUpdate={handleComponentUpdate}
            onClose={() => setSelectedComponentId(null)}
            allComponents={editingPage.components}
            subPages={editingPage.subPages || []}
            pageSlug={editingPage.slug}
            isMultiPage={editingPage.isMultiPage}
            onDirtyChange={setComponentEditorDirty}
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
          onOpenChange={setTemplatesOpen}
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
          isMultiPage={editingPage.isMultiPage}
          subPages={editingPage.subPages}
          pageTitle={editingPage.title}
        />

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

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
