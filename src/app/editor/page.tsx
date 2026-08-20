"use client";

import { Suspense, useState, useEffect } from "react";
import { LandingConfig, LandingPage, LandingPageVersion, Theme } from "@/types/landing";
import { TemplateSelector } from "@/components/editor/selectors/TemplateSelector";
import { LandingPageTemplate } from "@/lib/landing-templates";
import { buildPageFromTemplate, createPage } from "@/lib/create-page";
import {
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
import { OpenPageDialog } from "@/components/editor/dialogs/OpenPageDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  Plus,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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

function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const { toast } = useToast();
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  // (Layout > Change Template) — both share the same TemplateSelector modal.
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
  // Version history is fetched lazily, only once the sidebar is opened for
  // this page — it's no longer loaded eagerly with the page's draft/published
  // content.
  const [versions, setVersions] = useState<LandingPageVersion[]>([]);
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
  // Which top menu bar dropdown (File/Edit/Layout/Help) is open. Each is a
  // separate Radix DropdownMenu root, so without this shared state opening
  // one wouldn't close another that's already open.
  const [openMenu, setOpenMenu] = useState<"file" | "edit" | "layout" | "help" | null>(null);

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  // Every page owns its own version history now — refetch whenever the
  // sidebar is opened (rather than once, eagerly, up front).
  useEffect(() => {
    if (!versionSidebarOpen || !pageId) return;
    fetch(`/api/landing-config/versions?pageId=${pageId}`)
      .then((r) => r.json())
      .then((data) => setVersions(data.versions || []))
      .catch((error) => console.error("Error fetching versions:", error));
  }, [versionSidebarOpen, pageId]);

  const fetchConfig = async () => {
    const startedAt = Date.now();
    try {
      const response = await fetch("/api/landing-config");
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
  // page id/slug, just a new component tree (Layout > Change Template).
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

    setSaving(true);
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
    setTemplateSelectorIntent("replace");
    setTemplateSelectorOpen(true);
  };

  const handleChangeTemplateWithoutSaving = () => {
    setTemplateSelectorIntent("replace");
    setTemplateSelectorOpen(true);
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

  const handleSaveVersion = async (name: string, description?: string) => {
    if (!draftPage || !pageId) return;

    const newVersion: LandingPageVersion = {
      id: `version-${Date.now()}`,
      name,
      description,
      page: { ...draftPage },
      createdAt: new Date().toISOString(),
    };

    const response = await fetch("/api/landing-config/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, version: newVersion }),
    });

    if (response.ok) {
      const data = await response.json();
      setVersions(data.versions);
    }
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

  // Whether the live draft differs from every existing saved version — if
  // so, restoring an old version would silently lose it (it was never
  // captured as a named snapshot, only continuously autosaved as the draft).
  const hasUnversionedChanges = (page: LandingPage): boolean => {
    const normalize = (p: LandingPage) => JSON.stringify({ ...p, updatedAt: undefined });
    const currentNormalized = normalize(page);
    return !versions.some((v) => normalize(v.page) === currentNormalized);
  };

  // Restoring never mutates or removes the source version — it only ever
  // reads `version.page` to build a brand new version entry (fresh id/time,
  // same content), which becomes the live draft. `extraVersion`, when given,
  // is saved alongside it (used by the "save my unversioned work first"
  // guard).
  const performRestore = (version: LandingPageVersion, extraVersion?: LandingPageVersion) => {
    // Every caller reaches this right as a Radix overlay (a DropdownMenu
    // "Restore" item, or the save-before-restore Dialog) is closing itself —
    // deferring to a macro-task lets that close/cleanup finish first, so it
    // can't race with this handler's own state updates and leave
    // document.body's pointer-events lock stuck.
    setTimeout(async () => {
      if (!pageId) return;

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

      const saveResponse = await fetch("/api/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, draft: restoredDraft }),
      });

      if (!saveResponse.ok) return;

      if (extraVersion) {
        await fetch("/api/landing-config/versions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, version: extraVersion }),
        });
      }

      const versionResponse = await fetch("/api/landing-config/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, version: newVersion }),
      });
      const versionData = await versionResponse.json();

      setVersions(versionData.versions);
      setDraftPage(restoredDraft);
      setPreviewedVersion(null);
      closeVersionSidebar();
      toast.success({
        title: "Version restored",
        description: `"${version.name}" is now the live draft.`,
      });
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
    if (!pageId) return;

    const response = await fetch(
      `/api/landing-config/versions?pageId=${pageId}&versionId=${versionId}`,
      { method: "DELETE" }
    );

    if (response.ok) {
      const data = await response.json();
      setVersions(data.versions);
    }
  };

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
                      onClick={() => router.push("/pages")}
                      className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Home className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Your Pages</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="h-6 w-px bg-gray-300" />
              {siteName &&
                (editingTitle ? (
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={commitTitleEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitTitleEdit();
                      if (e.key === "Escape") setEditingTitle(false);
                    }}
                    className="text-sm font-medium text-gray-900 max-w-[16rem] rounded border border-blue-400 px-1 outline-none"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setTitleDraft(siteName);
                      setEditingTitle(true);
                    }}
                    title="Click to rename"
                    className="text-sm font-medium text-gray-900 truncate max-w-[16rem] rounded px-1 text-left hover:bg-gray-100"
                  >
                    {siteName}
                  </button>
                ))}
              {draftPage && <div className="h-6 w-px bg-gray-300" />}
              {draftPage && (
                <div className="flex items-center gap-0.5">
                  <DropdownMenu
                    open={openMenu === "file"}
                    onOpenChange={(isOpen) => setOpenMenu(isOpen ? "file" : null)}
                  >
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
                        onClick={() =>
                          setTimeout(() => {
                            setTemplateSelectorIntent("create");
                            setTemplateSelectorOpen(true);
                          }, 0)
                        }
                      >
                        <FilePlus className="h-4 w-4" />
                        New
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTimeout(() => setOpenPageDialogOpen(true), 0)}
                      >
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

                  <DropdownMenu
                    open={openMenu === "edit"}
                    onOpenChange={(isOpen) => setOpenMenu(isOpen ? "edit" : null)}
                  >
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

                  <DropdownMenu
                    open={openMenu === "layout"}
                    onOpenChange={(isOpen) => setOpenMenu(isOpen ? "layout" : null)}
                  >
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

                  <DropdownMenu
                    open={openMenu === "help"}
                    onOpenChange={(isOpen) => setOpenMenu(isOpen ? "help" : null)}
                  >
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
                  readOnly={versionSidebarOpen}
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

      {/* File > Open */}
      <OpenPageDialog
        open={openPageDialogOpen}
        onOpenChange={setOpenPageDialogOpen}
        onSelectPage={(id) => router.push(`/editor?pageId=${id}`)}
      />

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
        description="Are you sure you want to publish this landing page? It will be visible at its live URL and replace any existing published version of this page."
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
        description="Your landing page has been published successfully."
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

export default function EditorPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminDashboard />
    </Suspense>
  );
}
