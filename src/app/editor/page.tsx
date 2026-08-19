"use client";

import { useState, useEffect } from "react";
import { LandingConfig, LandingPage, LandingPageVersion, Theme } from "@/types/landing";
import { TemplateSelector } from "@/components/editor/selectors/TemplateSelector";
import { LandingPageTemplate } from "@/lib/landing-templates";
import {
  EditableLandingPage,
  DISABLED_EDIT_MENU_STATE,
  type EditMenuState,
} from "@/components/editor/core/EditableLandingPage";
import MultiPageEditor from "@/components/editor/core/MultiPageEditor";
import VersionHistorySidebar from "@/components/editor/core/VersionHistorySidebar";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { AlertDialog } from "@/components/editor/dialogs/AlertDialog";
import { SaveBeforeChangeDialog } from "@/components/editor/dialogs/SaveBeforeChangeDialog";
import { KeyboardShortcutsHelp } from "@/components/editor/panels/KeyboardShortcutsHelp";
import { RenamePageDialog } from "@/components/editor/dialogs/RenamePageDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingScreen } from "@/components/loading-screen";
import {
  Home,
  Eye,
  Upload,
  LayoutTemplate,
  History,
  FilePlus,
  FolderOpen,
  Copy,
  Pencil,
  Keyboard,
  BookOpen,
  Undo2,
  Redo2,
  Scissors,
  ClipboardPaste,
  CheckSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

type EditorMode = "select-template" | "edit-single" | "edit-multi";

// Guarantees the loading screen is visible for a bit even when the config
// fetch resolves almost instantly, instead of flashing for a few ms.
const MIN_LOADING_TIME_MS = 2000;

type DialogState = {
  type:
    | "none"
    | "save-before-change"
    | "save-before-restore"
    | "publish"
    | "publish-success"
    | "publish-error";
  open: boolean;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [mode, setMode] = useState<EditorMode>("select-template");
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [draftPage, setDraftPage] = useState<LandingPage | null>(null);
  const [publishedPage, setPublishedPage] = useState<LandingPage | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({ type: "none", open: false });
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  // Lifted out of MultiPageEditor so opening the version sidebar can force it
  // collapsed; shared between the live editor and the version-preview render,
  // since only one of the two is ever mounted at a time.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [versionSidebarOpen, setVersionSidebarOpen] = useState(false);
  // The version currently being previewed read-only; null = viewing/editing
  // the live draft (still read-only while the sidebar is open, editable once
  // it's closed).
  const [previewedVersion, setPreviewedVersion] = useState<LandingPageVersion | null>(null);
  // Set while the "save unversioned work before restoring?" guard is open, so
  // its callbacks know which version to actually restore afterward.
  const [pendingRestoreVersion, setPendingRestoreVersion] = useState<LandingPageVersion | null>(
    null
  );
  // Bubbled up from whichever EditableLandingPage instance is currently
  // mounted (single- or multi-page) — drives the Edit menu's Undo/Redo/
  // Cut/Copy/Paste items, which live here rather than inside that component.
  const [editMenuState, setEditMenuState] = useState<EditMenuState>(DISABLED_EDIT_MENU_STATE);
  // Guards the File > New action, since choosing a template replaces the
  // entire current page.
  const [newPageConfirmOpen, setNewPageConfirmOpen] = useState(false);

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
    closeVersionSidebar();
    setPreviewedVersion(null);
    setMode(type === "multi" ? "edit-multi" : "edit-single");
    setTemplateSelectorOpen(false);
  };

  const handleSaveDraft = async (updatedPage: LandingPage) => {
    if (!config) return;

    setSaving(true);
    try {
      // Ensure isMultiPage is preserved if subPages exist
      const pageToSave = {
        ...updatedPage,
        isMultiPage:
          updatedPage.isMultiPage || (updatedPage.subPages && updatedPage.subPages.length > 0),
      };

      // Versions are immutable snapshots — saving the live draft never
      // rewrites a version's stored content, even if `activeVersionId` is
      // set (that field is now purely "restored from", informational only).
      const updatedConfig = {
        ...config,
        currentLanding: {
          draft: pageToSave,
          published: publishedPage,
          publishedAt: config.currentLanding?.publishedAt,
          versions: config.currentLanding?.versions || [],
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
    // Always ask to save before changing template — versions are immutable
    // snapshots now, so this always creates a new one rather than silently
    // updating whatever version the draft was last restored from.
    setDialogState({ type: "save-before-change", open: true });
  };

  const handleSaveAndChangeTemplate = async (name: string, description?: string) => {
    await handleSaveVersion(name, description);
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

  // Closing the version sidebar re-expands the pages sidebar if it's still
  // collapsed from being force-collapsed when the version sidebar opened.
  const closeVersionSidebar = () => {
    setVersionSidebarOpen(false);
    setSidebarCollapsed(false);
  };

  const handleVersionHistoryClick = () => {
    if (versionSidebarOpen) {
      closeVersionSidebar();
      setPreviewedVersion(null);
    } else {
      setVersionSidebarOpen(true);
      setSidebarCollapsed(true);
    }
  };

  // Persists a full config update and, on success, mirrors it into local
  // state. Shared by every version/draft-mutating handler below so there's
  // one place that talks to the API.
  const persistConfig = async (updatedConfig: LandingConfig): Promise<boolean> => {
    try {
      const response = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });

      if (response.ok) {
        setConfig(updatedConfig);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving config:", error);
      return false;
    }
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

    await persistConfig({
      ...config,
      currentLanding: {
        ...config.currentLanding,
        draft: draftPage,
        published: publishedPage,
        versions: [...(config.currentLanding?.versions || []), newVersion],
      },
    });
  };

  // File > Make a Copy — there's no independent-document model to copy
  // *into* here (only one draft exists at a time), so the closest real
  // equivalent is snapshotting the current page as a named version, which
  // the user can later restore as its own draft from Version History.
  const handleMakeACopy = async () => {
    if (!draftPage) return;
    await handleSaveVersion(`Copy of ${draftPage.title}`, "Created via File > Make a Copy");
    toast.success({
      title: "Copy Created",
      description: `Saved as a version — find "Copy of ${draftPage.title}" in Version History.`,
    });
  };

  // Whether the live draft differs from every existing saved version — if
  // so, restoring an old version would silently lose it (it was never
  // captured as a named snapshot, only continuously autosaved as the draft).
  const hasUnversionedChanges = (page: LandingPage): boolean => {
    const versions = config?.currentLanding?.versions || [];
    const normalize = (p: LandingPage) => JSON.stringify({ ...p, updatedAt: undefined });
    const currentNormalized = normalize(page);
    return !versions.some((v) => normalize(v.page) === currentNormalized);
  };

  // Restoring never mutates or removes the source version — it only ever
  // reads `version.page` to build a brand new version entry (fresh id/time,
  // same content), which becomes the live draft. `extraVersion`, when given,
  // is appended alongside it in the same update (used by the "save my
  // unversioned work first" guard, so both additions land in one atomic
  // config write instead of two sequential ones that could race).
  const performRestore = (version: LandingPageVersion, extraVersion?: LandingPageVersion) => {
    // Every caller reaches this right as a Radix overlay (a DropdownMenu
    // "Restore" item, or the save-before-restore Dialog) is closing itself.
    // setMode below can swap the entire editor subtree (single- <-> multi-
    // page), and if that remount lands while the overlay's own close/cleanup
    // is still settling, Radix can leave document.body's pointer-events
    // lock stuck — the whole editor goes unclickable. Deferring to a macro-
    // task lets the overlay finish closing first.
    setTimeout(async () => {
      if (!config) return;

      const restoredContent: LandingPage = JSON.parse(JSON.stringify(version.page));
      const restoredDraft: LandingPage = {
        ...restoredContent,
        updatedAt: new Date().toISOString(),
      };
      const newVersion: LandingPageVersion = {
        id: `version-${Date.now()}-restored`,
        name: version.name,
        description: version.description,
        page: restoredContent,
        createdAt: new Date().toISOString(),
      };

      const baseVersions = config.currentLanding?.versions || [];
      const updatedVersions = extraVersion
        ? [...baseVersions, extraVersion, newVersion]
        : [...baseVersions, newVersion];

      const ok = await persistConfig({
        ...config,
        currentLanding: {
          ...config.currentLanding,
          draft: restoredDraft,
          published: publishedPage,
          versions: updatedVersions,
          activeVersionId: newVersion.id,
        },
      });

      if (ok) {
        setDraftPage(restoredDraft);
        setActiveVersionId(newVersion.id);
        setMode(restoredDraft.isMultiPage ? "edit-multi" : "edit-single");
        setPreviewedVersion(null);
        closeVersionSidebar();
        toast.success({
          title: "Version restored",
          description: `"${version.name}" is now the live draft.`,
        });
      }
    }, 0);
  };

  const handleRestoreVersion = (version: LandingPageVersion) => {
    if (draftPage && hasUnversionedChanges(draftPage)) {
      setPendingRestoreVersion(version);
      setDialogState({ type: "save-before-restore", open: true });
    } else {
      performRestore(version);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!config) return;

    await persistConfig({
      ...config,
      currentLanding: {
        ...config.currentLanding,
        draft: draftPage,
        published: publishedPage,
        versions: (config.currentLanding?.versions || []).filter((v) => v.id !== versionId),
      },
    });
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

  const handleRenamePage = async (newTitle: string) => {
    if (!draftPage) return;
    await handleSaveDraft({ ...draftPage, title: newTitle });
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
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push("/")}
                      className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Home className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Home</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="h-6 w-px bg-gray-300" />
              {draftPage && (
                <div className="flex items-center gap-0.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
                      >
                        File
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => setTimeout(() => setNewPageConfirmOpen(true), 0)}
                      >
                        <FilePlus className="h-4 w-4" />
                        New
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <FolderOpen className="h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMakeACopy()}>
                        <Copy className="h-4 w-4" />
                        Make a Copy
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setTimeout(() => setRenameOpen(true), 0)}>
                        <Pencil className="h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
                      >
                        Edit
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        disabled={!editMenuState.canUndo}
                        onClick={() => editMenuState.undo()}
                      >
                        <Undo2 className="h-4 w-4" />
                        Undo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!editMenuState.canRedo}
                        onClick={() => editMenuState.redo()}
                      >
                        <Redo2 className="h-4 w-4" />
                        Redo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!editMenuState.canCut}
                        onClick={() => editMenuState.cut()}
                      >
                        <Scissors className="h-4 w-4" />
                        Cut
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!editMenuState.canCopy}
                        onClick={() => editMenuState.copy()}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!editMenuState.canPaste}
                        onClick={() => editMenuState.paste()}
                      >
                        <ClipboardPaste className="h-4 w-4" />
                        Paste
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        <CheckSquare className="h-4 w-4" />
                        Select All
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
                      >
                        Layout
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => setTimeout(() => handleChangeTemplateClick(), 0)}
                      >
                        <LayoutTemplate className="h-4 w-4 text-amber-600" />
                        Change Template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-gray-700 hover:bg-gray-100 data-[state=open]:bg-gray-200 data-[state=open]:text-gray-900"
                      >
                        Help
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setTimeout(() => setHelpOpen(true), 0)}>
                        <Keyboard className="h-4 w-4 text-gray-600" />
                        Keyboard Shortcuts
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <BookOpen className="h-4 w-4" />
                        Documentation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {draftPage && (
                <>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleVersionHistoryClick}
                          className="h-8 w-8 text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Versions</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
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
                                toast.warning({
                                  title: "Popup Blocked",
                                  description: "Please allow popups for this site and try again.",
                                });
                              }
                            } catch (error) {
                              console.error("Failed to save before preview:", error);
                              // Try to open preview anyway
                              window.open("/preview", "_blank");
                            } finally {
                              setPreviewing(false);
                            }
                          }}
                          className="h-8 w-8 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{previewing ? "Saving..." : "Preview"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

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
      <main className="flex-1 min-h-0 flex overflow-hidden">
        <div
          className={
            previewedVersion
              ? previewedVersion.page.isMultiPage
                ? "flex-1 min-h-0 overflow-hidden"
                : "flex-1 min-h-0 overflow-y-auto p-6"
              : mode === "edit-multi"
                ? "flex-1 min-h-0 overflow-hidden"
                : "flex-1 min-h-0 overflow-y-auto p-6"
          }
        >
          {/* Template Selector - Always render modal */}
          <TemplateSelector
            open={templateSelectorOpen}
            onOpenChange={setTemplateSelectorOpen}
            onSelectTemplate={handleSelectTemplate}
          />

          {previewedVersion ? (
            // Browsing a historical version — read-only, and its own
            // isMultiPage decides single- vs. multi-page rendering (it can
            // differ from the live draft's current shape).
            previewedVersion.page.isMultiPage ? (
              <MultiPageEditor
                key={`preview-${previewedVersion.id}`}
                page={previewedVersion.page}
                config={config}
                onSave={async () => {}}
                sidebarCollapsed={sidebarCollapsed}
                onSidebarCollapsedChange={setSidebarCollapsed}
                onEditMenuStateChange={setEditMenuState}
                readOnly
              />
            ) : (
              <EditableLandingPage
                key={`preview-${previewedVersion.id}`}
                page={previewedVersion.page}
                config={config}
                onSave={async () => {}}
                onEditMenuStateChange={setEditMenuState}
                readOnly
              />
            )
          ) : (
            <>
              {/* Show editor when template is selected. Read-only while the
                  version sidebar is open, even with nothing previewed yet —
                  opening it puts the canvas in view mode immediately. */}
              {mode === "edit-single" && draftPage && config && (
                <EditableLandingPage
                  page={draftPage}
                  config={config}
                  onSave={handleSaveDraft}
                  onSaveCustomTheme={handleSaveCustomTheme}
                  onEditMenuStateChange={setEditMenuState}
                  readOnly={versionSidebarOpen}
                />
              )}

              {mode === "edit-multi" && draftPage && config && (
                <MultiPageEditor
                  page={draftPage}
                  config={config}
                  onSave={handleSaveDraft}
                  onSaveCustomTheme={handleSaveCustomTheme}
                  sidebarCollapsed={sidebarCollapsed}
                  onSidebarCollapsedChange={setSidebarCollapsed}
                  onEditMenuStateChange={setEditMenuState}
                  readOnly={versionSidebarOpen}
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
                    <Button onClick={() => setTemplateSelectorOpen(true)}>
                      Open Template Selector
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {versionSidebarOpen && draftPage && (
          <VersionHistorySidebar
            currentPage={draftPage}
            versions={config?.currentLanding?.versions || []}
            previewedVersionId={previewedVersion?.id ?? null}
            onSelectVersion={setPreviewedVersion}
            onSaveVersion={handleSaveVersion}
            onRestoreVersion={handleRestoreVersion}
            onDeleteVersion={handleDeleteVersion}
            onClose={() => {
              closeVersionSidebar();
              setPreviewedVersion(null);
            }}
          />
        )}
      </main>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Rename Page Dialog */}
      {draftPage && (
        <RenamePageDialog
          open={renameOpen}
          onOpenChange={setRenameOpen}
          currentTitle={draftPage.title}
          onRename={handleRenamePage}
        />
      )}

      {/* Save Before Change Dialog */}
      <SaveBeforeChangeDialog
        open={dialogState.type === "save-before-change" && dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        onSaveAndContinue={handleSaveAndChangeTemplate}
        onContinueWithoutSaving={handleChangeTemplateWithoutSaving}
        actionName="change template"
      />

      {/* Save Before Restore Dialog — guards Restore against silently losing
          draft changes that were never captured as a named version */}
      <SaveBeforeChangeDialog
        open={dialogState.type === "save-before-restore" && dialogState.open}
        onOpenChange={(open) => {
          setDialogState({ ...dialogState, open });
          if (!open) setPendingRestoreVersion(null);
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
          performRestore(pendingRestoreVersion, extraVersion);
          setPendingRestoreVersion(null);
        }}
        onContinueWithoutSaving={() => {
          if (!pendingRestoreVersion) return;
          performRestore(pendingRestoreVersion);
          setPendingRestoreVersion(null);
        }}
        actionName="restore this version"
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

      <ConfirmDialog
        open={newPageConfirmOpen}
        onOpenChange={setNewPageConfirmOpen}
        title="Start a new page?"
        description="Choosing a template will replace your current page. Anything not saved as a version will be lost."
        confirmText="Choose Template"
        variant="destructive"
        onConfirm={() => setTemplateSelectorOpen(true)}
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
    </div>
  );
}
