"use client";

import { useState } from "react";
import { ComponentConfig } from "@/types/landing";
import {
  componentCategories,
  ComponentVariant,
} from "@/components/editor/data/component-templates-data";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw } from "lucide-react";

interface ChangeTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  component: ComponentConfig;
  onChangeTemplate: (newConfig: Partial<ComponentConfig>) => void;
}

export function ChangeTemplateDialog({
  isOpen,
  onClose,
  component,
  onChangeTemplate,
}: ChangeTemplateDialogProps) {
  const [selectedVariant, setSelectedVariant] = useState<ComponentVariant | null>(null);

  // Find the category for this component type
  const category = componentCategories.find((cat) => cat.type === component.type);

  if (!category) {
    return null;
  }

  const handleApply = () => {
    if (selectedVariant) {
      // Merge the new template config with the current component
      onChangeTemplate({
        ...selectedVariant.template,
        id: component.id, // Keep the same ID
        order: component.order, // Keep the same order
        visible: component.visible, // Keep visibility state
      });
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            Change Template - {category.name}
          </SheetTitle>
          <SheetDescription>
            Select a different template variant for this component. Your content (text, images,
            etc.) will be preserved and adapted to the new template layout.
          </SheetDescription>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>✓ What will be preserved:</strong> Title, description, images, buttons, lists
              (features, testimonials, etc.), and your custom styling.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <strong>→ What will change:</strong> Layout structure, default styling, and
              positioning to match the new template.
            </p>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.variants.map((variant, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedVariant === variant
                    ? "border-purple-500 bg-purple-50 shadow-lg"
                    : "border-gray-200 hover:border-purple-300"
                }`}
                onClick={() => setSelectedVariant(variant)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{variant.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{variant.description}</p>
                  </div>
                  {selectedVariant === variant && (
                    <CheckCircle2 className="h-6 w-6 text-purple-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                {/* Preview of template config (optional) */}
                {variant.preview && (
                  <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <div className="font-mono overflow-hidden">{variant.preview}</div>
                  </div>
                )}

                {/* Show key features of the template */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {Object.keys(variant.template.config || {})
                    .slice(0, 4)
                    .map((key) => (
                      <span
                        key={key}
                        className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                      >
                        {key}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0 mt-4">
          <div className="text-sm text-gray-600">
            {category.variants.length} template{category.variants.length > 1 ? "s" : ""} available
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedVariant}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Apply Template
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
