"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { InfoTooltip } from "@/components/editor/editors/fields/InfoTooltip";
import { SEOConfig } from "@/types/landing";

interface RobotsFieldsProps {
  config: SEOConfig;
  onChange: (updates: Partial<SEOConfig>) => void;
  disabled?: boolean;
}

/** The "Robots" tab's fields — extracted verbatim from SEOEditor.tsx. */
export function RobotsFields({ config, onChange, disabled = false }: RobotsFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="robotsIndex">Index</Label>
          <InfoTooltip text="Cho phép công cụ tìm kiếm index trang này." />
        </div>
        <Switch
          id="robotsIndex"
          checked={config.robots?.index !== false}
          onCheckedChange={(checked: boolean) =>
            onChange({
              robots: { ...config.robots, index: checked },
            })
          }
          disabled={disabled}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="robotsFollow">Follow</Label>
          <InfoTooltip text="Cho phép công cụ tìm kiếm theo dõi các liên kết trên trang." />
        </div>
        <Switch
          id="robotsFollow"
          checked={config.robots?.follow !== false}
          onCheckedChange={(checked: boolean) =>
            onChange({
              robots: { ...config.robots, follow: checked },
            })
          }
          disabled={disabled}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="robotsNoarchive">No Archive</Label>
          <InfoTooltip text="Không cho phép lưu cache của trang." />
        </div>
        <Switch
          id="robotsNoarchive"
          checked={config.robots?.noarchive || false}
          onCheckedChange={(checked: boolean) =>
            onChange({
              robots: { ...config.robots, noarchive: checked },
            })
          }
          disabled={disabled}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="robotsNosnippet">No Snippet</Label>
          <InfoTooltip text="Không hiển thị đoạn trích trên kết quả tìm kiếm." />
        </div>
        <Switch
          id="robotsNosnippet"
          checked={config.robots?.nosnippet || false}
          onCheckedChange={(checked: boolean) =>
            onChange({
              robots: { ...config.robots, nosnippet: checked },
            })
          }
          disabled={disabled}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="robotsNoimageindex">No Image Index</Label>
          <InfoTooltip text="Không index hình ảnh trên trang." />
        </div>
        <Switch
          id="robotsNoimageindex"
          checked={config.robots?.noimageindex || false}
          onCheckedChange={(checked: boolean) =>
            onChange({
              robots: { ...config.robots, noimageindex: checked },
            })
          }
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="maxImagePreview">Max Image Preview</Label>
          <InfoTooltip text="Kích thước preview ảnh tối đa trong kết quả tìm kiếm." />
        </div>
        <Select
          value={config.robots?.maxImagePreview || "large"}
          onValueChange={(value) =>
            onChange({
              robots: {
                ...config.robots,
                maxImagePreview: value as "none" | "standard" | "large",
              },
            })
          }
          disabled={disabled}
        >
          <SelectTrigger id="maxImagePreview">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="maxSnippet">Max Snippet</Label>
          <InfoTooltip text="Số ký tự tối đa cho snippet trong kết quả tìm kiếm." />
        </div>
        <Input
          id="maxSnippet"
          type="number"
          value={config.robots?.maxSnippet || ""}
          onChange={(e) =>
            onChange({
              robots: {
                ...config.robots,
                maxSnippet: parseInt(e.target.value) || undefined,
              },
            })
          }
          disabled={disabled}
          placeholder="Ví dụ: 160"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="maxVideoPreview">Max Video Preview</Label>
          <InfoTooltip text="Thời lượng tối đa (giây) cho video preview." />
        </div>
        <Input
          id="maxVideoPreview"
          type="number"
          value={config.robots?.maxVideoPreview || ""}
          onChange={(e) =>
            onChange({
              robots: {
                ...config.robots,
                maxVideoPreview: parseInt(e.target.value) || undefined,
              },
            })
          }
          disabled={disabled}
          placeholder="Ví dụ: 30"
        />
      </div>
    </div>
  );
}
