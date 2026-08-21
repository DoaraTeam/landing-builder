"use client";

import { useToast } from "@/hooks/use-toast";
import { getTheme } from "@/lib/themes";
import { LandingConfig, LandingPage, PageNavigation, Theme } from "@/types/landing";

interface UsePageSettingsParams {
  editingPage: LandingPage;
  setEditingPage: (page: LandingPage) => void;
  toast: ReturnType<typeof useToast>["toast"];
  config: LandingConfig;
  onSaveCustomTheme?: (theme: Theme, themeId: string) => Promise<void>;
  onUpdateNavigation?: (navigation: PageNavigation) => void;
}

// Owns the page-settings/theme/navigation-settings save handlers — extracted
// verbatim from EditableLandingPage.tsx.
export function usePageSettings({
  editingPage,
  setEditingPage,
  toast,
  config,
  onSaveCustomTheme,
  onUpdateNavigation,
}: UsePageSettingsParams) {
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

  return {
    handleSaveSettings,
    handleThemeChange,
    handleSaveCustomTheme,
    handleUpdateNavigation,
  };
}
