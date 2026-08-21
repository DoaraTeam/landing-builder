"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SEOConfig, OpenGraphConfig } from "@/types/landing";
import { FieldError } from "@/components/editor/editors/fields/FieldError";
import { cn } from "@/lib/utils";

interface OpenGraphFieldsProps {
  config: SEOConfig;
  onChange: (updates: Partial<SEOConfig>) => void;
  disabled?: boolean;
  // Keyed by image index — only width/height are validated (see
  // docs/editor-input-validation-plan.md), everything else here is
  // content/format the user is trusted to get right themselves.
  imageErrors?: Record<number, { width?: string; height?: string }>;
}

/** The "Open Graph" tab's fields — extracted verbatim from SEOEditor.tsx. */
export function OpenGraphFields({
  config,
  onChange,
  disabled = false,
  imageErrors,
}: OpenGraphFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="ogTitle">OG Title</Label>
        <Input
          id="ogTitle"
          value={config.openGraph?.title || ""}
          onChange={(e) =>
            onChange({
              openGraph: { ...config.openGraph, title: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="Để trống để dùng Meta Title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogDescription">OG Description</Label>
        <Textarea
          id="ogDescription"
          value={config.openGraph?.description || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange({
              openGraph: { ...config.openGraph, description: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="Để trống để dùng Meta Description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogType">OG Type</Label>
        <Select
          value={config.openGraph?.type || "website"}
          onValueChange={(value) =>
            onChange({
              openGraph: {
                ...config.openGraph,
                type: value as NonNullable<OpenGraphConfig>["type"],
              },
            })
          }
          disabled={disabled}
        >
          <SelectTrigger id="ogType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="book">Book</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="video.movie">Video - Movie</SelectItem>
            <SelectItem value="video.episode">Video - Episode</SelectItem>
            <SelectItem value="music.song">Music - Song</SelectItem>
            <SelectItem value="music.album">Music - Album</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogSiteName">Site Name</Label>
        <Input
          id="ogSiteName"
          value={config.openGraph?.siteName || ""}
          onChange={(e) =>
            onChange({
              openGraph: { ...config.openGraph, siteName: e.target.value },
            })
          }
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogUrl">OG URL</Label>
        <Input
          id="ogUrl"
          value={config.openGraph?.url || ""}
          onChange={(e) =>
            onChange({
              openGraph: { ...config.openGraph, url: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ogLocale">Locale</Label>
        <Input
          id="ogLocale"
          value={config.openGraph?.locale || ""}
          onChange={(e) =>
            onChange({
              openGraph: { ...config.openGraph, locale: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="vi_VN"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>OG Images</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const images = config.openGraph?.images || [];
              onChange({
                openGraph: {
                  ...config.openGraph,
                  images: [...images, { url: "", alt: "" }],
                },
              });
            }}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            Thêm ảnh
          </Button>
        </div>
        {config.openGraph?.images?.map((image, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ảnh {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const images = [...(config.openGraph?.images || [])];
                  images.splice(index, 1);
                  onChange({
                    openGraph: { ...config.openGraph, images },
                  });
                }}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={image.url}
              onChange={(e) => {
                const images = [...(config.openGraph?.images || [])];
                images[index] = { ...images[index], url: e.target.value };
                onChange({
                  openGraph: { ...config.openGraph, images },
                });
              }}
              placeholder="URL ảnh"
              disabled={disabled}
            />
            <Input
              value={image.alt || ""}
              onChange={(e) => {
                const images = [...(config.openGraph?.images || [])];
                images[index] = { ...images[index], alt: e.target.value };
                onChange({
                  openGraph: { ...config.openGraph, images },
                });
              }}
              placeholder="Mô tả ảnh"
              disabled={disabled}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  value={image.width ?? ""}
                  onChange={(e) => {
                    // Empty means "no fixed width set", not an error —
                    // only an actually-unparseable non-empty value should
                    // ever reach validateOpenGraphImages as NaN.
                    const raw = e.target.value;
                    const images = [...(config.openGraph?.images || [])];
                    images[index] = {
                      ...images[index],
                      width: raw === "" ? undefined : parseInt(raw),
                    };
                    onChange({
                      openGraph: { ...config.openGraph, images },
                    });
                  }}
                  placeholder="Width"
                  disabled={disabled}
                  className={cn(imageErrors?.[index]?.width && "border-red-500")}
                />
                <FieldError message={imageErrors?.[index]?.width} />
              </div>
              <div>
                <Input
                  type="number"
                  value={image.height ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const images = [...(config.openGraph?.images || [])];
                    images[index] = {
                      ...images[index],
                      height: raw === "" ? undefined : parseInt(raw),
                    };
                    onChange({
                      openGraph: { ...config.openGraph, images },
                    });
                  }}
                  placeholder="Height"
                  disabled={disabled}
                  className={cn(imageErrors?.[index]?.height && "border-red-500")}
                />
                <FieldError message={imageErrors?.[index]?.height} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article specific fields */}
      {config.openGraph?.type === "article" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="ogPublishedTime">Published Time</Label>
            <Input
              id="ogPublishedTime"
              type="datetime-local"
              value={config.openGraph?.publishedTime || ""}
              onChange={(e) =>
                onChange({
                  openGraph: { ...config.openGraph, publishedTime: e.target.value },
                })
              }
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogAuthors">Authors</Label>
            <Input
              id="ogAuthors"
              value={config.openGraph?.authors?.join(", ") || ""}
              onChange={(e) =>
                onChange({
                  openGraph: {
                    ...config.openGraph,
                    authors: e.target.value
                      .split(",")
                      .map((a) => a.trim())
                      .filter(Boolean),
                  },
                })
              }
              disabled={disabled}
              placeholder="Tác giả 1, Tác giả 2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogSection">Section</Label>
            <Input
              id="ogSection"
              value={config.openGraph?.section || ""}
              onChange={(e) =>
                onChange({
                  openGraph: { ...config.openGraph, section: e.target.value },
                })
              }
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogTags">Tags</Label>
            <Input
              id="ogTags"
              value={config.openGraph?.tags?.join(", ") || ""}
              onChange={(e) =>
                onChange({
                  openGraph: {
                    ...config.openGraph,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  },
                })
              }
              disabled={disabled}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </>
      )}
    </>
  );
}
