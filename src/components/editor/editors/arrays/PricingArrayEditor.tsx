"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkSelector } from "@/components/editor/editors/fields/LinkSelector";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { ComponentConfig, SubPage } from "@/types/landing";
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

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: { text: string; link: string };
  highlighted: boolean;
  badge?: string;
}

interface PricingArrayEditorProps {
  plans: PricingPlan[];
  onChange: (plans: PricingPlan[]) => void;
  // Props for link selection
  allComponents?: ComponentConfig[];
  subPages?: SubPage[];
  pageSlug?: string;
}

export function PricingArrayEditor({
  plans,
  onChange,
  allComponents = [],
  subPages = [],
  pageSlug,
}: PricingArrayEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = () => {
    const newId = `plan-${Date.now()}`;
    onChange([
      ...plans,
      {
        id: newId,
        name: "New Plan",
        price: "$99",
        period: "per month",
        description: "Perfect for growing businesses",
        features: ["Feature 1", "Feature 2", "Feature 3"],
        cta: { text: "Get Started", link: "#" },
        highlighted: false,
      },
    ]);
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, updates: Partial<PricingPlan>) => {
    onChange(plans.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    onChange(plans.filter((p) => p.id !== deleteId));
    if (expandedId === deleteId) setExpandedId(null);
    setDeleteId(null);
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const index = plans.findIndex((p) => p.id === id);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= plans.length) return;
    onChange(arrayMove(plans, index, newIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = plans.findIndex((p) => p.id === active.id);
    const newIndex = plans.findIndex((p) => p.id === over.id);
    onChange(arrayMove(plans, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Pricing Plans ({plans.length})</Label>
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Add Plan
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={plans.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {plans.map((plan, index) => (
              <SortablePlanCard
                key={plan.id}
                plan={plan}
                index={index}
                total={plans.length}
                isExpanded={expandedId === plan.id}
                onToggleExpand={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                onUpdate={(updates) => handleUpdate(plan.id, updates)}
                onMove={(direction) => handleMove(plan.id, direction)}
                onDelete={() => handleDelete(plan.id)}
                allComponents={allComponents}
                subPages={subPages}
                pageSlug={pageSlug}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {plans.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed rounded">
          No pricing plans yet. Click &quot;Add Plan&quot; to get started.
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete pricing plan?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

interface SortablePlanCardProps {
  plan: PricingPlan;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<PricingPlan>) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
  allComponents: ComponentConfig[];
  subPages: SubPage[];
  pageSlug?: string;
}

function SortablePlanCard({
  plan,
  index,
  total,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onMove,
  onDelete,
  allComponents,
  subPages,
  pageSlug,
}: SortablePlanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: plan.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFeatureChange = (featureIndex: number, value: string) => {
    const updatedFeatures = [...plan.features];
    updatedFeatures[featureIndex] = value;
    onUpdate({ features: updatedFeatures });
  };

  const handleAddFeature = () => {
    onUpdate({ features: [...plan.features, "New Feature"] });
  };

  const handleRemoveFeature = (featureIndex: number) => {
    onUpdate({ features: plan.features.filter((_, i) => i !== featureIndex) });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border ${plan.highlighted ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
    >
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
              <CardTitle className="text-sm font-medium">{plan.name}</CardTitle>
              {plan.highlighted && (
                <Badge variant="default" className="text-xs">
                  Popular
                </Badge>
              )}
              {plan.badge && (
                <Badge variant="secondary" className="text-xs">
                  {plan.badge}
                </Badge>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {plan.price} {plan.period}
            </span>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`name-${plan.id}`} className="text-xs">
                Plan Name
              </Label>
              <Input
                id={`name-${plan.id}`}
                value={plan.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`price-${plan.id}`} className="text-xs">
                Price
              </Label>
              <Input
                id={`price-${plan.id}`}
                value={plan.price}
                onChange={(e) => onUpdate({ price: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`period-${plan.id}`} className="text-xs">
              Period
            </Label>
            <Input
              id={`period-${plan.id}`}
              value={plan.period}
              onChange={(e) => onUpdate({ period: e.target.value })}
              placeholder="per month"
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`description-${plan.id}`} className="text-xs">
              Description
            </Label>
            <Input
              id={`description-${plan.id}`}
              value={plan.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`badge-${plan.id}`} className="text-xs">
                Badge (Optional)
              </Label>
              <Input
                id={`badge-${plan.id}`}
                value={plan.badge || ""}
                onChange={(e) => onUpdate({ badge: e.target.value })}
                placeholder="Popular, Best Value..."
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5 flex items-end">
              <Button
                type="button"
                size="sm"
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => onUpdate({ highlighted: !plan.highlighted })}
                className="h-8 w-full"
              >
                <Star className="h-3 w-3 mr-1" />
                {plan.highlighted ? "Highlighted" : "Highlight"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Features ({plan.features.length})</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddFeature}
                className="h-6 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(featureIndex, e.target.value)}
                    className="h-7 text-xs flex-1"
                    placeholder="Feature description"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFeature(featureIndex)}
                    className="h-7 w-7 p-0 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 p-2 border border-gray-200 rounded">
            <Label className="text-xs font-semibold">Call to Action</Label>
            <div className="space-y-2">
              <Input
                value={plan.cta?.text}
                onChange={(e) => onUpdate({ cta: { ...plan.cta, text: e.target.value } })}
                placeholder="Button text"
                className="h-7 text-xs"
              />
              <LinkSelector
                value={plan.cta?.link || ""}
                onChange={(value) => onUpdate({ cta: { ...plan.cta, link: value } })}
                label=""
                placeholder="e.g., #contact or /slug/page"
                components={allComponents}
                subPages={subPages}
                pageSlug={pageSlug}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
