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
import { LinkSelector } from "@/components/editor/editors/fields/LinkSelector";
import { ComponentConfig, SubPage } from "@/types/landing";

interface CTAValue {
  text?: string;
  link?: string;
  style?: string;
}

interface CTAFieldEditorProps {
  value: CTAValue | undefined;
  // Relative to this CTA's own path (e.g. "text", "link", "style") — the
  // caller prefixes it back to the full config path.
  onChange: (field: "text" | "link" | "style", value: string) => void;
  linkPlaceholder: string;
  linkLabel?: string;
  allComponents?: ComponentConfig[];
  subPages?: SubPage[];
  pageSlug?: string;
  // Only the header's ctaButton exposes a style choice today.
  showStyleSelect?: boolean;
}

/**
 * The text+link(+style) fields shared by every CTA in ComponentEditor.tsx
 * (header's ctaButton, primaryCTA, secondaryCTA, content's cta) — previously
 * copy-pasted at each call site. Deliberately doesn't own the surrounding
 * card/label chrome, since that varies (header's has an add/remove toggle,
 * the others don't) — callers wrap this in whatever shell they need.
 */
export function CTAFieldEditor({
  value,
  onChange,
  linkPlaceholder,
  linkLabel = "Button Link",
  allComponents,
  subPages,
  pageSlug,
  showStyleSelect,
}: CTAFieldEditorProps) {
  return (
    <div className="space-y-2">
      <Input
        value={value?.text || ""}
        onChange={(e) => onChange("text", e.target.value)}
        placeholder="Button text"
      />
      <LinkSelector
        value={value?.link || ""}
        onChange={(v) => onChange("link", v)}
        label={linkLabel}
        placeholder={linkPlaceholder}
        components={allComponents}
        subPages={subPages}
        pageSlug={pageSlug}
      />
      {showStyleSelect && (
        <div className="space-y-2">
          <Label className="text-xs">Button Style</Label>
          <Select value={value?.style || "primary"} onValueChange={(v) => onChange("style", v)}>
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
      )}
    </div>
  );
}
