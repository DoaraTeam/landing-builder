"use client";

import { HeaderTab, ComponentConfig, SubPage } from "@/types/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { LinkSelector } from "@/components/editor/editors/fields/LinkSelector";

interface HeaderTabsEditorProps {
  tabs: HeaderTab[];
  onChange: (tabs: HeaderTab[]) => void;
  // Props for link selection
  allComponents?: ComponentConfig[];
  subPages?: SubPage[];
  pageSlug?: string;
}

export function HeaderTabsEditor({
  tabs = [],
  onChange,
  allComponents = [],
  subPages = [],
  pageSlug,
}: HeaderTabsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addTab = () => {
    const newTab: HeaderTab = {
      id: Date.now().toString(),
      text: "New Tab",
      link: "#",
    };
    onChange([...tabs, newTab]);
  };

  const removeTab = (index: number) => {
    const newTabs = tabs.filter((_, i) => i !== index);
    onChange(newTabs);
  };

  const updateTab = (index: number, field: keyof HeaderTab, value: string) => {
    const newTabs = [...tabs];
    newTabs[index] = { ...newTabs[index], [field]: value };
    onChange(newTabs);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTabs = [...tabs];
    const draggedTab = newTabs[draggedIndex];
    newTabs.splice(draggedIndex, 1);
    newTabs.splice(index, 0, draggedTab);

    setDraggedIndex(index);
    onChange(newTabs);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Navigation Tabs</Label>
        <Button onClick={addTab} size="sm" variant="outline">
          <Plus size={16} className="mr-1" />
          Add Tab
        </Button>
      </div>

      <div className="space-y-3">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`border rounded-lg p-3 space-y-2 bg-white ${
              draggedIndex === index ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-400 cursor-grab" />
                <span className="text-sm font-medium">Tab {index + 1}</span>
              </div>
              <Button
                onClick={() => removeTab(index)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-xs">Text</Label>
                <Input
                  value={tab.text}
                  onChange={(e) => updateTab(index, "text", e.target.value)}
                  placeholder="Tab text"
                  className="mt-1"
                />
              </div>

              <div>
                <LinkSelector
                  value={tab.link}
                  onChange={(value) => updateTab(index, "link", value)}
                  label="Link"
                  placeholder="e.g., #pricing or /slug/page"
                  components={allComponents}
                  subPages={subPages}
                  pageSlug={pageSlug}
                />
              </div>
            </div>
          </div>
        ))}

        {tabs.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
            No tabs yet. Click &quot;Add Tab&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}
