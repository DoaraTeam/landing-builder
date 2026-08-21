"use client";

import { useEffect, useState } from "react";
import { LandingPage, LandingPageVersion } from "@/types/landing";
import { useToast } from "@/hooks/use-toast";

export type DialogState = {
  type:
    | "none"
    | "save-before-change"
    | "save-before-restore"
    | "publish"
    | "publish-success"
    | "publish-error";
  open: boolean;
};

interface UseVersionHistoryParams {
  pageId: string | null;
  draftPage: LandingPage | null;
  setDraftPage: (page: LandingPage) => void;
  setDialogState: (state: DialogState) => void;
  toast: ReturnType<typeof useToast>["toast"];
  versionSidebarOpen: boolean;
  setVersionSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

// Owns this page's version-history state (fetched lazily, only once the
// sidebar is opened) and the save/restore/delete flow built on top of it.
// Extracted verbatim from editor/page.tsx.
export function useVersionHistory({
  pageId,
  draftPage,
  setDraftPage,
  setDialogState,
  toast,
  versionSidebarOpen,
  setVersionSidebarOpen,
  setSidebarCollapsed,
}: UseVersionHistoryParams) {
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

  // Every page owns its own version history now — refetch whenever the
  // sidebar is opened (rather than once, eagerly, up front).
  useEffect(() => {
    if (!versionSidebarOpen || !pageId) return;
    fetch(`/api/landing-config/versions?pageId=${pageId}`)
      .then((r) => r.json())
      .then((data) => setVersions(data.versions || []))
      .catch((error) => console.error("Error fetching versions:", error));
  }, [versionSidebarOpen, pageId]);

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

  return {
    versions,
    previewedVersion,
    setPreviewedVersion,
    pendingRestoreVersion,
    setPendingRestoreVersion,
    closeVersionSidebar,
    handleVersionHistoryClick,
    handleSaveVersion,
    hasUnversionedChanges,
    performRestore,
    handleRestoreVersion,
    handleDeleteVersion,
  };
}
