"use client";

import { useState, useEffect } from "react";
import { ComponentConfig, HeaderConfig } from "@/types/landing";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ImageUpload } from "@/components/editor/editors/fields/ImageUpload";
import { FeaturesArrayEditor } from "@/components/editor/editors/arrays/FeaturesArrayEditor";
import { PricingArrayEditor } from "@/components/editor/editors/arrays/PricingArrayEditor";
import { TestimonialsArrayEditor } from "@/components/editor/editors/arrays/TestimonialsArrayEditor";
import { FooterLinksEditor } from "@/components/editor/editors/arrays/FooterLinksEditor";
import { LogoArrayEditor } from "@/components/editor/editors/arrays/LogoArrayEditor";
import { HeaderTabsEditor } from "@/components/editor/editors/arrays/HeaderTabsEditor";
import { StatsArrayEditor } from "@/components/editor/editors/arrays/StatsArrayEditor";
import { FAQArrayEditor } from "@/components/editor/editors/arrays/FAQArrayEditor";
import { LinkSelector } from "@/components/editor/editors/fields/LinkSelector";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { ensureAnimation } from "@/lib/animation-defaults";
import { SubPage } from "@/types/landing";

interface ComponentEditorProps {
  // null while closed. Kept in the tree (parent no longer conditionally
  // mounts this component) so the panel can play its close transition
  // instead of vanishing instantly.
  component: ComponentConfig | null;
  onUpdate: (config: ComponentConfig) => void;
  onClose: () => void;
  // Additional props for link selection
  allComponents?: ComponentConfig[]; // All components in current page
  subPages?: SubPage[]; // Subpages for navigation
  pageSlug?: string; // Current page slug
  isMultiPage?: boolean; // Whether this is a multi-page landing
  // Reports whether there are unsaved edits, so a parent switching the
  // selected component elsewhere can guard against silently discarding them.
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * ComponentEditor - Side panel for editing component configuration
 * Shows 3 tabs: Content, Layout, Style
 */
export function ComponentEditor({
  component: incomingComponent,
  onUpdate,
  onClose,
  allComponents = [],
  subPages = [],
  pageSlug,
  isMultiPage = false,
  onDirtyChange,
}: ComponentEditorProps) {
  // Caches the last non-null component so the panel keeps showing its fields
  // while sliding closed, instead of blanking out the instant the parent
  // deselects. Cleared (unmounting the panel's content) shortly after the
  // close transition finishes.
  const [component, setComponent] = useState<ComponentConfig | null>(incomingComponent);
  const isOpen = incomingComponent !== null;

  useEffect(() => {
    if (incomingComponent) {
      setComponent(incomingComponent);
    } else {
      const timer = setTimeout(() => setComponent(null), 300);
      return () => clearTimeout(timer);
    }
  }, [incomingComponent]);

  // Use Record<string, unknown> to allow flexible property access for different component types
  const [config, setConfig] = useState<Record<string, unknown>>(
    (component?.config as Record<string, unknown>) ?? {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  // Whether local edits differ from the last-saved config, so closing the
  // panel can warn before silently discarding them.
  const isDirty = !!component && JSON.stringify(config) !== JSON.stringify(component.config);

  useEffect(() => {
    onDirtyChange?.(isDirty);
    // Only re-run when the dirty flag itself flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  // Report clean when the panel unmounts (e.g. parent closed it after a
  // guarded switch), so a stale "dirty" flag never lingers in the parent.
  useEffect(() => {
    return () => onDirtyChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestClose = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  };

  // Sync local state when component changes (when user clicks different section)
  useEffect(() => {
    if (!component) return;
    setIsLoading(true);

    // Ensure component has animation config
    const componentWithAnimation = ensureAnimation(component);

    // Ensure footer components have background and spacing
    let processedConfig = componentWithAnimation.config as Record<string, unknown>;
    if (component.type === "footer") {
      processedConfig = {
        ...componentWithAnimation.config,
        background: componentWithAnimation.config.background || {
          type: "solid",
          color: "#0f172a",
        },
        spacing: componentWithAnimation.config.spacing || {
          padding: "xl",
          margin: "none",
        },
      };
    }

    setConfig(processedConfig);
    setActiveTab("content"); // Reset to content tab when switching components
    // Brief loading state to show component switch
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component?.id, component?.type, component?.config]);

  const handleChange = (path: string, value: unknown) => {
    const keys = path.split(".");
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  const handleSave = () => {
    if (!component) return;
    onUpdate({ ...component, config });
  };

  const getComponentIcon = (type: string) => {
    const icons: Record<string, string> = {
      header: "📱",
      hero: "🦸",
      features: "✨",
      pricing: "💰",
      testimonials: "💬",
      cta: "📣",
      footer: "🔗",
    };
    return icons[type] || "📦";
  };

  // Nothing has ever been selected yet — no need to mount anything.
  if (!component) return null;

  return (
    <>
      {/* Backdrop — clicking outside the panel closes it (through the same
          unsaved-changes guard as the X/Cancel buttons) */}
      <div
        className={cn(
          // A plain opacity transition (not a keyframe animation) so that
          // clicking close mid-open reverses smoothly from wherever the
          // fade currently is, instead of restarting from a fixed keyframe.
          "fixed inset-0 z-[998] bg-black/80 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={handleRequestClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          // A plain transform transition (not a keyframe animation): CSS
          // keyframe animations (animate-in/animate-out) always play from a
          // fixed 0%/100% reference regardless of current position, so
          // closing before the open animation finished caused a visible snap
          // back to "fully open" before it slid out. A transition instead
          // interpolates from the actual current position, so interrupting
          // it mid-flight reverses smoothly with no jerk.
          "fixed right-0 top-0 h-full w-full md:w-[36rem] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-[999] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getComponentIcon(component.type)}</span>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Edit Component
                {isLoading && (
                  <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                )}
              </h3>
              <p className="text-sm text-gray-600">{component.type}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRequestClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="content" className="flex-1">
              Content
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex-1">
              Layout
            </TabsTrigger>
            <TabsTrigger value="style" className="flex-1">
              Style
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent
            value="content"
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-opacity duration-200 ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
          >
            {/* Header Component Fields */}
            {component.type === "header" && (
              <>
                {/* Logo Configuration */}
                <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                  <Label className="text-sm font-semibold">Logo</Label>
                  <div className="space-y-2">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={(config.logo as { type?: string } | undefined)?.type || "text"}
                      onValueChange={(value) => handleChange("logo.type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Logo</SelectItem>
                        <SelectItem value="image">Image Logo</SelectItem>
                      </SelectContent>
                    </Select>

                    {(config.logo as { type?: string } | undefined)?.type === "text" && (
                      <div className="space-y-2">
                        <Label className="text-xs">Logo Text</Label>
                        <Input
                          value={(config.logo as { text?: string } | undefined)?.text || ""}
                          onChange={(e) => handleChange("logo.text", e.target.value)}
                          placeholder="Your Brand"
                        />
                      </div>
                    )}

                    {(config.logo as { type?: string } | undefined)?.type === "image" && (
                      <ImageUpload
                        label="Logo Image"
                        value={(config.logo as { image?: string } | undefined)?.image || ""}
                        onChange={(url) => handleChange("logo.image", url)}
                        showDefaultLogos={true}
                        description="Choose a default logo or upload your own"
                      />
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs">Logo Link</Label>
                      <Input
                        value={(config.logo as { link?: string } | undefined)?.link || "/"}
                        onChange={(e) => handleChange("logo.link", e.target.value)}
                        placeholder="/"
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                {config.tabs && Array.isArray(config.tabs) && (
                  <HeaderTabsEditor
                    tabs={config.tabs as HeaderConfig["tabs"]}
                    onChange={(tabs) => handleChange("tabs", tabs)}
                    allComponents={allComponents}
                    subPages={subPages}
                    pageSlug={pageSlug}
                    isMultiPage={isMultiPage}
                  />
                )}

                {/* CTA Button */}
                <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">CTA Button (Optional)</Label>
                    {config.ctaButton ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleChange("ctaButton", undefined)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleChange("ctaButton", {
                            text: "Get Started",
                            link: "#",
                            style: "primary",
                          })
                        }
                      >
                        Add CTA
                      </Button>
                    )}
                  </div>

                  {!!config.ctaButton && (
                    <div className="space-y-2">
                      <Input
                        value={(config.ctaButton as { text?: string } | undefined)?.text || ""}
                        onChange={(e) => handleChange("ctaButton.text", e.target.value)}
                        placeholder="Button text"
                      />
                      <LinkSelector
                        value={(config.ctaButton as { link?: string } | undefined)?.link || ""}
                        onChange={(value) => handleChange("ctaButton.link", value)}
                        label="Button Link"
                        placeholder="e.g., #pricing or /slug/page"
                        components={allComponents}
                        subPages={subPages}
                        pageSlug={pageSlug}
                      />
                      <div className="space-y-2">
                        <Label className="text-xs">Button Style</Label>
                        <Select
                          value={
                            (config.ctaButton as { style?: string } | undefined)?.style || "primary"
                          }
                          onValueChange={(value) => handleChange("ctaButton.style", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Common fields for most components */}
            {"title" in config && component.type !== "header" && (
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={config.title as string}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter title"
                />
              </div>
            )}

            {"subtitle" in config && (
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={(config.subtitle as string) || ""}
                  onChange={(e) => handleChange("subtitle", e.target.value)}
                  placeholder="Enter subtitle"
                />
              </div>
            )}

            {"description" in config && (
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={(config.description as string) || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter description"
                />
              </div>
            )}

            {"image" in config && (
              <ImageUpload
                label="Image"
                value={(config.image as string) || ""}
                onChange={(url) => handleChange("image", url)}
              />
            )}

            {"primaryCTA" in config && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">Primary CTA</Label>
                <div className="space-y-2">
                  <Input
                    value={(config.primaryCTA as { text?: string })?.text || ""}
                    onChange={(e) => handleChange("primaryCTA.text", e.target.value)}
                    placeholder="Button text"
                  />
                  <LinkSelector
                    value={(config.primaryCTA as { link?: string })?.link || ""}
                    onChange={(value) => handleChange("primaryCTA.link", value)}
                    label="Button Link"
                    placeholder="e.g., #pricing or /slug/page"
                    components={allComponents}
                    subPages={subPages}
                    pageSlug={pageSlug}
                  />
                </div>
              </div>
            )}

            {"secondaryCTA" in config && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">Secondary CTA</Label>
                <div className="space-y-2">
                  <Input
                    value={(config.secondaryCTA as { text?: string })?.text || ""}
                    onChange={(e) => handleChange("secondaryCTA.text", e.target.value)}
                    placeholder="Button text"
                  />
                  <LinkSelector
                    value={(config.secondaryCTA as { link?: string })?.link || ""}
                    onChange={(value) => handleChange("secondaryCTA.link", value)}
                    label="Button Link"
                    placeholder="e.g., #contact or /slug/page"
                    components={allComponents}
                    subPages={subPages}
                    pageSlug={pageSlug}
                  />
                </div>
              </div>
            )}

            {component.type === "content" && "cta" in config && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">CTA Button</Label>
                <div className="space-y-2">
                  <Input
                    value={(config.cta as { text?: string })?.text || ""}
                    onChange={(e) => handleChange("cta.text", e.target.value)}
                    placeholder="Button text"
                  />
                  <LinkSelector
                    value={(config.cta as { link?: string })?.link || ""}
                    onChange={(value) => handleChange("cta.link", value)}
                    label="Button Link"
                    placeholder="e.g., #contact or /slug/page"
                    components={allComponents}
                    subPages={subPages}
                    pageSlug={pageSlug}
                  />
                </div>
              </div>
            )}

            {component.type === "features" &&
              "features" in config &&
              Array.isArray(config.features) && (
                <div className="space-y-2">
                  <FeaturesArrayEditor
                    features={
                      config.features as Array<{
                        id: string;
                        icon?: string;
                        title: string;
                        description: string;
                        image?: string;
                      }>
                    }
                    onChange={(features) => handleChange("features", features)}
                  />
                </div>
              )}

            {"logos" in config && Array.isArray(config.logos) && (
              <div className="space-y-2">
                <LogoArrayEditor
                  logos={
                    config.logos as Array<{
                      name: string;
                      url: string;
                      link?: string;
                    }>
                  }
                  onChange={(logos) => handleChange("logos", logos)}
                />
              </div>
            )}

            {"plans" in config && Array.isArray(config.plans) && (
              <div className="space-y-2">
                <PricingArrayEditor
                  plans={
                    config.plans as Array<{
                      id: string;
                      name: string;
                      price: string;
                      period: string;
                      description: string;
                      features: string[];
                      cta: { text: string; link: string };
                      highlighted: boolean;
                      badge?: string;
                    }>
                  }
                  onChange={(plans) => handleChange("plans", plans)}
                  allComponents={allComponents}
                  subPages={subPages}
                  pageSlug={pageSlug}
                />
              </div>
            )}

            {"testimonials" in config && Array.isArray(config.testimonials) && (
              <div className="space-y-2">
                <TestimonialsArrayEditor
                  testimonials={
                    config.testimonials as Array<{
                      id: string;
                      content: string;
                      author: string;
                      role: string;
                      company: string;
                      rating: number;
                      avatar?: string;
                    }>
                  }
                  onChange={(testimonials) => handleChange("testimonials", testimonials)}
                />
              </div>
            )}

            {"stats" in config && Array.isArray(config.stats) && (
              <div className="space-y-2">
                <StatsArrayEditor
                  stats={
                    config.stats as Array<{
                      id: string;
                      value: string;
                      label: string;
                      suffix?: string;
                      prefix?: string;
                    }>
                  }
                  onChange={(stats) => handleChange("stats", stats)}
                />
              </div>
            )}

            {"faqs" in config && Array.isArray(config.faqs) && (
              <div className="space-y-2">
                <FAQArrayEditor
                  faqs={
                    config.faqs as Array<{
                      id: string;
                      question: string;
                      answer: string;
                    }>
                  }
                  onChange={(faqs) => handleChange("faqs", faqs)}
                />
              </div>
            )}

            {component.type === "footer" && (
              <div className="space-y-2">
                <FooterLinksEditor
                  footerConfig={{
                    logo: (config as { logo?: { text: string; image: string } }).logo || {
                      text: "",
                      image: "",
                    },
                    description: (config as { description?: string }).description || "",
                    links:
                      (
                        config as {
                          links?: Array<{
                            title: string;
                            items: Array<{ text: string; link: string }>;
                          }>;
                        }
                      ).links || [],
                    social:
                      (
                        config as {
                          social?: Array<{
                            platform: string;
                            link: string;
                            icon: string;
                          }>;
                        }
                      ).social || [],
                    copyright: (config as { copyright?: string }).copyright || "",
                  }}
                  allComponents={allComponents}
                  subPages={subPages}
                  pageSlug={pageSlug}
                  onChange={(updatedFooterConfig) => {
                    // Merge footer content with existing or default background/spacing
                    setConfig({
                      ...config,
                      ...updatedFooterConfig,
                      // Preserve or set default background and spacing
                      background: (config as { background?: unknown }).background || {
                        type: "solid",
                        color: "#0f172a",
                      },
                      spacing: (config as { spacing?: unknown }).spacing || {
                        padding: "xl",
                        margin: "none",
                      },
                    } as never);
                  }}
                />
              </div>
            )}

            {/* Video Component Fields */}
            {component.type === "video" && (
              <>
                <div className="space-y-2">
                  <Label>Video Type</Label>
                  <Select
                    value={(config.videoType as string) || "youtube"}
                    onValueChange={(value) => handleChange("videoType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="direct">Direct URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={(config.videoUrl as string) || ""}
                    onChange={(e) => handleChange("videoUrl", e.target.value)}
                    placeholder="Enter video URL"
                  />
                  <p className="text-xs text-gray-500">
                    {(config.videoType as string) === "youtube"
                      ? "Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      : (config.videoType as string) === "vimeo"
                        ? "Ví dụ: https://vimeo.com/123456789"
                        : "Ví dụ: https://example.com/video.mp4"}
                  </p>
                </div>

                <ImageUpload
                  label="Video Thumbnail (Optional)"
                  value={(config.thumbnail as string) || ""}
                  onChange={(url) => handleChange("thumbnail", url)}
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoPlay"
                      checked={(config.autoPlay as boolean) || false}
                      onChange={(e) => handleChange("autoPlay", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="autoPlay" className="cursor-pointer">
                      Auto Play Video
                    </Label>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent
            value="layout"
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-opacity duration-200 ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
          >
            {/* Header Position */}
            {component.type === "header" && (
              <>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={(config.position as string) || "sticky"}
                    onValueChange={(value) => handleChange("position", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="sticky">Sticky</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="transparent"
                      checked={(config.transparent as boolean) || false}
                      onChange={(e) => handleChange("transparent", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="transparent" className="cursor-pointer">
                      Transparent on Scroll Top
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Header will be transparent when at the top of the page
                  </p>
                </div>
              </>
            )}

            {/* Alignment - for hero, cta, content, testimonials, etc. */}
            {(component.type === "hero" ||
              component.type === "cta" ||
              component.type === "content" ||
              component.type === "testimonials" ||
              component.type === "newsletter") && (
              <div className="space-y-2">
                <Label>Text Alignment</Label>
                <Select
                  value={(config.alignment as string) || "center"}
                  onValueChange={(value) => handleChange("alignment", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Columns - for features, stats, testimonials, gallery, team */}
            {(component.type === "features" ||
              component.type === "stats" ||
              component.type === "testimonials" ||
              component.type === "gallery" ||
              component.type === "team" ||
              component.type === "faq") && (
              <div className="space-y-2">
                <Label>Columns</Label>
                <Select
                  value={String((config.columns as number) || 3)}
                  onValueChange={(value) => handleChange("columns", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {component.type === "faq" && <SelectItem value="1">1 Column</SelectItem>}
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                    <SelectItem value="4">4 Columns</SelectItem>
                    {(component.type === "gallery" || component.type === "team") && (
                      <>
                        <SelectItem value="5">5 Columns</SelectItem>
                        <SelectItem value="6">6 Columns</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Layout type - for stats, testimonials, pricing */}
            {(component.type === "stats" ||
              component.type === "testimonials" ||
              component.type === "pricing" ||
              component.type === "features") && (
              <div className="space-y-2">
                <Label>Layout Style</Label>
                <Select
                  value={
                    (config.layout as string) ||
                    ((config as { layout?: { type?: string } }).layout?.type as string) ||
                    "grid"
                  }
                  onValueChange={(value) => {
                    // Handle both flat layout and nested layout.type
                    if ("layout" in config && typeof config.layout === "object") {
                      handleChange("layout.type", value);
                    } else {
                      handleChange("layout", value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    {component.type === "features" && <SelectItem value="list">List</SelectItem>}
                    {component.type === "stats" && (
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                    )}
                    {(component.type === "testimonials" ||
                      component.type === "pricing" ||
                      component.type === "features") && (
                      <SelectItem value="carousel">Carousel</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Image Position - for content sections */}
            {component.type === "content" && (
              <div className="space-y-2">
                <Label>Image Position</Label>
                <Select
                  value={(config.imagePosition as string) || "right"}
                  onValueChange={(value) => handleChange("imagePosition", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contact Form Layout */}
            {component.type === "contact" && (
              <div className="space-y-2">
                <Label>Form Layout</Label>
                <Select
                  value={(config.layout as string) || "centered"}
                  onValueChange={(value) => handleChange("layout", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centered">Centered</SelectItem>
                    <SelectItem value="split">Split with Info</SelectItem>
                    <SelectItem value="wide">Wide Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Logo Cloud specific layout options */}
            {component.type === "logo-cloud" && (
              <>
                <div className="space-y-2">
                  <Label>Display Layout</Label>
                  <Select
                    value={(config.layout as string) || "grid"}
                    onValueChange={(value) => handleChange("layout", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="scroll">Scrolling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Logo Size</Label>
                  <Select
                    value={String((config as { logoSize?: string }).logoSize || "medium")}
                    onValueChange={(value) => handleChange("logoSize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Logo Spacing</Label>
                  <Select
                    value={String((config as { logoSpacing?: string }).logoSpacing || "normal")}
                    onValueChange={(value) => handleChange("logoSpacing", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Columns (Desktop)</Label>
                  <Select
                    value={String((config as { gridColumns?: number }).gridColumns || 6)}
                    onValueChange={(value) => handleChange("gridColumns", Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                      <SelectItem value="5">5 Columns</SelectItem>
                      <SelectItem value="6">6 Columns</SelectItem>
                      <SelectItem value="8">8 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Gallery specific options */}
            {component.type === "gallery" && (
              <div className="space-y-2">
                <Label>Image Aspect Ratio</Label>
                <Select
                  value={(config.aspectRatio as string) || "landscape"}
                  onValueChange={(value) => handleChange("aspectRatio", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                    <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                    <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                    <SelectItem value="auto">Auto (original size)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Video Aspect Ratio */}
            {component.type === "video" && (
              <div className="space-y-2">
                <Label>Video Aspect Ratio</Label>
                <Select
                  value={(config.aspectRatio as string) || "16:9"}
                  onValueChange={(value) => handleChange("aspectRatio", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Spacing - Available for all components */}
            <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
              <Label className="text-sm font-semibold">Section Spacing</Label>

              <div className="space-y-2">
                <Label className="text-xs">Padding (Vertical)</Label>
                <Select
                  value={
                    (config.spacing as { padding?: string })?.padding ||
                    ((config as { spacing?: string }).spacing as string) ||
                    "xl"
                  }
                  onValueChange={(value) => {
                    if (config.spacing && typeof config.spacing === "object") {
                      handleChange("spacing.padding", value);
                    } else {
                      handleChange("spacing", { padding: value, margin: "none" });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (0)</SelectItem>
                    <SelectItem value="sm">Small (2rem)</SelectItem>
                    <SelectItem value="md">Medium (3rem)</SelectItem>
                    <SelectItem value="lg">Large (4rem)</SelectItem>
                    <SelectItem value="xl">Extra Large (5rem)</SelectItem>
                    <SelectItem value="2xl">2X Large (6rem)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Margin (Vertical)</Label>
                <Select
                  value={(config.spacing as { margin?: string })?.margin || "none"}
                  onValueChange={(value) => {
                    if (config.spacing && typeof config.spacing === "object") {
                      handleChange("spacing.margin", value);
                    } else {
                      handleChange("spacing", { padding: "xl", margin: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Container Width */}
            <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
              <Label className="text-sm font-semibold">Container Width</Label>

              <div className="space-y-2">
                <Label className="text-xs">Max Width</Label>
                <Select
                  value={(config.containerWidth as string) || "default"}
                  onValueChange={(value) => handleChange("containerWidth", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small - 448px</SelectItem>
                    <SelectItem value="sm">Small - 512px</SelectItem>
                    <SelectItem value="md">Medium - 672px</SelectItem>
                    <SelectItem value="narrow">Narrow - 768px</SelectItem>
                    <SelectItem value="lg">Large - 896px</SelectItem>
                    <SelectItem value="default">Default - 1280px</SelectItem>
                    <SelectItem value="wide">Wide - 1536px</SelectItem>
                    <SelectItem value="xl">Extra Wide - 1600px</SelectItem>
                    <SelectItem value="2xl">Ultra Wide - 1800px</SelectItem>
                    <SelectItem value="full">Full Width (with padding)</SelectItem>
                    <SelectItem value="fullscreen">Fullscreen (no padding)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Controls the maximum width of the content container
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent
            value="style"
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-opacity duration-200 ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
          >
            {/* Background */}
            {"background" in config && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">Background</Label>

                <div className="space-y-2">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={(config.background as { type?: string })?.type || "solid"}
                    onValueChange={(value) => handleChange("background.type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(config.background as { type?: string })?.type === "solid" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Background Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={(config.background as { color?: string })?.color || "#ffffff"}
                        onChange={(e) => handleChange("background.color", e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={(config.background as { color?: string })?.color || "#ffffff"}
                        onChange={(e) => handleChange("background.color", e.target.value)}
                        className="flex-1"
                        placeholder="#ffffff or color name"
                      />
                    </div>
                    {/* Color Preview */}
                    <div
                      className="w-full h-12 rounded border border-gray-300"
                      style={{
                        backgroundColor:
                          (config.background as { color?: string })?.color || "#ffffff",
                      }}
                    />
                  </div>
                )}

                {(config.background as { type?: string })?.type === "gradient" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">From Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={
                            (config.background as { gradient?: { from?: string } })?.gradient
                              ?.from || "#3b82f6"
                          }
                          onChange={(e) => handleChange("background.gradient.from", e.target.value)}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={
                            (config.background as { gradient?: { from?: string } })?.gradient
                              ?.from || "#3b82f6"
                          }
                          onChange={(e) => handleChange("background.gradient.from", e.target.value)}
                          className="flex-1"
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">To Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={
                            (config.background as { gradient?: { to?: string } })?.gradient?.to ||
                            "#8b5cf6"
                          }
                          onChange={(e) => handleChange("background.gradient.to", e.target.value)}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={
                            (config.background as { gradient?: { to?: string } })?.gradient?.to ||
                            "#8b5cf6"
                          }
                          onChange={(e) => handleChange("background.gradient.to", e.target.value)}
                          className="flex-1"
                          placeholder="#8b5cf6"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Direction</Label>
                      <Select
                        value={
                          (config.background as { gradient?: { direction?: string } })?.gradient
                            ?.direction || "to-br"
                        }
                        onValueChange={(value) =>
                          handleChange("background.gradient.direction", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="to-r">→ To Right</SelectItem>
                          <SelectItem value="to-l">← To Left</SelectItem>
                          <SelectItem value="to-t">↑ To Top</SelectItem>
                          <SelectItem value="to-b">↓ To Bottom</SelectItem>
                          <SelectItem value="to-br">↘ To Bottom Right</SelectItem>
                          <SelectItem value="to-bl">↙ To Bottom Left</SelectItem>
                          <SelectItem value="to-tr">↗ To Top Right</SelectItem>
                          <SelectItem value="to-tl">↖ To Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Gradient Preview */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Preview</Label>
                      <div
                        className="w-full h-16 rounded border border-gray-300"
                        style={{
                          background: `linear-gradient(${
                            (config.background as { gradient?: { direction?: string } })?.gradient
                              ?.direction || "to-br"
                          }, ${
                            (config.background as { gradient?: { from?: string } })?.gradient
                              ?.from || "#3b82f6"
                          }, ${
                            (config.background as { gradient?: { to?: string } })?.gradient?.to ||
                            "#8b5cf6"
                          })`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {(config.background as { type?: string })?.type === "image" && (
                  <div className="space-y-3">
                    <ImageUpload
                      label="Background Image"
                      value={(config.background as { image?: { url?: string } })?.image?.url || ""}
                      onChange={(url) => handleChange("background.image.url", url)}
                    />

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Overlay Color (Optional)</Label>

                      <div className="space-y-3">
                        {/* Color Picker with Opacity Slider */}
                        <div className="flex gap-3 items-start">
                          {/* Color Input */}
                          <div className="flex-1">
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={(() => {
                                  const overlay =
                                    (config.background as { image?: { overlay?: string } })?.image
                                      ?.overlay || "";
                                  // Extract hex color from rgba or use default
                                  if (overlay.startsWith("rgba")) {
                                    const match = overlay.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                                    if (match) {
                                      const r = parseInt(match[1]).toString(16).padStart(2, "0");
                                      const g = parseInt(match[2]).toString(16).padStart(2, "0");
                                      const b = parseInt(match[3]).toString(16).padStart(2, "0");
                                      return `#${r}${g}${b}`;
                                    }
                                  }
                                  return overlay || "#000000";
                                })()}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  const r = parseInt(hex.slice(1, 3), 16);
                                  const g = parseInt(hex.slice(3, 5), 16);
                                  const b = parseInt(hex.slice(5, 7), 16);
                                  const currentOverlay =
                                    (config.background as { image?: { overlay?: string } })?.image
                                      ?.overlay || "";
                                  // Preserve opacity if exists
                                  const opacityMatch = currentOverlay.match(/[\d.]+\)$/);
                                  const opacity = opacityMatch
                                    ? parseFloat(opacityMatch[0].replace(")", ""))
                                    : 0.5;
                                  handleChange(
                                    "background.image.overlay",
                                    `rgba(${r},${g},${b},${opacity})`
                                  );
                                }}
                                className="w-20 h-10 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={
                                  (config.background as { image?: { overlay?: string } })?.image
                                    ?.overlay || ""
                                }
                                onChange={(e) =>
                                  handleChange("background.image.overlay", e.target.value)
                                }
                                placeholder="rgba(0,0,0,0.5)"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          {/* Clear Button */}
                          {(config.background as { image?: { overlay?: string } })?.image
                            ?.overlay && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleChange("background.image.overlay", "")}
                              className="h-10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Opacity Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-gray-600">Độ mờ (Opacity)</Label>
                            <span className="text-xs font-mono text-gray-500">
                              {(() => {
                                const overlay =
                                  (config.background as { image?: { overlay?: string } })?.image
                                    ?.overlay || "";
                                const opacityMatch = overlay.match(/[\d.]+\)$/);
                                const opacity = opacityMatch
                                  ? parseFloat(opacityMatch[0].replace(")", ""))
                                  : 0.5;
                                return Math.round(opacity * 100) + "%";
                              })()}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(() => {
                              const overlay =
                                (config.background as { image?: { overlay?: string } })?.image
                                  ?.overlay || "";
                              const opacityMatch = overlay.match(/[\d.]+\)$/);
                              const opacity = opacityMatch
                                ? parseFloat(opacityMatch[0].replace(")", ""))
                                : 0.5;
                              return opacity * 100;
                            })()}
                            onChange={(e) => {
                              const opacity = parseInt(e.target.value) / 100;
                              const currentOverlay =
                                (config.background as { image?: { overlay?: string } })?.image
                                  ?.overlay || "";

                              if (currentOverlay.startsWith("rgba")) {
                                // Update existing rgba
                                const newOverlay = currentOverlay.replace(
                                  /[\d.]+\)$/,
                                  `${opacity})`
                                );
                                handleChange("background.image.overlay", newOverlay);
                              } else {
                                // Create new rgba from black
                                handleChange("background.image.overlay", `rgba(0,0,0,${opacity})`);
                              }
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600">Quick Presets</Label>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleChange("background.image.overlay", "rgba(0,0,0,0.5)")
                              }
                              className="text-xs"
                            >
                              Dark 50%
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleChange("background.image.overlay", "rgba(0,0,0,0.3)")
                              }
                              className="text-xs"
                            >
                              Dark 30%
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleChange("background.image.overlay", "rgba(255,255,255,0.5)")
                              }
                              className="text-xs"
                            >
                              Light 50%
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleChange("background.image.overlay", "rgba(59,130,246,0.4)")
                              }
                              className="text-xs"
                            >
                              Blue 40%
                            </Button>
                          </div>
                        </div>

                        {/* Preview */}
                        {(config.background as { image?: { overlay?: string } })?.image
                          ?.overlay && (
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Preview</Label>
                            <div
                              className="w-full h-16 rounded-lg border-2 border-gray-300 relative overflow-hidden"
                              style={{
                                backgroundImage:
                                  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                                backgroundSize: "20px 20px",
                                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                              }}
                            >
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundColor:
                                    (config.background as { image?: { overlay?: string } })?.image
                                      ?.overlay || "transparent",
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-gray-500">
                          💡 Chọn màu và điều chỉnh độ mờ, hoặc nhập trực tiếp rgba(r,g,b,a)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Position</Label>
                      <Select
                        value={
                          (config.background as { image?: { position?: string } })?.image
                            ?.position || "center"
                        }
                        onValueChange={(value) => handleChange("background.image.position", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                          <SelectItem value="top left">Top Left</SelectItem>
                          <SelectItem value="top right">Top Right</SelectItem>
                          <SelectItem value="bottom left">Bottom Left</SelectItem>
                          <SelectItem value="bottom right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Size</Label>
                      <Select
                        value={
                          (config.background as { image?: { size?: string } })?.image?.size ||
                          "cover"
                        }
                        onValueChange={(value) => handleChange("background.image.size", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cover (Phủ kín)</SelectItem>
                          <SelectItem value="contain">Contain (Vừa khung)</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Logo Cloud specific style options */}
            {component.type === "logo-cloud" && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">Logo Style</Label>

                <div className="space-y-2">
                  <Label className="text-xs">Color Mode</Label>
                  <Select
                    value={String((config as { grayscale?: boolean }).grayscale ?? true)}
                    onValueChange={(value) => handleChange("grayscale", value === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Grayscale (hover to show color)</SelectItem>
                      <SelectItem value="false">Full Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Hover Effect</Label>
                  <Select
                    value={(config as { hoverEffect?: string }).hoverEffect || "scale"}
                    onValueChange={(value) => handleChange("hoverEffect", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="scale">Scale Up</SelectItem>
                      <SelectItem value="lift">Lift (Shadow)</SelectItem>
                      <SelectItem value="glow">Glow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Logo Opacity</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(config as { logoOpacity?: number }).logoOpacity || 70}
                      onChange={(e) => handleChange("logoOpacity", Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-right">
                      {(config as { logoOpacity?: number }).logoOpacity || 70}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Logo Background</Label>
                  <Select
                    value={(config as { logoBg?: string }).logoBg || "none"}
                    onValueChange={(value) => handleChange("logoBg", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="light">Light Gray</SelectItem>
                      <SelectItem value="bordered">Bordered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Animation */}
            {"animation" in config && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">Animation</Label>

                <div className="space-y-2">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={(config.animation as { type?: string })?.type || "fadeInUp"}
                    onValueChange={(value) => handleChange("animation.type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fadeIn">Fade In</SelectItem>
                      <SelectItem value="fadeInUp">Fade In Up</SelectItem>
                      <SelectItem value="fadeInDown">Fade In Down</SelectItem>
                      <SelectItem value="slideInLeft">Slide In Left</SelectItem>
                      <SelectItem value="slideInRight">Slide In Right</SelectItem>
                      <SelectItem value="zoomIn">Zoom In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Duration (ms)</Label>
                  <Input
                    type="number"
                    value={(config.animation as { duration?: number })?.duration || 600}
                    onChange={(e) => handleChange("animation.duration", Number(e.target.value))}
                    min={0}
                    max={2000}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Delay (ms)</Label>
                  <Input
                    type="number"
                    value={(config.animation as { delay?: number })?.delay || 0}
                    onChange={(e) => handleChange("animation.delay", Number(e.target.value))}
                    min={0}
                    max={2000}
                    step={100}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer with Save Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
          <Button variant="outline" onClick={handleRequestClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscardOpen}
        onOpenChange={setConfirmDiscardOpen}
        title="Discard unsaved changes?"
        description="You have unsaved changes to this component. Closing now will discard them."
        confirmText="Discard"
        variant="destructive"
        onConfirm={onClose}
      />
    </>
  );
}
