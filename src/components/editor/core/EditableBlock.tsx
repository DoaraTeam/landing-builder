"use client";

import { memo, useState } from "react";
import { ComponentConfig, Theme } from "@/types/landing";
import {
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Edit,
  Copy,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { getComponentDisplayName } from "@/lib/component-labels";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";

interface EditableBlockProps {
  component: ComponentConfig;
  theme?: Theme;
  isSelected: boolean;
  // These take the component's own id rather than being pre-bound per item,
  // so the parent can pass the same stable function to every block instead
  // of a fresh inline closure per render — required for React.memo below to
  // actually skip re-rendering blocks whose own props didn't change.
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onChangeTemplate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  // First/last block in the page — the outer canvas card clips to a rounded
  // corner (rounded-xl) via overflow-hidden, so this block's own hover/select
  // border and overlay need matching rounded top/bottom corners. Without it,
  // the canvas's clip cuts the square corner off the border right where it
  // sits, making the hover effect look like it's missing at that corner.
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * EditableBlock - Wrapper for components in edit mode
 * Provides selection, visibility toggle, delete, duplicate, move functionality
 *
 * Wrapped in React.memo — the canvas can hold many of these, and without it,
 * any state change in the parent (selecting a different block, editing
 * another component's content) re-renders every block on the page instead of
 * just the one whose own props actually changed.
 */
export const EditableBlock = memo(function EditableBlock({
  component,
  theme,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete,
  onDuplicate,
  onChangeTemplate,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  isFirst = false,
  isLast = false,
}: EditableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 50 : undefined,
  };
  const edgeRounding = `${isFirst ? "rounded-t-xl" : ""} ${isLast ? "rounded-b-xl" : ""}`;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 ${isSelected ? "shadow-xl z-10" : "hover:shadow-md z-0"} ${!component.visible ? "opacity-60" : ""} ${isDragging ? "opacity-50 scale-105" : ""}`}
      onClick={() => onSelect(component.id)}
    >
      {/* Component Content */}
      <div className="pointer-events-none">
        {/* Special wrapper for header to ensure EditableBlock features work properly */}
        <div
          className={`w-full ${component.type === "header" ? "relative" : "overflow-hidden"}`}
          style={
            component.type === "header"
              ? // Contain header within EditableBlock bounds
                { position: "relative", isolation: "isolate" }
              : undefined
          }
        >
          <ComponentRenderer component={component} theme={theme} />
        </div>
      </div>

      {/* Border Indicator - Clean solid border when selected */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-200 ${edgeRounding} ${
          isSelected
            ? "border-2 border-blue-500"
            : "border-2 border-transparent group-hover:border-gray-300"
        } ${!component.visible ? "border-2 border-dashed !border-orange-400" : ""}`}
      />

      {/* Edit Overlay - Shows on hover or when selected */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-200 ${edgeRounding} ${
          isSelected
            ? "bg-blue-500 bg-opacity-5"
            : "bg-blue-500 bg-opacity-0 group-hover:bg-opacity-3"
        }`}
      />

      {/* Corner Indicators when selected - Smaller and more elegant */}
      {isSelected && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 border-t-[3px] border-l-[3px] border-blue-500 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-[3px] border-r-[3px] border-blue-500 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[3px] border-l-[3px] border-blue-500 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[3px] border-r-[3px] border-blue-500 pointer-events-none"></div>
        </>
      )}

      {/* Toolbar - Shows on hover or when selected. pointer-events follow
          opacity explicitly — otherwise this invisible (opacity-0) box still
          sits over whatever's underneath and eats clicks meant for it, even
          while not visibly shown.
          For the header specifically, this box also can't sit at top-right
          like every other block: that's the exact corner the Header's own
          nav+CTA links render in, and being position:absolute it always
          paints above the header's (position:static) content regardless of
          z-index — so on hover it physically intercepts clicks meant for
          those nav links before they ever reach the header. Bottom-right is
          clear for every header layout, so header blocks anchor there
          instead; every other block keeps the normal top-right spot. */}
      <div
        className={`absolute ${component.type === "header" ? "bottom-0 right-0 mb-2 mr-2" : "top-0 right-0 m-2"} flex gap-1 transition-opacity z-[60] pointer-events-none ${
          isSelected
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto"
        }`}
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex items-center gap-1 p-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="px-1 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>

          {/* Component Label */}
          <div className="px-2 text-xs font-medium text-gray-700">
            {getComponentDisplayName(component.type)}
          </div>

          <div className="w-px h-4 bg-gray-300" />

          {/* Move Up/Down Buttons */}
          {onMoveUp && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(component.id);
              }}
              disabled={!canMoveUp}
              title="Move Up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          )}
          {onMoveDown && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(component.id);
              }}
              disabled={!canMoveDown}
              title="Move Down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          )}

          <div className="w-px h-4 bg-gray-300" />

          {/* Change Template Button */}
          {onChangeTemplate && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600"
              onClick={(e) => {
                e.stopPropagation();
                onChangeTemplate(component.id);
              }}
              title="Change Template"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Edit Button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(component.id);
            }}
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>

          {/* Visibility Toggle */}
          <Button
            size="sm"
            variant="ghost"
            className={`h-7 w-7 p-0 ${
              component.visible
                ? "hover:bg-gray-100"
                : "hover:bg-green-50 bg-orange-50 border border-orange-200"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(component.id);
            }}
            title={component.visible ? "Hide component" : "Show component (Click to unhide)"}
          >
            {component.visible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-orange-600" />
            )}
          </Button>

          {/* Duplicate Button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(component.id);
            }}
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>

          {/* Delete Button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmOpen(true);
            }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete section?"
        description={`Delete ${getComponentDisplayName(component.type)}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => onDelete(component.id)}
      />

      {/* Order Badge - Bottom Left. Same pointer-events-follows-opacity
          reasoning as the toolbar above. */}
      <div
        className={`absolute bottom-2 left-2 transition-opacity pointer-events-none ${
          isSelected
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto"
        }`}
      >
        <div className="bg-white rounded px-2 py-1 text-xs font-medium text-gray-600 shadow-sm border border-gray-200">
          Order: {component.order}
        </div>
      </div>

      {/* Hidden Badge - Shows when component is hidden */}
      {!component.visible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-900 bg-opacity-90 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <EyeOff className="h-5 w-5" />
              <div>
                <div className="text-sm font-bold">Component Hidden</div>
                <div className="text-xs text-gray-300 mt-0.5">
                  Click the eye icon above to show it again
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
