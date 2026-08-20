import { PageSummary } from "@/types/landing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Files, MoreVertical, Pencil, Trash2 } from "lucide-react";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

interface PageCardProps {
  page: PageSummary;
  onClick: () => void;
  // Omit both to render a plain, action-less card (e.g. the File > Open picker).
  onRename?: () => void;
  onDelete?: () => void;
}

/** One site's card — shared by the /pages dashboard and the editor's
 * File > Open picker, so both look and behave identically. */
export function PageCard({ page, onClick, onRename, onDelete }: PageCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-[4/3] rounded-xl border border-gray-200 bg-white flex flex-col text-left overflow-hidden hover:border-primary hover:shadow-md transition-all cursor-pointer"
    >
      {(onRename || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-2 top-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {onRename && (
              <DropdownMenuItem onClick={onRename}>
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex-1 flex items-center justify-center bg-gray-50">
        {page.isMultiPage ? (
          <Files className="h-10 w-10 text-gray-300" />
        ) : (
          <FileText className="h-10 w-10 text-gray-300" />
        )}
      </div>
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-gray-900 truncate">{page.title}</span>
          <Badge variant={page.isPublished ? "default" : "outline"} className="shrink-0">
            {page.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1">Updated {formatDate(page.updatedAt)}</p>
      </div>
    </div>
  );
}
