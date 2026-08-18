"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    onChange([
      ...features,
      {
        id: `feature-${Date.now()}`,
        icon: "⭐",
        title: "New Feature",
        description: "Feature description goes here",
      },
    ]);
    setExpandedIndex(features.length);
  };

  const handleUpdate = (index: number, updates: Partial<FeatureItem>) => {
    const updated = features.map((item, i) => (i === index ? { ...item, ...updates } : item));
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    if (confirm("Delete this feature?")) {
      onChange(features.filter((_, i) => i !== index));
      setExpandedIndex(null);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= features.length) return;

    const updated = [...features];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
    setExpandedIndex(newIndex);
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

      <div className="space-y-2">
        {features.map((feature, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <CardTitle className="text-sm font-medium">
                    {feature.icon} {feature.title}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "up");
                    }}
                    disabled={index === 0}
                    title="Move Up"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "down");
                    }}
                    disabled={index === features.length - 1}
                    title="Move Down"
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedIndex === index && (
              <CardContent className="p-3 space-y-3 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor={`icon-${index}`} className="text-xs">
                    Icon/Emoji
                  </Label>
                  <Input
                    id={`icon-${index}`}
                    value={feature.icon || ""}
                    onChange={(e) => handleUpdate(index, { icon: e.target.value })}
                    placeholder="⭐"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`title-${index}`} className="text-xs">
                    Title
                  </Label>
                  <Input
                    id={`title-${index}`}
                    value={feature.title}
                    onChange={(e) => handleUpdate(index, { title: e.target.value })}
                    placeholder="Feature Title"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`description-${index}`} className="text-xs">
                    Description
                  </Label>
                  <Input
                    id={`description-${index}`}
                    value={feature.description}
                    onChange={(e) => handleUpdate(index, { description: e.target.value })}
                    placeholder="Feature description"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`image-${index}`} className="text-xs">
                    Image URL (Optional)
                  </Label>
                  <Input
                    id={`image-${index}`}
                    value={feature.image || ""}
                    onChange={(e) => handleUpdate(index, { image: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {features.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed rounded">
          No features yet. Click &quot;Add Feature&quot; to get started.
        </div>
      )}
    </div>
  );
}
