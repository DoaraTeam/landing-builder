"use client";

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
import { ImageUpload } from "@/components/editor/editors/fields/ImageUpload";
import { HeaderTabsEditor } from "@/components/editor/editors/arrays/HeaderTabsEditor";
import { CTAFieldEditor } from "@/components/editor/editors/fields/CTAFieldEditor";
import { ComponentConfig, HeaderConfig, SubPage } from "@/types/landing";

interface HeaderContentFieldsProps {
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  allComponents?: ComponentConfig[];
  subPages?: SubPage[];
  pageSlug?: string;
}

/** The `header` type's Content-tab fields (logo, nav tabs, CTA button) —
 * extracted verbatim from ComponentEditor.tsx. */
export function HeaderContentFields({
  config,
  onChange,
  allComponents,
  subPages,
  pageSlug,
}: HeaderContentFieldsProps) {
  return (
    <>
      {/* Logo Configuration */}
      <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
        <Label className="text-sm font-semibold">Logo</Label>
        <div className="space-y-2">
          <Label className="text-xs">Type</Label>
          <Select
            value={(config.logo as { type?: string } | undefined)?.type || "text"}
            onValueChange={(value) => onChange("logo.type", value)}
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
                onChange={(e) => onChange("logo.text", e.target.value)}
                placeholder="Your Brand"
              />
            </div>
          )}

          {(config.logo as { type?: string } | undefined)?.type === "image" && (
            <ImageUpload
              label="Logo Image"
              value={(config.logo as { image?: string } | undefined)?.image || ""}
              onChange={(url) => onChange("logo.image", url)}
              showDefaultLogos={true}
              description="Choose a default logo or upload your own"
            />
          )}

          <div className="space-y-2">
            <Label className="text-xs">Logo Link</Label>
            <Input
              value={(config.logo as { link?: string } | undefined)?.link || "/"}
              onChange={(e) => onChange("logo.link", e.target.value)}
              placeholder="/"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {config.tabs && Array.isArray(config.tabs) && (
        <HeaderTabsEditor
          tabs={config.tabs as HeaderConfig["tabs"]}
          onChange={(tabs) => onChange("tabs", tabs)}
          allComponents={allComponents}
          subPages={subPages}
          pageSlug={pageSlug}
        />
      )}

      {/* CTA Button */}
      <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">CTA Button (Optional)</Label>
          {config.ctaButton ? (
            <Button size="sm" variant="ghost" onClick={() => onChange("ctaButton", undefined)}>
              Remove
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onChange("ctaButton", { text: "Get Started", link: "#", style: "primary" })
              }
            >
              Add CTA
            </Button>
          )}
        </div>

        {!!config.ctaButton && (
          <CTAFieldEditor
            value={config.ctaButton as { text?: string; link?: string; style?: string }}
            onChange={(field, value) => onChange(`ctaButton.${field}`, value)}
            linkPlaceholder="e.g., #pricing or /slug/page"
            allComponents={allComponents}
            subPages={subPages}
            pageSlug={pageSlug}
            showStyleSelect
          />
        )}
      </div>
    </>
  );
}
