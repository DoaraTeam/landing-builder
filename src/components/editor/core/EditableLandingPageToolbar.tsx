"use client";

import { ComponentConfig } from "@/types/landing";
import { HiddenComponentsList } from "@/components/editor/panels/HiddenComponentsList";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save,
  Plus,
  Settings,
  Palette,
  Code2,
  SlidersHorizontal,
  ChevronDown,
  Navigation as NavigationIcon,
} from "lucide-react";

const ZOOM_PRESETS = [50, 75, 90, 100, 125, 150, 200];

interface EditableLandingPageToolbarProps {
  pageTitle: string;
  readOnly: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;

  zoomPercent: number;
  onZoomChange: (value: number) => void;
  onFitZoom: () => void;

  components: ComponentConfig[];
  onToggleVisibility: (componentId: string) => void;
  onSelectComponent: (id: string | null) => void;

  onAddSection: () => void;

  onOpenTheme: () => void;
  // The Navigation Settings menu item is temporarily hidden (see the
  // `false &&` below) — the underlying condition is preserved so it's a
  // one-line change to bring back once the styling clash it was hidden for
  // is resolved.
  showNavigationMenuItem: boolean;
  onOpenNavigationSettings: () => void;
  onOpenCustomCode: () => void;
  onOpenSettings: () => void;

  onSave: () => void;
}

/** The editor's top toolbar — title/status, zoom control, Hidden Components,
 * Add Section, Page Settings dropdown, and Save — extracted verbatim from
 * EditableLandingPage.tsx. */
export function EditableLandingPageToolbar({
  pageTitle,
  readOnly,
  saving,
  hasUnsavedChanges,
  zoomPercent,
  onZoomChange,
  onFitZoom,
  components,
  onToggleVisibility,
  onSelectComponent,
  onAddSection,
  onOpenTheme,
  showNavigationMenuItem,
  onOpenNavigationSettings,
  onOpenCustomCode,
  onOpenSettings,
  onSave,
}: EditableLandingPageToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 truncate">{pageTitle}</h1>
          {readOnly && (
            <div className="flex items-center gap-1 shrink-0 rounded-full bg-gray-100 px-2 py-0.5">
              <span className="text-xs text-gray-600 font-medium">Read-only preview</span>
            </div>
          )}
          {!readOnly && saving && (
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 font-medium">Saving...</span>
            </div>
          )}
          {!readOnly && !saving && hasUnsavedChanges && (
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-orange-600 font-medium">Unsaved changes</span>
            </div>
          )}
          {!readOnly && !saving && !hasUnsavedChanges && (
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">All changes saved</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                {zoomPercent}%
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={onFitZoom}>Fit</DropdownMenuItem>
              <DropdownMenuSeparator />
              {ZOOM_PRESETS.map((value) => (
                <DropdownMenuItem key={value} onClick={() => onZoomChange(value)}>
                  {value}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {!readOnly && (
            <>
              <HiddenComponentsList
                components={components}
                onToggleVisibility={onToggleVisibility}
                onSelectComponent={onSelectComponent}
              />
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={onAddSection}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Section</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Page Settings</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTimeout(onOpenTheme, 0)}>
                    <Palette className="h-4 w-4" />
                    Theme
                  </DropdownMenuItem>
                  {/* Temporarily hidden — the separate nav bar it renders
                      doesn't match the page's own Header styling, sits
                      stacked awkwardly above it. Re-enable once that's
                      resolved (the panel + public-site wiring underneath
                      are otherwise working). */}
                  {false && showNavigationMenuItem && (
                    <DropdownMenuItem onClick={() => setTimeout(onOpenNavigationSettings, 0)}>
                      <NavigationIcon className="h-4 w-4" />
                      Navigation
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setTimeout(onOpenCustomCode, 0)}>
                    <Code2 className="h-4 w-4" />
                    Code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeout(onOpenSettings, 0)}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={onSave}
                disabled={saving || !hasUnsavedChanges}
                size="sm"
                variant={saving || hasUnsavedChanges ? "default" : "outline"}
                className={`h-7 gap-1 px-2 text-xs transition-all duration-200 ${
                  saving
                    ? "bg-blue-400 cursor-not-allowed"
                    : hasUnsavedChanges
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                <Save className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`} />
                {saving ? "Saving..." : hasUnsavedChanges ? "Save Changes*" : "Saved"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
