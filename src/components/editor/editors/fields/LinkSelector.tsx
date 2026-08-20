"use client";

import { ComponentConfig, SubPage } from "@/types/landing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LinkSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  components?: ComponentConfig[]; // Available components for hash links
  subPages?: SubPage[]; // Available subpages for navigation
  pageSlug?: string; // Current page's own slug, used to build subpage URLs
}

/**
 * LinkSelector - Dropdown + Text input for selecting links
 * Supports:
 * - Hash links to sections (#component-id)
 * - Page links to subpages (/slug/subpage)
 * - Custom URLs
 */
export function LinkSelector({
  value,
  onChange,
  label,
  placeholder = "Enter link",
  components = [],
  subPages = [],
  pageSlug,
}: LinkSelectorProps) {
  // Generate available link options
  const linkOptions: Array<{ value: string; label: string; group: string }> = [];

  // Add hash links for components (excluding header and footer)
  components
    .filter((c) => c.type !== "header" && c.type !== "footer" && c.visible)
    .forEach((comp) => {
      const typeNames: Record<string, string> = {
        hero: "Home",
        features: "Features",
        pricing: "Pricing",
        testimonials: "Testimonials",
        cta: "Call to Action",
        stats: "Stats",
        team: "Team",
        faq: "FAQ",
        gallery: "Gallery",
        "logo-cloud": "Partners",
        contact: "Contact",
        content: "About",
        newsletter: "Newsletter",
        video: "Video",
      };

      const displayName = typeNames[comp.type] || comp.type;
      linkOptions.push({
        value: `#${comp.id}`,
        label: `${displayName} (scroll to section)`,
        group: "Sections",
      });
    });

  // Add subpage links — every page is equal, so sub-pages always live under
  // their own parent page's slug (/pageSlug/subSlug), uniformly.
  if (subPages.length > 0) {
    subPages
      .filter((sp) => sp.visible)
      .forEach((sp) => {
        linkOptions.push({
          value: `/${pageSlug}/${sp.slug}`,
          label: `${sp.title} (navigate to page)`,
          group: "Pages",
        });
      });
  }

  // Check if current value matches any option
  const hasMatchingOption = linkOptions.some((opt) => opt.value === value);

  // Group options by group
  const groupedOptions = linkOptions.reduce(
    (acc, opt) => {
      if (!acc[opt.group]) acc[opt.group] = [];
      acc[opt.group].push(opt);
      return acc;
    },
    {} as Record<string, typeof linkOptions>
  );

  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>

      {/* Quick select dropdown */}
      {linkOptions.length > 0 && (
        <Select value={hasMatchingOption ? value : "custom"} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a link" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedOptions).map(([group, options]) => (
              <div key={group}>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{group}</div>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </div>
            ))}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Custom</div>
            <SelectItem value="custom">Custom URL...</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Text input for custom URLs */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-sm"
      />
      <p className="text-xs text-gray-500">
        Use #section-id for scroll, /slug/page for navigation, or enter custom URL
      </p>
    </div>
  );
}
