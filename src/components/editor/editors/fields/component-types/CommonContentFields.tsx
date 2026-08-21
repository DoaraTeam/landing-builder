"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/editor/editors/fields/ImageUpload";

interface CommonContentFieldsProps {
  config: Record<string, unknown>;
  componentType: string;
  onChange: (path: string, value: unknown) => void;
}

/** Title/subtitle/description/image — shared Content-tab fields reused
 * across most component types, extracted verbatim from ComponentEditor.tsx. */
export function CommonContentFields({ config, componentType, onChange }: CommonContentFieldsProps) {
  return (
    <>
      {"title" in config && componentType !== "header" && (
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={config.title as string}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Enter title"
          />
        </div>
      )}

      {"subtitle" in config && (
        <div className="space-y-2">
          <Label>Subtitle</Label>
          <Input
            value={(config.subtitle as string) || ""}
            onChange={(e) => onChange("subtitle", e.target.value)}
            placeholder="Enter subtitle"
          />
        </div>
      )}

      {"description" in config && (
        <div className="space-y-2">
          <Label>Description</Label>
          <textarea
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={(config.description as string) || ""}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Enter description"
          />
        </div>
      )}

      {"image" in config && (
        <ImageUpload
          label="Image"
          value={(config.image as string) || ""}
          onChange={(url) => onChange("image", url)}
        />
      )}
    </>
  );
}
