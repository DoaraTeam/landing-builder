"use client";

import { ComponentConfig } from "@/types/landing";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HiddenComponentsListProps {
  components: ComponentConfig[];
  onToggleVisibility: (componentId: string) => void;
  onSelectComponent: (componentId: string) => void;
}

const getComponentName = (type: string) => {
  const names: Record<string, string> = {
    hero: "Hero Section",
    features: "Features",
    pricing: "Pricing",
    testimonials: "Testimonials",
    cta: "Call to Action",
    footer: "Footer",
    stats: "Stats",
    team: "Team",
    faq: "FAQ",
    gallery: "Gallery",
    "logo-cloud": "Logo Cloud",
    contact: "Contact",
    content: "Content",
    newsletter: "Newsletter",
    video: "Video",
  };
  return names[type] || type;
};

export function HiddenComponentsList({
  components,
  onToggleVisibility,
  onSelectComponent,
}: HiddenComponentsListProps) {
  const hiddenComponents = components.filter((c) => !c.visible).sort((a, b) => a.order - b.order);

  if (hiddenComponents.length === 0) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <EyeOff className="h-4 w-4" />
          Hidden ({hiddenComponents.length})
          {hiddenComponents.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {hiddenComponents.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Hidden Components</SheetTitle>
          <SheetDescription>
            These components are hidden from the landing page. Click to show them again.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {hiddenComponents.map((component) => (
            <div
              key={component.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all cursor-pointer group"
              onClick={() => onSelectComponent(component.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    <h4 className="font-semibold text-gray-900">
                      {getComponentName(component.type)}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      Order: {component.order}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This component is currently hidden and won&apos;t appear on the published page.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  className="gap-2 bg-green-600 hover:bg-green-700 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(component.id);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Show
                </Button>
              </div>
            </div>
          ))}

          {hiddenComponents.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-0.5">💡</div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm mb-1">Quick Tip</h4>
                  <p className="text-xs text-blue-800">
                    You can also show hidden components by clicking the eye icon{" "}
                    <EyeOff className="inline h-3 w-3" /> in the component&apos;s toolbar on the
                    editor canvas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
