"use client";

import { useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";
import { ComponentConfig, LandingPage } from "@/types/landing";

interface UseCanvasDndParams {
  editingPage: LandingPage;
  setEditingPage: (page: LandingPage) => void;
  toast: ReturnType<typeof useToast>["toast"];
}

// Drag-to-reorder for the canvas's section list (@dnd-kit sensors + drag
// start/end handlers). Extracted verbatim from EditableLandingPage.tsx.
export function useCanvasDnd({ editingPage, setEditingPage, toast }: UseCanvasDndParams) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editingPage.components.findIndex((c) => c.id === active.id);
      const newIndex = editingPage.components.findIndex((c) => c.id === over.id);

      const newComponents = arrayMove(editingPage.components, oldIndex, newIndex);

      // Update order numbers
      const reorderedComponents = newComponents.map((c: ComponentConfig, i: number) => ({
        ...c,
        order: i,
      }));

      setEditingPage({
        ...editingPage,
        components: reorderedComponents,
      });

      toast.success({
        title: "Components Reordered",
        description: "Component order has been updated successfully",
      });
    }

    setActiveId(null);
  };

  return { activeId, sensors, handleDragStart, handleDragEnd };
}
