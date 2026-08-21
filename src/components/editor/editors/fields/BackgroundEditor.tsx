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
import { X } from "lucide-react";
import { ImageUpload } from "@/components/editor/editors/fields/ImageUpload";
import {
  overlayToHex,
  hexToOverlay,
  getOverlayOpacity,
  setOverlayOpacity,
} from "@/lib/color-utils";

interface BackgroundValue {
  type?: "solid" | "gradient" | "image";
  color?: string;
  gradient?: { from?: string; to?: string; direction?: string };
  image?: { url?: string; overlay?: string; position?: string; size?: string };
}

interface BackgroundEditorProps {
  value: BackgroundValue | undefined;
  // Relative to "background" — the caller prefixes it back (e.g. "type" ->
  // "background.type", "gradient.from" -> "background.gradient.from").
  onChange: (path: string, value: unknown) => void;
}

/** The Background field shared by most component types — solid/gradient/
 * image, with an overlay color+opacity picker for the image mode. Extracted
 * verbatim from ComponentEditor.tsx's Style tab, the single largest block
 * in that file. */
export function BackgroundEditor({ value, onChange }: BackgroundEditorProps) {
  return (
    <div className="space-y-3 p-3 border border-gray-200 rounded-lg">
      <Label className="text-sm font-semibold">Background</Label>

      <div className="space-y-2">
        <Label className="text-xs">Type</Label>
        <Select value={value?.type || "solid"} onValueChange={(v) => onChange("type", v)}>
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

      {value?.type === "solid" && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Background Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value?.color || "#ffffff"}
              onChange={(e) => onChange("color", e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <Input
              type="text"
              value={value?.color || "#ffffff"}
              onChange={(e) => onChange("color", e.target.value)}
              className="flex-1"
              placeholder="#ffffff or color name"
            />
          </div>
          {/* Color Preview */}
          <div
            className="w-full h-12 rounded border border-gray-300"
            style={{ backgroundColor: value?.color || "#ffffff" }}
          />
        </div>
      )}

      {value?.type === "gradient" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">From Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={value?.gradient?.from || "#3b82f6"}
                onChange={(e) => onChange("gradient.from", e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                type="text"
                value={value?.gradient?.from || "#3b82f6"}
                onChange={(e) => onChange("gradient.from", e.target.value)}
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
                value={value?.gradient?.to || "#8b5cf6"}
                onChange={(e) => onChange("gradient.to", e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                type="text"
                value={value?.gradient?.to || "#8b5cf6"}
                onChange={(e) => onChange("gradient.to", e.target.value)}
                className="flex-1"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Direction</Label>
            <Select
              value={value?.gradient?.direction || "to-br"}
              onValueChange={(v) => onChange("gradient.direction", v)}
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
                background: `linear-gradient(${value?.gradient?.direction || "to-br"}, ${
                  value?.gradient?.from || "#3b82f6"
                }, ${value?.gradient?.to || "#8b5cf6"})`,
              }}
            />
          </div>
        </div>
      )}

      {value?.type === "image" && (
        <div className="space-y-3">
          <ImageUpload
            label="Background Image"
            value={value?.image?.url || ""}
            onChange={(url) => onChange("image.url", url)}
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
                      value={overlayToHex(value?.image?.overlay || "")}
                      onChange={(e) =>
                        onChange(
                          "image.overlay",
                          hexToOverlay(e.target.value, value?.image?.overlay || "")
                        )
                      }
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={value?.image?.overlay || ""}
                      onChange={(e) => onChange("image.overlay", e.target.value)}
                      placeholder="rgba(0,0,0,0.5)"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Clear Button */}
                {value?.image?.overlay && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onChange("image.overlay", "")}
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
                    {Math.round(getOverlayOpacity(value?.image?.overlay || "") * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={getOverlayOpacity(value?.image?.overlay || "") * 100}
                  onChange={(e) =>
                    onChange(
                      "image.overlay",
                      setOverlayOpacity(value?.image?.overlay || "", parseInt(e.target.value, 10))
                    )
                  }
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
                    onClick={() => onChange("image.overlay", "rgba(0,0,0,0.5)")}
                    className="text-xs"
                  >
                    Dark 50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onChange("image.overlay", "rgba(0,0,0,0.3)")}
                    className="text-xs"
                  >
                    Dark 30%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onChange("image.overlay", "rgba(255,255,255,0.5)")}
                    className="text-xs"
                  >
                    Light 50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onChange("image.overlay", "rgba(59,130,246,0.4)")}
                    className="text-xs"
                  >
                    Blue 40%
                  </Button>
                </div>
              </div>

              {/* Preview */}
              {value?.image?.overlay && (
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
                      style={{ backgroundColor: value?.image?.overlay || "transparent" }}
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
              value={value?.image?.position || "center"}
              onValueChange={(v) => onChange("image.position", v)}
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
              value={value?.image?.size || "cover"}
              onValueChange={(v) => onChange("image.size", v)}
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
  );
}
