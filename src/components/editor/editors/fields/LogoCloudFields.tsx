"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogoCloudConfig {
  layout?: string;
  logoSize?: string;
  logoSpacing?: string;
  gridColumns?: number;
  grayscale?: boolean;
  hoverEffect?: string;
  logoOpacity?: number;
  logoBg?: string;
}

interface LogoCloudFieldsProps {
  config: LogoCloudConfig;
  // Full config paths (e.g. "layout", "gridColumns") — same handleChange
  // used for every other field on this component, no relative prefix needed
  // since these are all root-level fields.
  onChange: (path: string, value: unknown) => void;
}

/** The `logo-cloud` type's Layout-tab fields — extracted verbatim from
 * ComponentEditor.tsx. */
export function LogoCloudLayoutFields({ config, onChange }: LogoCloudFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Display Layout</Label>
        <Select value={config.layout || "grid"} onValueChange={(v) => onChange("layout", v)}>
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
          value={String(config.logoSize || "medium")}
          onValueChange={(v) => onChange("logoSize", v)}
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
          value={String(config.logoSpacing || "normal")}
          onValueChange={(v) => onChange("logoSpacing", v)}
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
          value={String(config.gridColumns || 6)}
          onValueChange={(v) => onChange("gridColumns", Number(v))}
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
  );
}

/** The `logo-cloud` type's Style-tab fields — extracted verbatim from
 * ComponentEditor.tsx. */
export function LogoCloudStyleFields({ config, onChange }: LogoCloudFieldsProps) {
  return (
    <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
      <Label className="text-sm font-semibold">Logo Style</Label>

      <div className="space-y-2">
        <Label className="text-xs">Color Mode</Label>
        <Select
          value={String(config.grayscale ?? true)}
          onValueChange={(v) => onChange("grayscale", v === "true")}
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
          value={config.hoverEffect || "scale"}
          onValueChange={(v) => onChange("hoverEffect", v)}
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
            value={config.logoOpacity || 70}
            onChange={(e) => onChange("logoOpacity", Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12 text-right">{config.logoOpacity || 70}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Logo Background</Label>
        <Select value={config.logoBg || "none"} onValueChange={(v) => onChange("logoBg", v)}>
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
  );
}
