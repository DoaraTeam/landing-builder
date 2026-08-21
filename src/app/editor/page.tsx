"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { LandingConfig, LandingPage, Theme } from "@/types/landing";
import { TemplateSelector } from "@/components/editor/selectors/TemplateSelector";
import { LandingPageTemplate } from "@/lib/landing-templates";
import { buildPageFromTemplate, createPage } from "@/lib/create-page";
import {
  DISABLED_EDIT_MENU_STATE,
  type EditMenuState,
} from "@/components/editor/core/EditableLandingPage";
import MultiPageEditor from "@/components/editor/core/MultiPageEditor";
import VersionHistorySidebar from "@/components/editor/core/VersionHistorySidebar";
import { EditorMenuBar } from "@/components/editor/core/EditorMenuBar";
import { EditorDialogs } from "@/components/editor/core/EditorDialogs";
import { KeyboardShortcutsHelp } from "@/components/editor/panels/KeyboardShortcutsHelp";
import { RenamePageDialog } from "@/components/editor/dialogs/RenamePageDialog";
import { useToast } from "@/hooks/use-toast";
import { useVersionHistory, type DialogState } from "@/hooks/use-version-history";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/loading-screen";
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { Home, Eye, Upload, History, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Guarantees the loading screen is visible for a bit even when the config
// fetch resolves almost instantly, instead of flashing for a few ms.
const MIN_LOADING_TIME_MS = 2000;

function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const { toast } = useToast();
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Separate from `saving` — that flips true for any draft save (autosave,
  // the Preview button's save-before-open, etc.), which was making the
  // Publish button show "Publishing..." for unrelated saves. This tracks
  // only the actual publish request.
  const [publishing, setPublishing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [openPageDialogOpen, setOpenPageDialogOpen] = useState(false);
  // The site name in the header is editable inline — click it to type
  // directly, instead of only through File > Rename's dialog.
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  // Whether picking a template should create a brand new page (File > New,
  // the start-choice dialog) or replace the current page's own content
  // (Template > Change Template) — both share the same TemplateSelector modal.
  const [templateSelectorIntent, setTemplateSelectorIntent] = useState<"create" | "replace">(
    "create"
  );
  const [draftPage, setDraftPage] = useState<LandingPage | null>(null);
  // The project's own name — independent of draftPage.title (the main
  // page's own title), renamed instantly via a lightweight PATCH, no
  // save-then-publish needed.
  const [siteName, setSiteName] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({ type: "none", open: false });
  // Lifted out of MultiPageEditor so opening the version sidebar can force it
  // collapsed; shared between the live editor and the version-preview render,
  // since only one of the two is ever mounted at a time.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [versionSidebarOpen, setVersionSidebarOpen] = useState(false);
  // Bubbled up from whichever EditableLandingPage instance is currently
  // mounted (single- or multi-page) — drives the Edit menu's Undo/Redo/
  // Cut/Copy/Paste items, which live here rather than inside that component.
  const [editMenuState, setEditMenuState] = useState<EditMenuState>(DISABLED_EDIT_MENU_STATE);
  // Which top menu bar dropdown (File/Edit/Template/Help) is open. Each is a
  // separate Radix DropdownMenu root, so without this shared state opening
  // one wouldn't close another that's already open.
  const [openMenu, setOpenMenu] = useState<"file" | "edit" | "template" | "help" | null>(null);
  // Set to a fresh object whenever File > Export or Template > Import is
  // clicked, so EditableLandingPage's own Export/Import sheet opens already
  // on the requested tab — that sheet, and the live page data it needs, live
  // there rather than up here.
  const [exportImportRequest, setExportImportRequest] = useState<{
    tab: "export" | "import";
  } | null>(null);
  // Bubbled up from whichever EditableLandingPage instance is currently
  // mounted — true whenever autosave hasn't caught up to the latest edit
  // yet. Drives both the beforeunload warning below and the Home button's
  // own confirm dialog.
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [leaveToHomeOpen, setLeaveToHomeOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  // Reload/close-tab: only the browser's own generic confirmation can be
  // shown here (modern browsers ignore any custom message for security
  // reasons) — setting returnValue is what triggers it.
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Read inside the popstate handler below (registered once, on mount) so
  // it always sees the latest value instead of closing over whatever
  // hasUnsavedChanges was at mount time.
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Browser Back button: pushes a duplicate history entry so the first Back
  // press lands here (a popstate we can act on) instead of immediately
  // leaving. With no unsaved changes, let a real Back through immediately;
  // otherwise re-arm the trap and ask via the same dialog the Home button
  // uses.
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (window.location.pathname !== "/editor") return; // already navigated away

      if (hasUnsavedChangesRef.current) {
        window.history.pushState(null, "", window.location.href); // re-arm
        setLeaveToHomeOpen(true);
      } else {
        window.history.back();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const {
    versions,
    previewedVersion,
    setPreviewedVersion,
    pendingRestoreVersion,
    setPendingRestoreVersion,
    closeVersionSidebar,
    handleVersionHistoryClick,
    handleSaveVersion,
    performRestore,
    handleRestoreVersion,
    handleDeleteVersion,
  } = useVersionHistory({
    pageId,
    draftPage,
    setDraftPage,
    setDialogState,
    toast,
    versionSidebarOpen,
    setVersionSidebarOpen,
    setSidebarCollapsed,
  });

  const fetchConfig = async () => {
    const startedAt = Date.now();
    try {
      const response = await fetch(
        pageId ? `/api/landing-config?pageId=${pageId}` : "/api/landing-config"
      );
      const data: LandingConfig = await response.json();
      setConfig(data);

      const entry = pageId ? data.pages[pageId] : null;
      setDraftPage(entry ? entry.draft : null);
      setSiteName(entry ? entry.name : null);
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      const remaining = MIN_LOADING_TIME_MS - (Date.now() - startedAt);
      setTimeout(() => setLoading(false), Math.max(0, remaining));
    }
  };

  // Creates a brand new, independent page and navigates to it — used by
  // File > New and the empty-state "+".
  const handleCreatePage = async (template: LandingPageTemplate) => {
    setSaving(true);
    try {
      const created = await createPage(template);
      if (created) {
        setDraftPage(created.page);
        setSiteName(created.page.title);
        closeVersionSidebar();
        setPreviewedVersion(null);
        router.push(`/editor?pageId=${created.pageId}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Replaces the CURRENT page's content with a different template — same
  // page id/slug, just a new component tree (Template > Change Template).
  const handleReplaceTemplate = async (template: LandingPageTemplate) => {
    if (!pageId) return;
    const newPage = buildPageFromTemplate(template, pageId);
    await handleSaveDraft(newPage);
    closeVersionSidebar();
    setPreviewedVersion(null);
    setTemplateSelectorOpen(false);
  };

  const handleTemplateSelected = (template: LandingPageTemplate) => {
    setTemplateSelectorOpen(false);
    if (templateSelectorIntent === "replace") {
      void handleReplaceTemplate(template);
    } else {
      void handleCreatePage(template);
    }
  };

  const handleSaveDraft = async (updatedPage: LandingPage) => {
    if (!pageId) return;

    setSaving(true);
    try {
      const response = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, draft: updatedPage }),
      });

      if (response.ok) {
        setDraftPage(updatedPage);
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
    if (!pageId || !draftPage) return;

    setPublishing(true);
    try {
      const response = await fetch("/api/landing-config/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });

      if (response.ok) {
        setDialogState({ type: "publish-success", open: true });
      } else {
        setDialogState({ type: "publish-error", open: true });
      }
    } catch (error) {
      console.error("Error publishing:", error);
      setDialogState({ type: "publish-error", open: true });
    } finally {
      setPublishing(false);
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
    setTemplateSelectorIntent("replace");
    setTemplateSelectorOpen(true);
  };

  const handleChangeTemplateWithoutSaving = () => {
    setTemplateSelectorIntent("replace");
    setTemplateSelectorOpen(true);
  };

  // File > Make a Copy — now that pages are independent, a copy is a real
  // new page (its own id/slug), not just a named version snapshot. Only the
  // new project's own name changes ("Copy of X") — the copied content's main
  // page keeps its own title as-is, since that's a separate concept now.
  const handleMakeACopy = async () => {
    if (!draftPage) return;

    const newId = `page-${Date.now()}`;
    const newName = `Copy of ${siteName ?? draftPage.title}`;
    const copy: LandingPage = {
      ...draftPage,
      id: newId,
      slug: `${draftPage.slug}-copy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      const response = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: newId, draft: copy, name: newName }),
      });

      if (response.ok) {
        toast.success({
          title: "Copy Created",
          description: `"${newName}" is now its own page.`,
        });
        router.push(`/editor?pageId=${newId}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // File menu shortcuts — page/project-level actions, distinct from the
  // component-editing shortcuts registered inside EditableLandingPage.
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...COMMON_SHORTCUTS.NEW_PAGE,
        ignoreWhenTyping: true,
        action: () => {
          setTemplateSelectorIntent("create");
          setTemplateSelectorOpen(true);
        },
      },
      {
        ...COMMON_SHORTCUTS.OPEN_PAGE,
        ignoreWhenTyping: true,
        action: () => setOpenPageDialogOpen(true),
      },
      {
        ...COMMON_SHORTCUTS.MAKE_A_COPY,
        ignoreWhenTyping: true,
        action: () => handleMakeACopy(),
      },
      {
        ...COMMON_SHORTCUTS.RENAME_PAGE,
        ignoreWhenTyping: true,
        action: () => setRenameOpen(true),
      },
    ],
    enabled: !!draftPage,
  });

  const handleSaveCustomTheme = async (theme: Theme, themeId: string) => {
    if (!config) return;

    const response = await fetch("/api/landing-config/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId, theme }),
    });

    if (!response.ok) {
      throw new Error("Failed to save custom theme");
    }

    setConfig({ ...config, themes: { ...config.themes, [themeId]: theme } });
  };

  // Renames the project itself — a lightweight PATCH, not a content save, so
  // it takes effect immediately with no publish step needed.
  const handleRenameSite = async (newName: string) => {
    if (!pageId) return;
    const response = await fetch("/api/landing-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, name: newName }),
    });
    if (response.ok) {
      setSiteName(newName);
    }
  };

  const commitTitleEdit = () => {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== siteName) {
      void handleRenameSite(trimmed);
    }
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
                      onClick={() => {
                        if (hasUnsavedChanges) {
                          setLeaveToHomeOpen(true);
                        } else {
                          router.push("/pages");
                        }
                      }}
                      className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Home className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Your Pages</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="h-6 w-px bg-gray-300" />
              {siteName && draftPage && (
                <EditorMenuBar
                  siteName={siteName}
                  editingTitle={editingTitle}
                  titleDraft={titleDraft}
                  onTitleDraftChange={setTitleDraft}
                  onStartEditingTitle={() => {
                    setTitleDraft(siteName);
                    setEditingTitle(true);
                  }}
                  onCancelEditingTitle={() => setEditingTitle(false)}
                  onCommitTitleEdit={commitTitleEdit}
                  openMenu={openMenu}
                  onOpenMenuChange={setOpenMenu}
                  onNewPage={() => {
                    setTemplateSelectorIntent("create");
                    setTemplateSelectorOpen(true);
                  }}
                  onOpenPage={() => setOpenPageDialogOpen(true)}
                  onMakeACopy={handleMakeACopy}
                  onRenamePage={() => setRenameOpen(true)}
                  editMenuState={editMenuState}
                  onChangeTemplateClick={handleChangeTemplateClick}
                  onExportRequest={() => setExportImportRequest({ tab: "export" })}
                  onImportRequest={() => setExportImportRequest({ tab: "import" })}
                  onHelpClick={() => setHelpOpen(true)}
                />
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
                            if (!draftPage || !pageId) return;

                            setPreviewing(true);
                            try {
                              // Save draft before preview
                              await handleSaveDraft(draftPage);

                              // Small delay to ensure save completes
                              await new Promise((resolve) => setTimeout(resolve, 500));

                              // Open preview in new tab
                              const previewWindow = window.open(
                                `/preview?pageId=${pageId}`,
                                "_blank"
                              );

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
                              window.open(`/preview?pageId=${pageId}`, "_blank");
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
                    disabled={saving || publishing}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Upload className="h-4 w-4" />
                    {publishing ? "Publishing..." : "Publish"}
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
            previewedVersion || draftPage ? "flex-1 min-h-0 overflow-hidden" : "flex-1 min-h-0"
          }
        >
          {/* Template Selector - Always render modal */}
          <TemplateSelector
            open={templateSelectorOpen}
            onOpenChange={setTemplateSelectorOpen}
            onSelectTemplate={handleTemplateSelected}
          />

          {previewedVersion ? (
            // Browsing a historical version — read-only. Always MultiPageEditor
            // (see below) so the PAGES sidebar is never hidden, even for a
            // single-page version.
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
            <>
              {/* Always MultiPageEditor, never EditableLandingPage directly —
                  it already renders the PAGES sidebar gracefully with zero
                  sub-pages ("Chưa có trang con nào"), so a single-page site
                  keeps the same sidebar chrome instead of losing it entirely.
                  Read-only while the version sidebar is open, even with
                  nothing previewed yet — opening it puts the canvas in view
                  mode immediately. */}
              {draftPage && config && (
                <MultiPageEditor
                  page={draftPage}
                  config={config}
                  onSave={handleSaveDraft}
                  onSaveCustomTheme={handleSaveCustomTheme}
                  sidebarCollapsed={sidebarCollapsed}
                  onSidebarCollapsedChange={setSidebarCollapsed}
                  onEditMenuStateChange={setEditMenuState}
                  exportImportRequest={exportImportRequest}
                  readOnly={versionSidebarOpen}
                  onUnsavedChangesChange={setHasUnsavedChanges}
                />
              )}

              {/* No page loaded at all — full-height shell matching
                  PageTree's own chrome exactly (same header row/classes),
                  just with an empty list instead of hiding the sidebar. */}
              {!draftPage && (
                <div className="flex h-full w-full">
                  <div className="flex h-full w-64 flex-col border-r bg-white">
                    <div className="flex items-center justify-between border-b px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Pages
                      </span>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setTemplateSelectorIntent("create");
                                setTemplateSelectorOpen(true);
                              }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add page</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                      <p className="px-2 py-4 text-center text-xs text-gray-400">
                        Chưa có trang nào
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => {
                        setTemplateSelectorIntent("create");
                        setTemplateSelectorOpen(true);
                      }}
                    >
                      <Plus className="h-5 w-5" />
                      Create your first page
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
            versions={versions}
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

      {/* Rename Site Dialog */}
      {siteName && (
        <RenamePageDialog
          open={renameOpen}
          onOpenChange={setRenameOpen}
          currentTitle={siteName}
          onRename={handleRenameSite}
        />
      )}

      <EditorDialogs
        openPageDialogOpen={openPageDialogOpen}
        onOpenPageDialogOpenChange={setOpenPageDialogOpen}
        onSelectPage={(id) => router.push(`/editor?pageId=${id}`)}
        dialogState={dialogState}
        onDialogStateChange={setDialogState}
        onSaveAndChangeTemplate={handleSaveAndChangeTemplate}
        onChangeTemplateWithoutSaving={handleChangeTemplateWithoutSaving}
        draftPage={draftPage}
        pendingRestoreVersion={pendingRestoreVersion}
        onClearPendingRestoreVersion={() => setPendingRestoreVersion(null)}
        onPerformRestore={performRestore}
        onPublishConfirm={handlePublishConfirm}
        publishing={publishing}
        leaveToHomeOpen={leaveToHomeOpen}
        onLeaveToHomeOpenChange={setLeaveToHomeOpen}
        onConfirmLeaveToHome={() => {
          setLeaveToHomeOpen(false);
          router.push("/pages");
        }}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminDashboard />
    </Suspense>
  );
}
