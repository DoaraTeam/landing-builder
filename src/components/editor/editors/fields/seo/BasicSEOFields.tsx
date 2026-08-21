"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InfoTooltip } from "@/components/editor/editors/fields/InfoTooltip";
import { SEOConfig } from "@/types/landing";

interface BasicSEOFieldsProps {
  config: SEOConfig;
  onChange: (updates: Partial<SEOConfig>) => void;
  disabled?: boolean;
}

/** The "Cơ bản" (Basic) tab's fields — extracted verbatim from SEOEditor.tsx. */
export function BasicSEOFields({ config, onChange, disabled = false }: BasicSEOFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="metaTitle">Meta Title *</Label>
          <InfoTooltip text="Tiêu đề hiển thị trên kết quả tìm kiếm. Nên từ 50-60 ký tự." />
        </div>
        <Input
          id="metaTitle"
          value={config.metaTitle}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          disabled={disabled}
          maxLength={60}
        />
        <p className="text-xs text-gray-500">{config.metaTitle.length}/60 ký tự</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="metaDescription">Meta Description *</Label>
          <InfoTooltip text="Mô tả hiển thị trên kết quả tìm kiếm. Nên từ 150-160 ký tự." />
        </div>
        <Textarea
          id="metaDescription"
          value={config.metaDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange({ metaDescription: e.target.value })
          }
          disabled={disabled}
          maxLength={160}
          rows={3}
        />
        <p className="text-xs text-gray-500">{config.metaDescription.length}/160 ký tự</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="keywords">Keywords</Label>
          <InfoTooltip text="Từ khóa SEO, cách nhau bởi dấu phẩy. Ví dụ: landing page, website builder" />
        </div>
        <Input
          id="keywords"
          value={config.keywords.join(", ")}
          onChange={(e) =>
            onChange({
              keywords: e.target.value
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
            })
          }
          disabled={disabled}
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="canonical">Canonical URL</Label>
          <InfoTooltip text="URL chính thức của trang để tránh trùng lặp nội dung." />
        </div>
        <Input
          id="canonical"
          value={config.alternates?.canonical || ""}
          onChange={(e) =>
            onChange({
              alternates: { ...config.alternates, canonical: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="https://example.com/page"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="applicationName">Application Name</Label>
          <InfoTooltip text="Tên ứng dụng web của bạn." />
        </div>
        <Input
          id="applicationName"
          value={config.applicationName || ""}
          onChange={(e) => onChange({ applicationName: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="favicon">Favicon</Label>
          <InfoTooltip text="Icon hiển thị trên tab trình duyệt. Để trống để dùng mặc định." />
        </div>
        <Input
          id="favicon"
          value={typeof config.icons?.icon === "string" ? config.icons.icon : ""}
          onChange={(e) => onChange({ icons: { ...config.icons, icon: e.target.value } })}
          disabled={disabled}
          placeholder="/favicon.ico"
        />
      </div>
    </>
  );
}
