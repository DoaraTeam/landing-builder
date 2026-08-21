"use client";

import {
  ComponentConfig,
  LandingConfig,
  LandingPage,
  PageNavigation,
  Theme,
} from "@/types/landing";
import ComponentTemplatesPanel from "@/components/editor/panels/ComponentTemplatesPanel";
import PageSettingsModal from "@/components/editor/dialogs/PageSettingsModal";
import CustomCodeDialog from "@/components/editor/dialogs/CustomCodeDialog";
import { ExportImportDialog } from "@/components/editor/dialogs/ExportImportDialog";
import { ChangeTemplateDialog } from "@/components/editor/dialogs/ChangeTemplateDialog";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import ThemeManager from "@/components/editor/selectors/ThemeManager";
import NavigationSettings from "@/components/editor/selectors/NavigationSettings";

interface EditableLandingPageDialogsProps {
  editingPage: LandingPage;
  config: LandingConfig;

  // Guard against silently discarding edits when switching components elsewhere
  pendingSelection: { id: string | null } | null;
  onPendingSelectionOpenChange: (open: boolean) => void;
  onConfirmPendingSelection: () => void;

  // Component Templates Panel
  templatesOpen: boolean;
  onTemplatesOpenChange: (open: boolean) => void;
  onAddComponent: (component: ComponentConfig) => void;

  // Page Settings Modal
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  onSaveSettings: (updates: Partial<LandingPage>) => Promise<void>;

  // Custom Code
  customCodeOpen: boolean;
  onCustomCodeOpenChange: (open: boolean) => void;

  // Export/Import Dialog
  exportImportOpen: boolean;
  exportImportTab: "export" | "import";
  onExportImportClose: () => void;
  onImportComponents: (components: ComponentConfig[]) => void;

  // Theme (presets + custom creator)
  themeManagerOpen: boolean;
  onThemeManagerOpenChange: (open: boolean) => void;
  onThemeChange: (themeId: string) => void;
  onSaveCustomTheme: (theme: Theme, themeId: string) => Promise<void>;

  // Navigation Settings (multi-page only)
  navigationSettingsOpen: boolean;
  onNavigationSettingsOpenChange: (open: boolean) => void;
  onUpdateNavigation?: (navigation: PageNavigation) => void;
  onUpdateNavigationSettings: (navigation: PageNavigation) => void;

  // Change Template Dialog
  changeTemplateDialogOpen: boolean;
  componentToChangeTemplate: ComponentConfig | null;
  onCloseChangeTemplate: () => void;
  onChangeTemplate: (newConfig: Partial<ComponentConfig>) => void;
}

/** Every dialog/panel EditableLandingPage mounts alongside its canvas —
 * extracted verbatim from EditableLandingPage.tsx's JSX. */
export function EditableLandingPageDialogs({
  editingPage,
  config,
  pendingSelection,
  onPendingSelectionOpenChange,
  onConfirmPendingSelection,
  templatesOpen,
  onTemplatesOpenChange,
  onAddComponent,
  settingsOpen,
  onSettingsOpenChange,
  onSaveSettings,
  customCodeOpen,
  onCustomCodeOpenChange,
  exportImportOpen,
  exportImportTab,
  onExportImportClose,
  onImportComponents,
  themeManagerOpen,
  onThemeManagerOpenChange,
  onThemeChange,
  onSaveCustomTheme,
  navigationSettingsOpen,
  onNavigationSettingsOpenChange,
  onUpdateNavigation,
  onUpdateNavigationSettings,
  changeTemplateDialogOpen,
  componentToChangeTemplate,
  onCloseChangeTemplate,
  onChangeTemplate,
}: EditableLandingPageDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={!!pendingSelection}
        onOpenChange={onPendingSelectionOpenChange}
        title="Discard unsaved changes?"
        description="You have unsaved changes to the current component. Switching now will discard them."
        confirmText="Discard"
        variant="destructive"
        onConfirm={onConfirmPendingSelection}
      />

      {/* Component Templates Panel */}
      <ComponentTemplatesPanel
        open={templatesOpen}
        onOpenChange={onTemplatesOpenChange}
        onAddComponent={onAddComponent}
        existingComponents={editingPage.components}
      />

      {/* Page Settings Modal */}
      <PageSettingsModal
        open={settingsOpen}
        onOpenChange={onSettingsOpenChange}
        page={editingPage}
        config={config}
        onSave={onSaveSettings}
      />

      {/* Custom Code */}
      <CustomCodeDialog
        open={customCodeOpen}
        onOpenChange={onCustomCodeOpenChange}
        code={editingPage.customCode}
        onSave={(code) => onSaveSettings({ customCode: code })}
      />

      {/* Export/Import Dialog */}
      <ExportImportDialog
        isOpen={exportImportOpen}
        initialTab={exportImportTab}
        onClose={onExportImportClose}
        components={editingPage.components}
        onImport={onImportComponents}
        isMultiPage={(editingPage.subPages?.length ?? 0) > 0}
        subPages={editingPage.subPages}
        pageTitle={editingPage.title}
      />

      {/* Theme (presets + custom creator, one Sheet) */}
      <ThemeManager
        open={themeManagerOpen}
        onOpenChange={onThemeManagerOpenChange}
        currentThemeId={editingPage.theme}
        onThemeChange={onThemeChange}
        onSaveTheme={onSaveCustomTheme}
      />

      {/* Navigation Settings (multi-page only) */}
      {(editingPage.subPages?.length ?? 0) > 0 && onUpdateNavigation && (
        <NavigationSettings
          open={navigationSettingsOpen}
          onOpenChange={onNavigationSettingsOpenChange}
          navigation={editingPage.navigation}
          onUpdate={onUpdateNavigationSettings}
        />
      )}

      {/* Change Template Dialog */}
      {componentToChangeTemplate && (
        <ChangeTemplateDialog
          isOpen={changeTemplateDialogOpen}
          onClose={onCloseChangeTemplate}
          component={componentToChangeTemplate}
          onChangeTemplate={onChangeTemplate}
        />
      )}
    </>
  );
}
