"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Star } from "lucide-react";
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

interface Testimonial {
  id: string;
  content: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsArrayEditorProps {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
}

export function TestimonialsArrayEditor({ testimonials, onChange }: TestimonialsArrayEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = () => {
    const newId = `testimonial-${Date.now()}`;
    onChange([
      ...testimonials,
      {
        id: newId,
        content: "This product has been amazing! I highly recommend it to everyone.",
        author: "John Doe",
        role: "CEO",
        company: "Tech Company",
        rating: 5,
        avatar: "",
      },
    ]);
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, updates: Partial<Testimonial>) => {
    onChange(testimonials.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    onChange(testimonials.filter((t) => t.id !== deleteId));
    if (expandedId === deleteId) setExpandedId(null);
    setDeleteId(null);
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const index = testimonials.findIndex((t) => t.id === id);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= testimonials.length) return;
    onChange(arrayMove(testimonials, index, newIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = testimonials.findIndex((t) => t.id === active.id);
    const newIndex = testimonials.findIndex((t) => t.id === over.id);
    onChange(arrayMove(testimonials, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Testimonials ({testimonials.length})</Label>
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Add Testimonial
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={testimonials.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {testimonials.map((testimonial, index) => (
              <SortableTestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
                total={testimonials.length}
                isExpanded={expandedId === testimonial.id}
                onToggleExpand={() =>
                  setExpandedId(expandedId === testimonial.id ? null : testimonial.id)
                }
                onUpdate={(updates) => handleUpdate(testimonial.id, updates)}
                onMove={(direction) => handleMove(testimonial.id, direction)}
                onDelete={() => handleDelete(testimonial.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {testimonials.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed rounded">
          No testimonials yet. Click &quot;Add Testimonial&quot; to get started.
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete testimonial?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function renderStars(rating: number, onRatingChange: (rating: number) => void) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 cursor-pointer ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  );
}

interface SortableTestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<Testimonial>) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}

function SortableTestimonialCard({
  testimonial,
  index,
  total,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onMove,
  onDelete,
}: SortableTestimonialCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: testimonial.id,
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
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{testimonial.author}</CardTitle>
              <span className="text-xs text-gray-500">
                {testimonial.role} at {testimonial.company}
              </span>
              <div className="flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
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
            <Label htmlFor={`content-${testimonial.id}`} className="text-xs">
              Testimonial Content
            </Label>
            <textarea
              id={`content-${testimonial.id}`}
              value={testimonial.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Enter testimonial content..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`author-${testimonial.id}`} className="text-xs">
                Author Name
              </Label>
              <Input
                id={`author-${testimonial.id}`}
                value={testimonial.author}
                onChange={(e) => onUpdate({ author: e.target.value })}
                placeholder="John Doe"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`role-${testimonial.id}`} className="text-xs">
                Role/Position
              </Label>
              <Input
                id={`role-${testimonial.id}`}
                value={testimonial.role}
                onChange={(e) => onUpdate({ role: e.target.value })}
                placeholder="CEO"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`company-${testimonial.id}`} className="text-xs">
                Company
              </Label>
              <Input
                id={`company-${testimonial.id}`}
                value={testimonial.company}
                onChange={(e) => onUpdate({ company: e.target.value })}
                placeholder="Tech Company"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rating</Label>
              <div className="pt-1">
                {renderStars(testimonial.rating, (rating) => onUpdate({ rating }))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`avatar-${testimonial.id}`} className="text-xs">
              Avatar URL (Optional)
            </Label>
            <Input
              id={`avatar-${testimonial.id}`}
              value={testimonial.avatar || ""}
              onChange={(e) => onUpdate({ avatar: e.target.value })}
              placeholder="https://..."
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
