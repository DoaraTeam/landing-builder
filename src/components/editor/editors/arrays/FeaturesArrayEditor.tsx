"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
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

interface FeatureItem {
  id: string;
  icon?: string;
  title: string;
  description: string;
  image?: string;
}

interface FeaturesArrayEditorProps {
  features: FeatureItem[];
  onChange: (features: FeatureItem[]) => void;
}

export function FeaturesArrayEditor({ features, onChange }: FeaturesArrayEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = () => {
    const newId = `feature-${Date.now()}`;
    onChange([
      ...features,
      {
        id: newId,
        icon: "⭐",
        title: "New Feature",
        description: "Feature description goes here",
      },
    ]);
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, updates: Partial<FeatureItem>) => {
    onChange(features.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    onChange(features.filter((f) => f.id !== deleteId));
    if (expandedId === deleteId) setExpandedId(null);
    setDeleteId(null);
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const index = features.findIndex((f) => f.id === id);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= features.length) return;
    onChange(arrayMove(features, index, newIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = features.findIndex((f) => f.id === active.id);
    const newIndex = features.findIndex((f) => f.id === over.id);
    onChange(arrayMove(features, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Features ({features.length})</Label>
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Add Feature
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={features.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <SortableFeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                total={features.length}
                isExpanded={expandedId === feature.id}
                onToggleExpand={() => setExpandedId(expandedId === feature.id ? null : feature.id)}
                onUpdate={(updates) => handleUpdate(feature.id, updates)}
                onMove={(direction) => handleMove(feature.id, direction)}
                onDelete={() => handleDelete(feature.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {features.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed rounded">
          No features yet. Click &quot;Add Feature&quot; to get started.
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete feature?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

interface SortableFeatureCardProps {
  feature: FeatureItem;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<FeatureItem>) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}

function SortableFeatureCard({
  feature,
  index,
  total,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onMove,
  onDelete,
}: SortableFeatureCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="border border-gray-200">
      <CardHeader className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1" onClick={onToggleExpand}>
            <div
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 rounded hover:bg-gray-200"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <CardTitle className="text-sm font-medium">
              {feature.icon} {feature.title}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMove("up");
              }}
              disabled={index === 0}
              title="Move Up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMove("down");
              }}
              disabled={index === total - 1}
              title="Move Down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-3 space-y-3 border-t">
          <div className="space-y-1.5">
            <Label htmlFor={`icon-${feature.id}`} className="text-xs">
              Icon/Emoji
            </Label>
            <Input
              id={`icon-${feature.id}`}
              value={feature.icon || ""}
              onChange={(e) => onUpdate({ icon: e.target.value })}
              placeholder="⭐"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`title-${feature.id}`} className="text-xs">
              Title
            </Label>
            <Input
              id={`title-${feature.id}`}
              value={feature.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Feature Title"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`description-${feature.id}`} className="text-xs">
              Description
            </Label>
            <Input
              id={`description-${feature.id}`}
              value={feature.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Feature description"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`image-${feature.id}`} className="text-xs">
              Image URL (Optional)
            </Label>
            <Input
              id={`image-${feature.id}`}
              value={feature.image || ""}
              onChange={(e) => onUpdate({ image: e.target.value })}
              placeholder="https://..."
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
