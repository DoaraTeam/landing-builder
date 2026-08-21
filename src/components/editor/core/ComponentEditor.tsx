"use client";

import { useEffect, useMemo, useState } from "react";
import { ComponentConfig } from "@/types/landing";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { FeaturesArrayEditor } from "@/components/editor/editors/arrays/FeaturesArrayEditor";
import { PricingArrayEditor } from "@/components/editor/editors/arrays/PricingArrayEditor";
import { TestimonialsArrayEditor } from "@/components/editor/editors/arrays/TestimonialsArrayEditor";
import { FooterLinksEditor } from "@/components/editor/editors/arrays/FooterLinksEditor";
import { LogoArrayEditor } from "@/components/editor/editors/arrays/LogoArrayEditor";
import { StatsArrayEditor } from "@/components/editor/editors/arrays/StatsArrayEditor";
import { FAQArrayEditor } from "@/components/editor/editors/arrays/FAQArrayEditor";
import { CTAFieldEditor } from "@/components/editor/editors/fields/CTAFieldEditor";
import { BackgroundEditor } from "@/components/editor/editors/fields/BackgroundEditor";
import { SpacingEditor } from "@/components/editor/editors/fields/SpacingEditor";
import { ContainerWidthEditor } from "@/components/editor/editors/fields/ContainerWidthEditor";
import { AnimationEditor } from "@/components/editor/editors/fields/AnimationEditor";
import {
  LogoCloudLayoutFields,
  LogoCloudStyleFields,
} from "@/components/editor/editors/fields/LogoCloudFields";
import { HeaderContentFields } from "@/components/editor/editors/fields/component-types/HeaderContentFields";
import { VideoContentFields } from "@/components/editor/editors/fields/component-types/VideoContentFields";
import { CommonContentFields } from "@/components/editor/editors/fields/component-types/CommonContentFields";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";
import { ensureAnimation } from "@/lib/animation-defaults";
import { setNestedValue } from "@/lib/object-utils";
import { validateAnimationConfig } from "@/lib/field-validators";
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
  onDirtyChange,
}: ComponentEditorProps) {
  // Caches the last non-null component so the panel keeps showing its fields
  // while sliding closed, instead of blanking out the instant the parent
  // deselects. Cleared (unmounting the panel's content) shortly after the
  // close transition finishes.
  const [component, setComponent] = useState<ComponentConfig | null>(incomingComponent);
  const isOpen = incomingComponent !== null;

  // Whether local edits differ from the last-saved config, so closing the
  // panel can warn before silently discarding them. Tracked explicitly
  // (rather than derived via JSON.stringify(config) !== JSON.stringify(
  // component.config) on every render) since that comparison re-walks the
  // whole config — including untouched testimonial/feature arrays or
  // embedded base64 images — on every keystroke.
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (incomingComponent) {
      setComponent(incomingComponent);
    } else {
      const timer = setTimeout(() => {
        setComponent(null);
        setIsDirty(false);
      }, 300);
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
    setIsDirty(false);
    setActiveTab("content"); // Reset to content tab when switching components
    // Brief loading state to show component switch
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component?.id, component?.type, component?.config]);

  const handleChange = (path: string, value: unknown) => {
    setConfig((prev) => setNestedValue(prev, path.split("."), value));
    setIsDirty(true);
  };

  // Recomputed from `config` on every change (not just at Save) so a bad
  // value shows red the moment it's typed — not just guessed-at content
  // (empty strings, casual URLs) but values that would corrupt actual
  // runtime number math (NaN), which the user can't visually catch by
  // just previewing the page. See docs/editor-input-validation-plan.md.
  const animationErrors = useMemo(
    () => validateAnimationConfig(config.animation as { duration?: unknown; delay?: unknown }),
    [config.animation]
  );
  const hasBlockingErrors = Object.keys(animationErrors).length > 0;

  const handleSave = () => {
    if (!component || hasBlockingErrors) return;
    onUpdate({ ...component, config });
    setIsDirty(false);
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
          "fixed inset-0 z-[998] bg-black/30 transition-opacity duration-300",
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
              <HeaderContentFields
                config={config}
                onChange={handleChange}
                allComponents={allComponents}
                subPages={subPages}
                pageSlug={pageSlug}
              />
            )}

            {/* Common fields for most components */}
            <CommonContentFields
              config={config}
              componentType={component.type}
              onChange={handleChange}
            />

            {"primaryCTA" in config && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">Primary CTA</Label>
                <CTAFieldEditor
                  value={config.primaryCTA as { text?: string; link?: string }}
                  onChange={(field, value) => handleChange(`primaryCTA.${field}`, value)}
                  linkPlaceholder="e.g., #pricing or /slug/page"
                  allComponents={allComponents}
                  subPages={subPages}
                  pageSlug={pageSlug}
                />
              </div>
            )}

            {"secondaryCTA" in config && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">Secondary CTA</Label>
                <CTAFieldEditor
                  value={config.secondaryCTA as { text?: string; link?: string }}
                  onChange={(field, value) => handleChange(`secondaryCTA.${field}`, value)}
                  linkPlaceholder="e.g., #contact or /slug/page"
                  allComponents={allComponents}
                  subPages={subPages}
                  pageSlug={pageSlug}
                />
              </div>
            )}

            {component.type === "content" && "cta" in config && (
              <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
                <Label className="text-sm font-semibold">CTA Button</Label>
                <CTAFieldEditor
                  value={config.cta as { text?: string; link?: string }}
                  onChange={(field, value) => handleChange(`cta.${field}`, value)}
                  linkPlaceholder="e.g., #contact or /slug/page"
                  allComponents={allComponents}
                  subPages={subPages}
                  pageSlug={pageSlug}
                />
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
                    setIsDirty(true);
                  }}
                />
              </div>
            )}

            {/* Video Component Fields */}
            {component.type === "video" && (
              <VideoContentFields config={config} onChange={handleChange} />
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
              <LogoCloudLayoutFields config={config} onChange={handleChange} />
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
            <SpacingEditor
              value={config.spacing}
              onChange={(next) => handleChange("spacing", next)}
            />

            {/* Container Width */}
            <ContainerWidthEditor
              value={config.containerWidth as string | undefined}
              onChange={(value) => handleChange("containerWidth", value)}
            />
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
              <BackgroundEditor
                value={
                  config.background as {
                    type?: "solid" | "gradient" | "image";
                    color?: string;
                    gradient?: { from?: string; to?: string; direction?: string };
                    image?: { url?: string; overlay?: string; position?: string; size?: string };
                  }
                }
                onChange={(path, value) => handleChange(`background.${path}`, value)}
              />
            )}

            {/* Logo Cloud specific style options */}
            {component.type === "logo-cloud" && (
              <LogoCloudStyleFields config={config} onChange={handleChange} />
            )}

            {/* Animation */}
            {"animation" in config && (
              <AnimationEditor
                value={config.animation as { type?: string; duration?: number; delay?: number }}
                onChange={(field, value) => handleChange(`animation.${field}`, value)}
                errors={animationErrors}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Footer with Save Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
          <Button variant="outline" onClick={handleRequestClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={hasBlockingErrors} className="flex-1">
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
