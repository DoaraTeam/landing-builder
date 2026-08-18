"use client";

import { useState, useEffect } from "react";
import { LandingConfig, LandingPage, LandingPageVersion, Theme } from "@/types/landing";
import { TemplateSelector } from "@/components/editor/selectors/TemplateSelector";
import { LandingPageTemplate } from "@/lib/landing-templates";
import { EditableLandingPage } from "@/components/editor/core/EditableLandingPage";
import MultiPageEditor from "@/components/editor/core/MultiPageEditor";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { AlertDialog } from "@/components/editor/dialogs/AlertDialog";
import { VersionHistoryDialog } from "@/components/editor/dialogs/VersionHistoryDialog";
import { SaveBeforeChangeDialog } from "@/components/editor/dialogs/SaveBeforeChangeDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/loading-screen";
import { ArrowLeft, Eye, Upload, LayoutTemplate, History } from "lucide-react";
import { useRouter } from "next/navigation";

type EditorMode = "select-template" | "edit-single" | "edit-multi";

// Guarantees the loading screen is visible for a bit even when the config
// fetch resolves almost instantly, instead of flashing for a few ms.
const MIN_LOADING_TIME_MS = 2000;

type DialogState = {
  type:
    | "none"
    | "save-before-change"
    | "publish"
    | "publish-success"
    | "publish-error"
    | "version-history"
    | "version-applied";
  open: boolean;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [mode, setMode] = useState<EditorMode>("select-template");
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [draftPage, setDraftPage] = useState<LandingPage | null>(null);
  const [publishedPage, setPublishedPage] = useState<LandingPage | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({ type: "none", open: false });
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const startedAt = Date.now();
    try {
      const response = await fetch("/api/landing-config");
      const data = await response.json();
      setConfig(data);

      // Load draft and published from new structure
      if (data.currentLanding) {
        setDraftPage(data.currentLanding.draft);
        setPublishedPage(data.currentLanding.published);
        setActiveVersionId(data.currentLanding.activeVersionId || null);

        // If has draft, go to editor
        if (data.currentLanding.draft) {
          setMode(data.currentLanding.draft.isMultiPage ? "edit-multi" : "edit-single");
        } else {
          setMode("select-template");
          setTemplateSelectorOpen(true);
        }
      } else {
        // First time or legacy data
        setMode("select-template");
        setTemplateSelectorOpen(true);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      const remaining = MIN_LOADING_TIME_MS - (Date.now() - startedAt);
      setTimeout(() => setLoading(false), Math.max(0, remaining));
    }
  };

  const handleSelectTemplate = (template: LandingPageTemplate, type: "single" | "multi") => {
    const newPage: LandingPage = {
      id: `page-${Date.now()}`,
      title: template.name,
      description: template.description,
      slug: template.id,
      theme: "modern",
      seo: {
        metaTitle: template.name,
        metaDescription: template.description,
        keywords: [],
      },
      components: template.components.map((comp, idx) => ({
        ...comp,
        id: `comp-${Date.now()}-${idx}`,
        order: idx + 1,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      isMultiPage: type === "multi",
      subPages: type === "multi" ? [] : undefined,
      navigation:
        type === "multi"
          ? {
              enabled: true,
              style: "tabs",
              showIcons: false,
              sticky: true,
            }
          : undefined,
    };

    setDraftPage(newPage);
    setActiveVersionId(null); // Clear active version when selecting new template
    setMode(type === "multi" ? "edit-multi" : "edit-single");
    setTemplateSelectorOpen(false);
  };

  const handleSaveDraft = async (updatedPage: LandingPage) => {
    if (!config) return;

    setSaving(true);
    try {
      let updatedVersions = config.currentLanding?.versions || [];

      // If editing an active version, update that version
      if (activeVersionId) {
        updatedVersions = updatedVersions.map((v) =>
          v.id === activeVersionId
            ? {
                ...v,
                page: updatedPage,
                createdAt: v.createdAt, // Keep original creation time
              }
            : v
        );
      }

      // Ensure isMultiPage is preserved if subPages exist
      const pageToSave = {
        ...updatedPage,
        isMultiPage:
          updatedPage.isMultiPage || (updatedPage.subPages && updatedPage.subPages.length > 0),
      };

      const updatedConfig = {
        ...config,
        currentLanding: {
          draft: pageToSave,
          published: publishedPage,
          publishedAt: config.currentLanding?.publishedAt,
          versions: updatedVersions,
          activeVersionId: activeVersionId,
        },
      };

      const response = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        setDraftPage(pageToSave);
        setConfig(updatedConfig);
        // Auto-saved successfully
      } else {
        console.error("Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      setDialogState({
        type: "publish-error",
        open: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishClick = () => {
    setDialogState({ type: "publish", open: true });
  };

  const handlePublishConfirm = async () => {
    if (!config || !draftPage) return;

    setSaving(true);
    try {
      const updatedConfig = {
        ...config,
        currentLanding: {
          draft: draftPage,
          published: { ...draftPage, status: "published" as const },
          publishedAt: new Date().toISOString(),
          versions: config.currentLanding?.versions || [], // Preserve versions
          activeVersionId: activeVersionId, // Preserve active version
        },
      };

      const response = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        setPublishedPage({ ...draftPage, status: "published" });
        setConfig(updatedConfig);
        setDialogState({ type: "publish-success", open: true });
      } else {
        setDialogState({ type: "publish-error", open: true });
      }
    } catch (error) {
      console.error("Error publishing:", error);
      setDialogState({ type: "publish-error", open: true });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeTemplateClick = () => {
    // Always ask to save before changing template
    // If editing a saved version, it will update that version
    // If editing unsaved content, it will create a new version
    setDialogState({ type: "save-before-change", open: true });
  };

  const handleSaveAndChangeTemplate = async (name: string, description?: string) => {
    if (activeVersionId) {
      // If editing a saved version, just save (it will auto-update that version)
      await handleSaveDraft(draftPage!);
    } else {
      // If editing unsaved content, save as new version
      await handleSaveVersion(name, description);
    }
    // Then change template
    setMode("select-template");
    setTemplateSelectorOpen(true);
    setDraftPage(null);
    setActiveVersionId(null);
  };

  const handleChangeTemplateWithoutSaving = () => {
    setMode("select-template");
    setTemplateSelectorOpen(true);
    setDraftPage(null);
    setActiveVersionId(null);
  };

  const handleVersionHistoryClick = () => {
    setDialogState({ type: "version-history", open: true });
  };

  const handleSaveVersion = async (name: string, description?: string) => {
    if (!config || !draftPage) return;

    const newVersion: LandingPageVersion = {
      id: `version-${Date.now()}`,
      name,
      description,
      page: { ...draftPage },
      createdAt: new Date().toISOString(),
    };

    const updatedVersions = [...(config.currentLanding?.versions || []), newVersion];

    const updatedConfig = {
      ...config,
      currentLanding: {
        ...config.currentLanding,
        draft: draftPage,
        published: publishedPage,
        versions: updatedVersions,
      },
    };

    try {
      const response = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        setConfig(updatedConfig);
      }
    } catch (error) {
      console.error("Error saving version:", error);
    }
  };

  const handleApplyVersion = async (version: LandingPageVersion) => {
    if (!config) return;

    // Create a deep copy to avoid reference issues
    const restoredPage: LandingPage = JSON.parse(JSON.stringify(version.page));
    restoredPage.updatedAt = new Date().toISOString();

    // Update all states
    setDraftPage(restoredPage);
    setActiveVersionId(version.id);
    setMode(restoredPage.isMultiPage ? "edit-multi" : "edit-single");

    const updatedConfig = {
      ...config,
      currentLanding: {
        ...config.currentLanding,
        draft: restoredPage,
        published: publishedPage,
        versions: config.currentLanding?.versions || [],
        activeVersionId: version.id,
      },
    };

    try {
      const response = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        setConfig(updatedConfig);
        setDialogState({ type: "version-applied", open: true });
      }
    } catch (error) {
      console.error("Error applying version:", error);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!config) return;

    const updatedVersions = (config.currentLanding?.versions || []).filter(
      (v) => v.id !== versionId
    );

    const updatedConfig = {
      ...config,
      currentLanding: {
        ...config.currentLanding,
        draft: draftPage,
        published: publishedPage,
        versions: updatedVersions,
      },
    };

    try {
      const response = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        setConfig(updatedConfig);
      }
    } catch (error) {
      console.error("Error deleting version:", error);
    }
  };

  const handleSaveCustomTheme = async (theme: Theme, themeId: string) => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      themes: { ...config.themes, [themeId]: theme },
    };

    const response = await fetch("/api/landing-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedConfig),
    });

    if (!response.ok) {
      throw new Error("Failed to save custom theme");
    }

    setConfig(updatedConfig);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">Error loading configuration</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold">Editor</h1>
                {draftPage && (
                  <p className="text-sm text-gray-500">
                    {draftPage.isMultiPage ? "Multi-Page" : "Single-Page"} • {draftPage.title}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {draftPage && (
                <>
                  {/* <Badge variant={publishedPage ? "default" : "secondary"}>
                    {publishedPage ? "Published" : "Draft"}
                  </Badge>
                  {activeVersionId && (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      Editing:{" "}
                      {config?.currentLanding?.versions?.find((v) => v.id === activeVersionId)
                        ?.name || "Version"}
                    </Badge>
                  )} */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={previewing || !draftPage}
                    onClick={async () => {
                      if (!draftPage) return;

                      setPreviewing(true);
                      try {
                        // Save draft before preview
                        await handleSaveDraft(draftPage);

                        // Small delay to ensure save completes
                        await new Promise((resolve) => setTimeout(resolve, 500));

                        // Open preview in new tab
                        const previewWindow = window.open("/preview", "_blank");

                        // Check if popup was blocked
                        if (
                          !previewWindow ||
                          previewWindow.closed ||
                          typeof previewWindow.closed == "undefined"
                        ) {
                          alert("Popup blocked! Please allow popups for this site and try again.");
                        }
                      } catch (error) {
                        console.error("Failed to save before preview:", error);
                        // Try to open preview anyway
                        window.open("/preview", "_blank");
                      } finally {
                        setPreviewing(false);
                      }
                    }}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {previewing ? "Saving..." : "Preview"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVersionHistoryClick}
                    className="gap-2"
                  >
                    <History className="h-4 w-4" />
                    Versions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeTemplateClick}
                    className="gap-2"
                  >
                    <LayoutTemplate className="h-4 w-4" />
                    Change Template
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePublishClick}
                    disabled={saving}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Upload className="h-4 w-4" />
                    {saving ? "Publishing..." : "Publish"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Template Selector - Always render modal */}
        <TemplateSelector
          open={templateSelectorOpen}
          onOpenChange={setTemplateSelectorOpen}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Show editor when template is selected */}
        {mode === "edit-single" && draftPage && config && (
          <EditableLandingPage
            page={draftPage}
            config={config}
            onSave={handleSaveDraft}
            onSaveCustomTheme={handleSaveCustomTheme}
          />
        )}

        {mode === "edit-multi" && draftPage && config && (
          <MultiPageEditor
            page={draftPage}
            config={config}
            onSave={handleSaveDraft}
            onSaveCustomTheme={handleSaveCustomTheme}
          />
        )}

        {/* Show template selector placeholder when no draft */}
        {mode === "select-template" && !draftPage && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Select a Template to Get Started</h2>
              <p className="text-gray-600 mb-6">
                Choose a template from the modal or create a blank page
              </p>
              <Button onClick={() => setTemplateSelectorOpen(true)}>Open Template Selector</Button>
            </div>
          </div>
        )}
      </main>

      {/* Save Before Change Dialog */}
      <SaveBeforeChangeDialog
        open={dialogState.type === "save-before-change" && dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        onSaveAndContinue={handleSaveAndChangeTemplate}
        onContinueWithoutSaving={handleChangeTemplateWithoutSaving}
        actionName="change template"
        hasActiveVersion={!!activeVersionId}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={dialogState.type === "publish" && dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        title="Publish Landing Page"
        description="Are you sure you want to publish this landing page? It will be visible at the root domain and replace any existing published page."
        confirmText="Publish"
        cancelText="Cancel"
        onConfirm={handlePublishConfirm}
        variant="success"
        loading={saving}
      />

      {/* Alert Dialogs */}
      <AlertDialog
        open={dialogState.type === "publish-success" && dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        title="Published Successfully!"
        description="Your landing page has been published successfully. Visit the homepage to see it live."
        variant="success"
      />

      <AlertDialog
        open={dialogState.type === "publish-error" && dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        title="Publish Failed"
        description="Failed to publish the landing page. Please try again or check the console for errors."
        variant="error"
      />

      <AlertDialog
        open={dialogState.type === "version-applied" && dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        title="Version Applied!"
        description="The selected version has been restored successfully. You can now continue editing."
        variant="success"
      />

      {/* Version History Dialog */}
      {draftPage && (
        <VersionHistoryDialog
          open={dialogState.type === "version-history" && dialogState.open}
          onOpenChange={(open) => setDialogState({ ...dialogState, open })}
          currentPage={draftPage}
          versions={config?.currentLanding?.versions || []}
          activeVersionId={activeVersionId}
          onSaveVersion={handleSaveVersion}
          onApplyVersion={handleApplyVersion}
          onDeleteVersion={handleDeleteVersion}
        />
      )}
    </div>
  );
}
