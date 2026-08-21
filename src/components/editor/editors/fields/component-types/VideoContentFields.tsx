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
import { ImageUpload } from "@/components/editor/editors/fields/ImageUpload";

interface VideoContentFieldsProps {
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}

/** The `video` type's Content-tab fields — extracted verbatim from
 * ComponentEditor.tsx. */
export function VideoContentFields({ config, onChange }: VideoContentFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Video Type</Label>
        <Select
          value={(config.videoType as string) || "youtube"}
          onValueChange={(value) => onChange("videoType", value)}
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
          onChange={(e) => onChange("videoUrl", e.target.value)}
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
        onChange={(url) => onChange("thumbnail", url)}
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoPlay"
            checked={(config.autoPlay as boolean) || false}
            onChange={(e) => onChange("autoPlay", e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="autoPlay" className="cursor-pointer">
            Auto Play Video
          </Label>
        </div>
      </div>
    </>
  );
}
