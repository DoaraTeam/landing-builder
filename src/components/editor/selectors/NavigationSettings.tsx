"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Navigation as NavigationIcon } from "lucide-react";
import { PageNavigation } from "@/types/landing";

interface NavigationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navigation?: PageNavigation;
  onUpdate: (navigation: PageNavigation) => void;
}

export default function NavigationSettings({
  open,
  onOpenChange,
  navigation,
  onUpdate,
}: NavigationSettingsProps) {
  const handleChange = (key: keyof PageNavigation, value: string | boolean) => {
    onUpdate({
      ...navigation,
      enabled: navigation?.enabled ?? true,
      style: navigation?.style ?? "tabs",
      [key]: value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <NavigationIcon className="h-5 w-5 text-blue-600" />
            <div>
              <SheetTitle>Navigation Settings</SheetTitle>
              <SheetDescription>
                Cấu hình cách hiển thị navigation giữa các sub-pages
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            {/* Navigation Style */}
            <div className="space-y-2">
              <Label htmlFor="navStyle">Navigation Style</Label>
              <Select
                value={navigation?.style || "tabs"}
                onValueChange={(value) => handleChange("style", value)}
              >
                <SelectTrigger id="navStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tabs">Tabs (Horizontal)</SelectItem>
                  <SelectItem value="pills">Pills (Rounded)</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show Icons */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Icons</Label>
                <p className="text-sm text-gray-500">Hiển thị icon bên cạnh tiêu đề trang</p>
              </div>
              <Button
                variant={navigation?.showIcons ? "default" : "outline"}
                size="sm"
                onClick={() => handleChange("showIcons", !navigation?.showIcons)}
              >
                {navigation?.showIcons ? "Bật" : "Tắt"}
              </Button>
            </div>

            {/* Sticky */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Sticky Navigation</Label>
                <p className="text-sm text-gray-500">Navigation luôn hiển thị khi scroll</p>
              </div>
              <Button
                variant={navigation?.sticky ? "default" : "outline"}
                size="sm"
                onClick={() => handleChange("sticky", !navigation?.sticky)}
              >
                {navigation?.sticky ? "Bật" : "Tắt"}
              </Button>
            </div>

            {/* Position (for sidebar) */}
            {navigation?.style === "sidebar" && (
              <div className="space-y-2">
                <Label htmlFor="position">Sidebar Position</Label>
                <Select
                  value={navigation?.position || "left"}
                  onValueChange={(value) => handleChange("position", value)}
                >
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Preview landing page để xem navigation hoạt động như thế nào
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
