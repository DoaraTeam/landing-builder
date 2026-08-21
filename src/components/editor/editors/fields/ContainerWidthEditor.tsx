"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContainerWidthEditorProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

/** Max container width, available on every component type — extracted
 * verbatim from ComponentEditor.tsx's Layout tab. */
export function ContainerWidthEditor({ value, onChange }: ContainerWidthEditorProps) {
  return (
    <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
      <Label className="text-sm font-semibold">Container Width</Label>

      <div className="space-y-2">
        <Label className="text-xs">Max Width</Label>
        <Select value={value || "default"} onValueChange={onChange}>
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
        <p className="text-xs text-gray-500">Controls the maximum width of the content container</p>
      </div>
    </div>
  );
}
