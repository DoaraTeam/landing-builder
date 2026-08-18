"use client";

import { useState } from "react";
import { SubPage, ComponentConfig } from "@/types/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SubPageManagerProps {
  subPages: SubPage[];
  onUpdate: (subPages: SubPage[]) => void;
  onEditSubPage: (subPageId: string) => void;
  mainPageComponents?: ComponentConfig[]; // Template components to inherit
}

export default function SubPageManager({
  subPages,
  onUpdate,
  onEditSubPage,
  mainPageComponents = [],
}: SubPageManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubPage, setEditingSubPage] = useState<SubPage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    icon: "",
    description: "",
  });
  const { toast } = useToast();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleOpenDialog = (subPage?: SubPage) => {
    if (subPage) {
      setEditingSubPage(subPage);
      setFormData({
        title: subPage.title,
        slug: subPage.slug,
        icon: subPage.icon || "",
        description: subPage.description || "",
      });
    } else {
      setEditingSubPage(null);
      setFormData({
        title: "",
        slug: "",
        icon: "",
        description: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (editingSubPage) {
      // Update existing
      const updated = subPages.map((sp) =>
        sp.id === editingSubPage.id
          ? {
              ...sp,
              title: formData.title,
              slug: formData.slug || generateSlug(formData.title),
              icon: formData.icon,
              description: formData.description,
            }
          : sp
      );
      onUpdate(updated);

      toast({
        title: "✅ Đã cập nhật",
        description: `Thông tin của "${formData.title}" đã được cập nhật`,
        duration: 3000,
      });
    } else {
      // Create new - inherit components from main page (deep copy with new IDs)
      const inheritedComponents = mainPageComponents.map((comp, index) => ({
        ...comp,
        id: `comp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        order: index,
        config: JSON.parse(JSON.stringify(comp.config)), // Deep copy config to avoid reference issues
      }));

      const newSubPage: SubPage = {
        id: `subpage-${Date.now()}`,
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        icon: formData.icon,
        description: formData.description,
        components: inheritedComponents, // Inherit template from main page
        order: subPages.length,
        visible: true,
      };
      onUpdate([...subPages, newSubPage]);

      toast({
        title: "✅ Trang mới đã được tạo",
        description: `"${formData.title}" đã kế thừa ${inheritedComponents.length} components từ trang chính`,
        duration: 4000,
      });
    }

    setDialogOpen(false);
    setFormData({ title: "", slug: "", icon: "", description: "" });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa trang này?")) return;
    onUpdate(subPages.filter((sp) => sp.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    onUpdate(subPages.map((sp) => (sp.id === id ? { ...sp, visible: !sp.visible } : sp)));
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const index = subPages.findIndex((sp) => sp.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === subPages.length - 1)
    ) {
      return;
    }

    const newSubPages = [...subPages];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSubPages[index], newSubPages[targetIndex]] = [newSubPages[targetIndex], newSubPages[index]];

    // Update order
    newSubPages.forEach((sp, idx) => {
      sp.order = idx;
    });

    onUpdate(newSubPages);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Sub-Pages</h3>
          <p className="text-sm text-gray-500">Quản lý các trang con trong landing page</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Trang
        </Button>
      </div>

      {subPages.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500 mb-2">Chưa có trang con nào</p>
            <Button onClick={() => handleOpenDialog()} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tạo Trang Đầu Tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {subPages
            .sort((a, b) => a.order - b.order)
            .map((subPage, index) => (
              <Card key={subPage.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMove(subPage.id, "up")}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMove(subPage.id, "down")}
                        disabled={index === subPages.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {subPage.icon && <span className="text-xl">{subPage.icon}</span>}
                        <CardTitle className="text-base">{subPage.title}</CardTitle>
                        {!subPage.visible && (
                          <Badge variant="secondary" className="text-xs">
                            Ẩn
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs mt-1">
                        /{subPage.slug} • {subPage.components.length} components
                        {subPage.description && ` • ${subPage.description}`}
                      </CardDescription>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(subPage.id)}
                        title={subPage.visible ? "Ẩn trang" : "Hiện trang"}
                      >
                        {subPage.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEditSubPage(subPage.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(subPage)}>
                        <GripVertical className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subPage.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubPage ? "Chỉnh sửa trang" : "Tạo trang mới"}</DialogTitle>
            <DialogDescription>
              {editingSubPage
                ? "Cập nhật thông tin trang con"
                : `Thêm một trang con vào landing page. Trang mới sẽ kế thừa ${mainPageComponents.length} components từ trang chính.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  // Only auto-derive the slug from the title while it hasn't been
                  // manually customized — otherwise editing a title would silently
                  // rewrite an already-published subpage's URL.
                  const slugIsAutoGenerated =
                    !editingSubPage || formData.slug === generateSlug(editingSubPage.title);

                  setFormData({
                    ...formData,
                    title: newTitle,
                    slug: slugIsAutoGenerated ? generateSlug(newTitle) : formData.slug,
                  });
                }}
                placeholder="Ví dụ: Tính năng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  })
                }
                placeholder="tinh-nang"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji hoặc tên icon)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🚀 hoặc rocket"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về trang này"
              />
            </div>

            {/* Info box for new subpage */}
            {!editingSubPage && mainPageComponents.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>💡 Lưu ý:</strong> Trang mới sẽ tự động kế thừa{" "}
                  {mainPageComponents.length} components từ trang chính. Bạn có thể chỉnh sửa sau
                  khi tạo.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={!formData.title.trim()}>
              {editingSubPage ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
