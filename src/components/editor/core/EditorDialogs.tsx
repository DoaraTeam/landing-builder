"use client";

import { LandingPage, LandingPageVersion } from "@/types/landing";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { AlertDialog } from "@/components/editor/dialogs/AlertDialog";
import { SaveBeforeChangeDialog } from "@/components/editor/dialogs/SaveBeforeChangeDialog";
import { OpenPageDialog } from "@/components/editor/dialogs/OpenPageDialog";
import type { DialogState } from "@/hooks/use-version-history";

interface EditorDialogsProps {
  openPageDialogOpen: boolean;
  onOpenPageDialogOpenChange: (open: boolean) => void;
  onSelectPage: (pageId: string) => void;

  dialogState: DialogState;
  onDialogStateChange: (state: DialogState) => void;

  onSaveAndChangeTemplate: (name: string, description?: string) => void | Promise<void>;
  onChangeTemplateWithoutSaving: () => void;

  draftPage: LandingPage | null;
  pendingRestoreVersion: LandingPageVersion | null;
  onClearPendingRestoreVersion: () => void;
  onPerformRestore: (version: LandingPageVersion, extraVersion?: LandingPageVersion) => void;

  onPublishConfirm: () => void;
  publishing: boolean;
}

/** Every dialog AdminDashboard mounts that isn't tied to the header bar or
 * the canvas itself — extracted verbatim from editor/page.tsx's JSX. */
export function EditorDialogs({
  openPageDialogOpen,
  onOpenPageDialogOpenChange,
  onSelectPage,
  dialogState,
  onDialogStateChange,
  onSaveAndChangeTemplate,
  onChangeTemplateWithoutSaving,
  draftPage,
  pendingRestoreVersion,
  onClearPendingRestoreVersion,
  onPerformRestore,
  onPublishConfirm,
  publishing,
}: EditorDialogsProps) {
  return (
    <>
      {/* File > Open */}
      <OpenPageDialog
        open={openPageDialogOpen}
        onOpenChange={onOpenPageDialogOpenChange}
        onSelectPage={onSelectPage}
      />

      {/* Save Before Change Dialog */}
      <SaveBeforeChangeDialog
        open={dialogState.type === "save-before-change" && dialogState.open}
        onOpenChange={(open) => onDialogStateChange({ ...dialogState, open })}
        onSaveAndContinue={onSaveAndChangeTemplate}
        onContinueWithoutSaving={onChangeTemplateWithoutSaving}
        actionName="change template"
      />

      {/* Save Before Restore Dialog — guards Restore against silently losing
          draft changes that were never captured as a named version */}
      <SaveBeforeChangeDialog
        open={dialogState.type === "save-before-restore" && dialogState.open}
        onOpenChange={(open) => {
          onDialogStateChange({ ...dialogState, open });
          if (!open) onClearPendingRestoreVersion();
        }}
        onSaveAndContinue={(name, description) => {
          if (!pendingRestoreVersion || !draftPage) return;
          const extraVersion: LandingPageVersion = {
            id: `version-${Date.now()}-saved`,
            name,
            description,
            page: { ...draftPage },
            createdAt: new Date().toISOString(),
          };
          onPerformRestore(pendingRestoreVersion, extraVersion);
          onClearPendingRestoreVersion();
        }}
        onContinueWithoutSaving={() => {
          if (!pendingRestoreVersion) return;
          onPerformRestore(pendingRestoreVersion);
          onClearPendingRestoreVersion();
        }}
        actionName="restore this version"
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={dialogState.type === "publish" && dialogState.open}
        onOpenChange={(open) => onDialogStateChange({ ...dialogState, open })}
        title="Publish Landing Page"
        description="Are you sure you want to publish this landing page? It will be visible at its live URL and replace any existing published version of this page."
        confirmText="Publish"
        cancelText="Cancel"
        onConfirm={onPublishConfirm}
        variant="success"
        loading={publishing}
      />

      {/* Alert Dialogs */}
      <AlertDialog
        open={dialogState.type === "publish-success" && dialogState.open}
        onOpenChange={(open) => onDialogStateChange({ ...dialogState, open })}
        title="Published Successfully!"
        description="Your landing page has been published successfully."
        variant="success"
      />

      <AlertDialog
        open={dialogState.type === "publish-error" && dialogState.open}
        onOpenChange={(open) => onDialogStateChange({ ...dialogState, open })}
        title="Publish Failed"
        description="Failed to publish the landing page. Please try again or check the console for errors."
        variant="error"
      />
    </>
  );
}
