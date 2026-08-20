"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageSummary } from "@/types/landing";
import { LandingPageTemplate } from "@/lib/landing-templates";
import { TemplateSelector } from "@/components/editor/selectors/TemplateSelector";
import { PageCard } from "@/components/pages-dashboard/PageCard";
import { RenamePageDialog } from "@/components/editor/dialogs/RenamePageDialog";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { createPage } from "@/lib/create-page";
import { Button } from "@/components/ui/button";
import { Home, Plus } from "lucide-react";

interface PagesGridProps {
  pages: PageSummary[];
}

export function PagesGrid({ pages: initialPages }: PagesGridProps) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pageToRename, setPageToRename] = useState<PageSummary | null>(null);
  const [pageToDelete, setPageToDelete] = useState<PageSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (template: LandingPageTemplate) => {
    setCreating(true);
    try {
      const created = await createPage(template);
      if (created) {
        router.push(`/editor?pageId=${created.pageId}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (newTitle: string) => {
    if (!pageToRename) return;
    const response = await fetch("/api/landing-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: pageToRename.id, name: newTitle }),
    });
    if (response.ok) {
      setPages((prev) =>
        prev.map((p) => (p.id === pageToRename.id ? { ...p, title: newTitle } : p))
      );
    }
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/landing-config?pageId=${pageToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
      }
    } finally {
      setDeleting(false);
      setPageToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Your Pages</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
        <button
          onClick={() => setTemplateSelectorOpen(true)}
          disabled={creating}
          className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">New Page</span>
        </button>

        {pages.map((page) => (
          <PageCard
            key={page.id}
            page={page}
            onClick={() => router.push(`/editor?pageId=${page.id}`)}
            onRename={() => setPageToRename(page)}
            onDelete={() => setPageToDelete(page)}
          />
        ))}
      </div>

      <TemplateSelector
        open={templateSelectorOpen}
        onOpenChange={setTemplateSelectorOpen}
        onSelectTemplate={(template) => {
          setTemplateSelectorOpen(false);
          void handleCreate(template);
        }}
      />

      <RenamePageDialog
        open={!!pageToRename}
        onOpenChange={(open) => !open && setPageToRename(null)}
        currentTitle={pageToRename?.title ?? ""}
        onRename={handleRename}
      />

      <ConfirmDialog
        open={!!pageToDelete}
        onOpenChange={(open) => !open && setPageToDelete(null)}
        title="Delete this page?"
        description={`"${pageToDelete?.title}" and everything in it will be permanently deleted. This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
