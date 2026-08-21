"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SpacingValue {
  padding: string;
  margin: string;
}

interface SpacingEditorProps {
  // config.spacing — either {padding, margin} or (legacy) a flat padding string.
  value: unknown;
  onChange: (next: SpacingValue) => void;
}

function resolveSpacing(value: unknown): SpacingValue {
  if (value && typeof value === "object") {
    const v = value as { padding?: string; margin?: string };
    return { padding: v.padding || "xl", margin: v.margin || "none" };
  }
  // Legacy shape: the whole field was just the padding value.
  return { padding: (value as string) || "xl", margin: "none" };
}

/** Section spacing (padding/margin), available on every component type —
 * extracted verbatim from ComponentEditor.tsx's Layout tab. */
export function SpacingEditor({ value, onChange }: SpacingEditorProps) {
  const { padding, margin } = resolveSpacing(value);

  return (
    <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
      <Label className="text-sm font-semibold">Section Spacing</Label>

      <div className="space-y-2">
        <Label className="text-xs">Padding (Vertical)</Label>
        <Select value={padding} onValueChange={(v) => onChange({ padding: v, margin })}>
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
        <Select value={margin} onValueChange={(v) => onChange({ padding, margin: v })}>
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
  );
}
