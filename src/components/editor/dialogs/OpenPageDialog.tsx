"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageCard } from "@/components/pages-dashboard/PageCard";
import { PageSummary } from "@/types/landing";
import { Loader2 } from "lucide-react";

interface OpenPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPage: (pageId: string) => void;
}

/** File > Open — pick a different site to work on, Google-Docs style. */
export function OpenPageDialog({ open, onOpenChange, onSelectPage }: OpenPageDialogProps) {
  const [pages, setPages] = useState<PageSummary[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setPages(null);
    fetch("/api/landing-config/pages")
      .then((r) => r.json())
      .then((data) => setPages(data.pages || []))
      .catch((error) => {
        console.error("Error fetching pages:", error);
        setPages([]);
      });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Open</DialogTitle>
        </DialogHeader>

        {/* Fixed-height area regardless of loading state, so the dialog
            doesn't visibly jump in size once the grid finishes loading. */}
        <div className="h-[70vh] overflow-y-auto">
          {pages === null ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : pages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              No pages yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {pages.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  onClick={() => {
                    onOpenChange(false);
                    onSelectPage(page.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
