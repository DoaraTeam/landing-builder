"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LandingPage, LandingConfig, LoadingConfig, PageSummary, SEOConfig } from "@/types/landing";
import LoadingConfigEditor from "@/components/editor/editors/fields/LoadingConfigEditor";
import SEOEditor from "@/components/editor/editors/fields/SEOEditor";
import { validateOpenGraphImages } from "@/lib/field-validators";

interface PageSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: LandingPage;
  config: LandingConfig;
  onSave: (updates: Partial<LandingPage>) => Promise<void>;
}

export default function PageSettingsModal({
  open,
  onOpenChange,
  page,
  config,
  onSave,
}: PageSettingsModalProps) {
  const [formData, setFormData] = useState({
    title: page.title,
    description: page.description,
    slug: page.slug,
    theme: page.theme,
    status: page.status || "draft",
  });
  const [seoConfig, setSeoConfig] = useState<SEOConfig>(
    page.seo || {
      metaTitle: page.title,
      metaDescription: page.description,
      keywords: [],
    }
  );
  const [loadingConfig, setLoadingConfig] = useState<LoadingConfig>(
    page.loading || {
      enabled: false,
      type: "spin",
      color: "#f97316",
      duration: 1000,
      minDuration: 500,
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Recomputed live from seoConfig, not just at Save — see
  // docs/editor-input-validation-plan.md. Only guards against values that
  // would corrupt actual runtime number math (NaN), not content the user
  // is trusted to get right themselves.
  const ogImageErrors = useMemo(
    () => validateOpenGraphImages(seoConfig.openGraph?.images),
    [seoConfig.openGraph?.images]
  );
  const hasOgImageErrors = Object.keys(ogImageErrors).length > 0;
  // For the slug-uniqueness check below. Fetched from the lightweight
  // summaries endpoint rather than requiring the full `config.pages` (every
  // other page's entire draft/published component tree, images included) —
  // this modal only ever needs every page's own slug.
  const [otherPages, setOtherPages] = useState<PageSummary[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/landing-config/pages")
      .then((r) => r.json())
      .then((data) => setOtherPages(data.pages || []))
      .catch((error) => console.error("Error fetching pages for slug check:", error));
  }, [open]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: formData.slug === generateSlug(page.title) ? generateSlug(value) : formData.slug,
    });
    setError("");
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData({ ...formData, slug: cleanSlug });
    setError("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.slug.trim()) {
      setError("Slug is required");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens");
      return false;
    }
    if (formData.slug !== page.slug && otherPages.some((p) => p.slug === formData.slug)) {
      setError("A page with this slug already exists");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || hasOgImageErrors) return;

    setLoading(true);
    setError("");

    try {
      const updates: Partial<LandingPage> = {
        title: formData.title,
        description: formData.description,
        slug: formData.slug,
        theme: formData.theme,
        status: formData.status as "draft" | "published" | "archived",
        seo: seoConfig,
        loading: loadingConfig,
        updatedAt: new Date().toISOString(),
      };

      await onSave(updates);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Page Settings</SheetTitle>
          <SheetDescription>
            Update page metadata, SEO settings, and publishing status.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0 py-4">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="loading">Loading</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="flex-1 overflow-y-auto min-h-0 space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Page Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme *</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) => setFormData({ ...formData, theme: value })}
                    disabled={loading}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(config.themes).map(([key, theme]) => (
                        <SelectItem key={key} value={key}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as "draft" | "published" | "archived",
                      })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="flex-1 overflow-y-auto min-h-0 space-y-6 pt-4">
            <SEOEditor
              config={seoConfig}
              onChange={setSeoConfig}
              disabled={loading}
              ogImageErrors={ogImageErrors}
            />
          </TabsContent>

          {/* Loading Tab */}
          <TabsContent value="loading" className="flex-1 overflow-y-auto min-h-0 space-y-6 pt-4">
            <LoadingConfigEditor config={loadingConfig} onChange={setLoadingConfig} />
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && (
          <div className="flex-shrink-0 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <SheetFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || hasOgImageErrors}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
