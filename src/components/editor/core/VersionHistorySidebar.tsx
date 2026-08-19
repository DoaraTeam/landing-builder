"use client";

import { useState } from "react";
import { LandingPage, LandingPageVersion } from "@/types/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { History, X, Plus, MoreHorizontal, RotateCcw, Trash2, Save } from "lucide-react";

interface VersionHistorySidebarProps {
  currentPage: LandingPage;
  versions: LandingPageVersion[];
  // null = viewing/editing the live draft; a version id = previewing that
  // version read-only.
  previewedVersionId: string | null;
  onSelectVersion: (version: LandingPageVersion | null) => void;
  onSaveVersion: (name: string, description?: string) => void;
  onRestoreVersion: (version: LandingPageVersion) => void;
  onDeleteVersion: (versionId: string) => void;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function VersionHistorySidebar({
  currentPage,
  versions,
  previewedVersionId,
  onSelectVersion,
  onSaveVersion,
  onRestoreVersion,
  onDeleteVersion,
  onClose,
}: VersionHistorySidebarProps) {
  const [saveFormOpen, setSaveFormOpen] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [versionDescription, setVersionDescription] = useState("");
  const [versionToDelete, setVersionToDelete] = useState<LandingPageVersion | null>(null);

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSaveVersion = () => {
    if (!versionName.trim()) return;
    onSaveVersion(versionName, versionDescription || undefined);
    setVersionName("");
    setVersionDescription("");
    setSaveFormOpen(false);
  };

  return (
    <div className="flex h-full w-64 flex-col border-l bg-white">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Version History
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {!saveFormOpen ? (
          <Button
            variant="outline"
            size="sm"
            className="mb-2 w-full justify-start gap-2 text-xs"
            onClick={() => setSaveFormOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Save current version
          </Button>
        ) : (
          <div className="mb-2 space-y-2 rounded-md border p-2">
            <div className="space-y-1">
              <Label htmlFor="version-name" className="text-xs">
                Name *
              </Label>
              <Input
                id="version-name"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g., Homepage v1"
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="version-description" className="text-xs">
                Description
              </Label>
              <Input
                id="version-description"
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                placeholder="Optional"
                className="h-7 text-xs"
              />
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={() => {
                  setSaveFormOpen(false);
                  setVersionName("");
                  setVersionDescription("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 flex-1 gap-1 text-xs"
                disabled={!versionName.trim()}
                onClick={handleSaveVersion}
              >
                <Save className="h-3 w-3" />
                Save
              </Button>
            </div>
          </div>
        )}

        <div className="my-2 border-t" />

        {/* Pinned current/live draft row */}
        <div
          className={`rounded-md px-2 py-1.5 text-sm cursor-pointer ${
            previewedVersionId === null
              ? "bg-blue-50 text-blue-700 font-medium"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          onClick={() => onSelectVersion(null)}
        >
          <p className="truncate">Current (live draft)</p>
          <p className="text-xs text-gray-500">
            {currentPage.updatedAt ? formatDate(currentPage.updatedAt) : "N/A"}
          </p>
        </div>

        <div className="my-2 border-t" />

        {sortedVersions.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">No saved versions yet</p>
        ) : (
          <div className="space-y-0.5">
            {sortedVersions.map((version) => (
              <div
                key={version.id}
                className={`group flex items-start gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer ${
                  previewedVersionId === version.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => onSelectVersion(version)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{version.name}</p>
                  {version.description && (
                    <p className="truncate text-xs text-gray-500">{version.description}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(version.createdAt)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 rounded p-1 opacity-0 hover:bg-gray-200 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        // Deferred: this can open another Dialog (the save-
                        // before-restore guard) synchronously while this
                        // DropdownMenu is still closing, which races with
                        // Radix's own cleanup and can leave the page stuck
                        // unclickable.
                        setTimeout(() => onRestoreVersion(version), 0);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setVersionToDelete(version);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!versionToDelete}
        onOpenChange={(open) => !open && setVersionToDelete(null)}
        title="Delete version"
        description={`Delete version "${versionToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => {
          if (versionToDelete) onDeleteVersion(versionToDelete.id);
        }}
      />
    </div>
  );
}
