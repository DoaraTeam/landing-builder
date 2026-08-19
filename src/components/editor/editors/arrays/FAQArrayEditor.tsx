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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQArrayEditorProps {
  faqs: FAQItem[];
  onChange: (faqs: FAQItem[]) => void;
}

export function FAQArrayEditor({ faqs, onChange }: FAQArrayEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = () => {
    const newId = String(Date.now());
    onChange([
      ...faqs,
      {
        id: newId,
        question: "Your question here?",
        answer: "The answer to your question goes here.",
      },
    ]);
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, updates: Partial<FAQItem>) => {
    onChange(faqs.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    onChange(faqs.filter((f) => f.id !== deleteId));
    if (expandedId === deleteId) setExpandedId(null);
    setDeleteId(null);
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const index = faqs.findIndex((f) => f.id === id);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;
    onChange(arrayMove(faqs, index, newIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = faqs.findIndex((f) => f.id === active.id);
    const newIndex = faqs.findIndex((f) => f.id === over.id);
    onChange(arrayMove(faqs, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">FAQ Items ({faqs.length})</Label>
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Add Question
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={faqs.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <SortableFAQCard
                key={faq.id}
                faq={faq}
                index={index}
                total={faqs.length}
                isExpanded={expandedId === faq.id}
                onToggleExpand={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                onUpdate={(updates) => handleUpdate(faq.id, updates)}
                onMove={(direction) => handleMove(faq.id, direction)}
                onDelete={() => handleDelete(faq.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {faqs.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed rounded">
          No FAQ items yet. Click &quot;Add Question&quot; to get started.
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete FAQ item?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

interface SortableFAQCardProps {
  faq: FAQItem;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<FAQItem>) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}

function SortableFAQCard({
  faq,
  index,
  total,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onMove,
  onDelete,
}: SortableFAQCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: faq.id,
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
            <div className="flex-1">
              <CardTitle className="text-sm font-medium line-clamp-1">{faq.question}</CardTitle>
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
            <Label htmlFor={`question-${faq.id}`} className="text-xs">
              Question
            </Label>
            <Input
              id={`question-${faq.id}`}
              value={faq.question}
              onChange={(e) => onUpdate({ question: e.target.value })}
              placeholder="Enter your question..."
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`answer-${faq.id}`} className="text-xs">
              Answer
            </Label>
            <textarea
              id={`answer-${faq.id}`}
              value={faq.answer}
              onChange={(e) => onUpdate({ answer: e.target.value })}
              placeholder="Enter the answer..."
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
