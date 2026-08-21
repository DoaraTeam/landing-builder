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
import { FieldError } from "@/components/editor/editors/fields/FieldError";
import { cn } from "@/lib/utils";

interface AnimationValue {
  type?: string;
  duration?: number;
  delay?: number;
}

interface AnimationEditorProps {
  value: AnimationValue | undefined;
  // Relative to "animation" (e.g. "type", "duration", "delay").
  onChange: (field: "type" | "duration" | "delay", value: string | number) => void;
  errors?: { duration?: string; delay?: string };
}

/** Scroll-in animation, available on every component type — extracted
 * verbatim from ComponentEditor.tsx's Style tab. */
export function AnimationEditor({ value, onChange, errors }: AnimationEditorProps) {
  return (
    <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
      <Label className="text-sm font-semibold">Animation</Label>

      <div className="space-y-2">
        <Label className="text-xs">Type</Label>
        <Select value={value?.type || "fadeInUp"} onValueChange={(v) => onChange("type", v)}>
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
          value={value?.duration ?? 600}
          onChange={(e) => onChange("duration", Number(e.target.value))}
          min={0}
          max={2000}
          step={100}
          className={cn(errors?.duration && "border-red-500")}
        />
        <FieldError message={errors?.duration} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Delay (ms)</Label>
        <Input
          type="number"
          value={value?.delay ?? 0}
          onChange={(e) => onChange("delay", Number(e.target.value))}
          min={0}
          max={2000}
          step={100}
          className={cn(errors?.delay && "border-red-500")}
        />
        <FieldError message={errors?.delay} />
      </div>
    </div>
  );
}
