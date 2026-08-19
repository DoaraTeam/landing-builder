"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { SmartImage } from "@/components/ui/smart-image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LogoItem {
  // Older logos saved before drag-and-drop was added may not have one yet;
  // a stable per-render fallback id is derived from array position for those.
  id?: string;
  name: string;
  url: string;
  link?: string;
}

interface LogoArrayEditorProps {
  logos: LogoItem[];
  onChange: (logos: LogoItem[]) => void;
}

// Create fallback SVG for failed images
const createFallbackSVG = (name: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50">
      <rect width="150" height="50" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export function LogoArrayEditor({ logos = [], onChange }: LogoArrayEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Stable-per-render identity for drag-and-drop and expand/delete tracking,
  // falling back to array position for logos saved before `id` existed.
  const itemIds = logos.map((logo, i) => logo.id ?? `logo-idx-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = () => {
    const newId = `logo-${Date.now()}`;
    const newLogo: LogoItem = {
      id: newId,
      name: "New Logo",
      url: "https://via.placeholder.com/150x50/cccccc/666666?text=Logo",
      link: "",
    };
    onChange([...logos, newLogo]);
    setExpandedId(newId);
  };

  const handleRemove = (itemId: string) => {
    setDeleteId(itemId);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const index = itemIds.indexOf(deleteId);
    if (index === -1) return;
    onChange(logos.filter((_, i) => i !== index));
    if (expandedId === deleteId) setExpandedId(null);
    setDeleteId(null);
  };

  const handleUpdate = (itemId: string, field: keyof LogoItem, value: string) => {
    const index = itemIds.indexOf(itemId);
    if (index === -1) return;
    const newLogos = [...logos];
    newLogos[index] = { ...newLogos[index], [field]: value };
    onChange(newLogos);
  };

  const handleMove = (itemId: string, direction: "up" | "down") => {
    const index = itemIds.indexOf(itemId);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= logos.length) return;
    onChange(arrayMove(logos, index, newIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(logos, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Logos ({logos.length})</Label>
        <Button onClick={handleAdd} size="sm" variant="outline" className="h-8">
          <Plus className="h-4 w-4 mr-1" />
          Add Logo
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {logos.map((logo, index) => {
              const itemId = itemIds[index];
              return (
                <SortableLogoRow
                  key={itemId}
                  itemId={itemId}
                  logo={logo}
                  index={index}
                  total={logos.length}
                  isExpanded={expandedId === itemId}
                  onToggleExpand={() => setExpandedId(expandedId === itemId ? null : itemId)}
                  onUpdate={(field, value) => handleUpdate(itemId, field, value)}
                  onMove={(direction) => handleMove(itemId, direction)}
                  onDelete={() => handleRemove(itemId)}
                />
              );
            })}

            {logos.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                No logos added yet. Click &quot;Add Logo&quot; to get started.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete logo?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

interface SortableLogoRowProps {
  itemId: string;
  logo: LogoItem;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (field: keyof LogoItem, value: string) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}

function SortableLogoRow({
  itemId,
  logo,
  index,
  total,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onMove,
  onDelete,
}: SortableLogoRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-lg overflow-hidden bg-white"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={onToggleExpand}
      >
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 rounded hover:bg-gray-200 flex-shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Logo Preview */}
        <div className="relative w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          <SmartImage
            src={logo.url}
            alt={logo.name}
            fill
            sizes="48px"
            className="object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = createFallbackSVG(logo.name || "Logo");
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{logo.name || "Untitled Logo"}</div>
          {logo.link && (
            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {logo.link}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMove("up");
            }}
            disabled={index === 0}
            className="h-8 w-8 p-0"
            title="Move Up"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMove("down");
            }}
            disabled={index === total - 1}
            className="h-8 w-8 p-0"
            title="Move Down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 space-y-3 border-t border-gray-200">
          <div className="space-y-2">
            <Label className="text-xs">Company Name</Label>
            <Input
              value={logo.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              placeholder="e.g. Microsoft, Google, Amazon"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Logo Image URL</Label>
            <Input
              value={logo.url}
              onChange={(e) => onUpdate("url", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="text-sm"
            />
            <p className="text-xs text-gray-500">Direct link to logo image (PNG, SVG, JPG)</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Website Link (Optional)</Label>
            <Input
              value={logo.link || ""}
              onChange={(e) => onUpdate("link", e.target.value)}
              placeholder="https://example.com"
              className="text-sm"
            />
            <p className="text-xs text-gray-500">If provided, logo will be clickable</p>
          </div>

          {/* Image Preview */}
          <div className="space-y-2">
            <Label className="text-xs">Preview</Label>
            <div className="relative w-full h-20 bg-gray-50 rounded border border-gray-200 p-4">
              <SmartImage
                src={logo.url}
                alt={logo.name}
                fill
                sizes="400px"
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/150x50/cccccc/666666?text=${encodeURIComponent(logo.name || "Logo")}`;
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
