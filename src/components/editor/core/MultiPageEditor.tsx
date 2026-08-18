"use client";

import { useState, useEffect } from "react";
import { LandingPage, SubPage, LandingConfig, Theme } from "@/types/landing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubPageManager from "@/components/editor/core/SubPageManager";
import { EditableLandingPage } from "@/components/editor/core/EditableLandingPage";
import { Settings, FileText, Layout, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MultiPageEditorProps {
  page: LandingPage;
  config: LandingConfig;
  onSave: (page: LandingPage) => Promise<void>;
  onSaveCustomTheme?: (theme: Theme, themeId: string) => Promise<void>;
}

export default function MultiPageEditor({
  page,
  config,
  onSave,
  onSaveCustomTheme,
}: MultiPageEditorProps) {
  const [editingPage, setEditingPage] = useState<LandingPage>(page);
  const [activeTab, setActiveTab] = useState<"main" | "subpages" | "settings">("main");
  const [editingSubPageId, setEditingSubPageId] = useState<string | null>(null);

  // Sync editingPage when prop page changes (e.g., when applying version)
  useEffect(() => {
    setEditingPage(page);
  }, [page]);

  const subPages = editingPage.subPages || [];
  const editingSubPage = editingSubPageId
    ? subPages.find((sp) => sp.id === editingSubPageId)
    : null;

  const handleUpdateSubPages = (updated: SubPage[]) => {
    const updatedPage = {
      ...editingPage,
      subPages: updated,
    };
    setEditingPage(updatedPage);
    onSave(updatedPage);
  };

  const handleUpdateMainPage = async (updated: LandingPage) => {
    // Preserve multi-page properties
    const updatedPage = {
      ...updated,
      isMultiPage: true, // Always true for MultiPageEditor
      subPages: editingPage.subPages, // Preserve subPages
      navigation: editingPage.navigation, // Preserve navigation
    };
    setEditingPage(updatedPage);
    await onSave(updatedPage);
  };

  const handleEditSubPage = (subPageId: string) => {
    setEditingSubPageId(subPageId);
    setActiveTab("subpages");
  };

  const handleUpdateSubPage = async (updated: SubPage) => {
    const updatedSubPages = subPages.map((sp) => (sp.id === updated.id ? updated : sp));
    await handleUpdateSubPages(updatedSubPages);
  };

  const handleUpdateNavigation = (key: string, value: string | boolean) => {
    const updatedPage = {
      ...editingPage,
      navigation: {
        ...editingPage.navigation,
        enabled: editingPage.navigation?.enabled ?? true,
        style: editingPage.navigation?.style ?? "tabs",
        [key]: value,
      },
    };
    setEditingPage(updatedPage);
    onSave(updatedPage);
  };

  // If editing a sub-page, show its editor
  if (editingSubPage) {
    return (
      <div className="min-h-screen">
        <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto py-3 px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setEditingSubPageId(null)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h2 className="font-semibold text-lg">Chỉnh sửa: {editingSubPage.title}</h2>
                <p className="text-sm text-gray-500">Sub-page của {editingPage.title}</p>
              </div>
            </div>
            <Badge variant="outline">{editingSubPage.components.length} components</Badge>
          </div>
        </div>

        <EditableLandingPage
          page={{
            ...editingPage,
            title: editingSubPage.title,
            slug: editingSubPage.slug,
            components: editingSubPage.components,
          }}
          config={config}
          onSave={async (updatedSubPageData) => {
            await handleUpdateSubPage({
              ...editingSubPage,
              components: updatedSubPageData.components,
            });
          }}
          onSaveCustomTheme={onSaveCustomTheme}
        />
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as "main" | "subpages" | "settings")}
      className="min-h-screen"
    >
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <TabsList>
            <TabsTrigger value="main" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span>Main Page</span>
            </TabsTrigger>
            <TabsTrigger value="subpages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Sub-Pages</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {subPages.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Navigation</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Content */}
      <TabsContent value="main" className="mt-0">
        <EditableLandingPage
          page={editingPage}
          config={config}
          onSave={handleUpdateMainPage}
          onSaveCustomTheme={onSaveCustomTheme}
        />
      </TabsContent>

      <TabsContent value="subpages" className="mt-0">
        <div className="container mx-auto py-8 max-w-5xl">
          <SubPageManager
            subPages={subPages}
            onUpdate={handleUpdateSubPages}
            onEditSubPage={handleEditSubPage}
            mainPageComponents={editingPage.components}
          />
        </div>
      </TabsContent>

      <TabsContent value="settings" className="mt-0">
        <div className="container mx-auto py-8 max-w-3xl">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Navigation Settings</h3>
              <p className="text-sm text-gray-500">
                Cấu hình cách hiển thị navigation giữa các sub-pages
              </p>
            </div>

            <div className="space-y-4">
              {/* Navigation Style */}
              <div className="space-y-2">
                <Label htmlFor="navStyle">Navigation Style</Label>
                <Select
                  value={editingPage.navigation?.style || "tabs"}
                  onValueChange={(value) => handleUpdateNavigation("style", value)}
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
                  variant={editingPage.navigation?.showIcons ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    handleUpdateNavigation("showIcons", !editingPage.navigation?.showIcons)
                  }
                >
                  {editingPage.navigation?.showIcons ? "Bật" : "Tắt"}
                </Button>
              </div>

              {/* Sticky */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sticky Navigation</Label>
                  <p className="text-sm text-gray-500">Navigation luôn hiển thị khi scroll</p>
                </div>
                <Button
                  variant={editingPage.navigation?.sticky ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleUpdateNavigation("sticky", !editingPage.navigation?.sticky)}
                >
                  {editingPage.navigation?.sticky ? "Bật" : "Tắt"}
                </Button>
              </div>

              {/* Position (for sidebar) */}
              {editingPage.navigation?.style === "sidebar" && (
                <div className="space-y-2">
                  <Label htmlFor="position">Sidebar Position</Label>
                  <Select
                    value={editingPage.navigation?.position || "left"}
                    onValueChange={(value) => handleUpdateNavigation("position", value)}
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
                <strong>💡 Tip:</strong> Preview landing page để xem navigation hoạt động như thế
                nào
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
