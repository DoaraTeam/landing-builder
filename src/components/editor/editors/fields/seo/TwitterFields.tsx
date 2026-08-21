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
import { InfoTooltip } from "@/components/editor/editors/fields/InfoTooltip";
import { SEOConfig, TwitterConfig } from "@/types/landing";

interface TwitterFieldsProps {
  config: SEOConfig;
  onChange: (updates: Partial<SEOConfig>) => void;
  disabled?: boolean;
}

/** The "Twitter" tab's fields — extracted verbatim from SEOEditor.tsx. */
export function TwitterFields({ config, onChange, disabled = false }: TwitterFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="twitterCard">Card Type</Label>
        <Select
          value={config.twitter?.card || "summary"}
          onValueChange={(value) =>
            onChange({
              twitter: {
                ...config.twitter,
                card: value as NonNullable<TwitterConfig>["card"],
              },
            })
          }
          disabled={disabled}
        >
          <SelectTrigger id="twitterCard">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
            <SelectItem value="app">App</SelectItem>
            <SelectItem value="player">Player</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="twitterSite">Site (@username)</Label>
          <InfoTooltip text="Tài khoản Twitter của website. Ví dụ: @mywebsite" />
        </div>
        <Input
          id="twitterSite"
          value={config.twitter?.site || ""}
          onChange={(e) =>
            onChange({
              twitter: { ...config.twitter, site: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="@username"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="twitterCreator">Creator (@username)</Label>
          <InfoTooltip text="Tài khoản Twitter của tác giả. Ví dụ: @author" />
        </div>
        <Input
          id="twitterCreator"
          value={config.twitter?.creator || ""}
          onChange={(e) =>
            onChange({
              twitter: { ...config.twitter, creator: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="@username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="twitterTitle">Twitter Title</Label>
        <Input
          id="twitterTitle"
          value={config.twitter?.title || ""}
          onChange={(e) =>
            onChange({
              twitter: { ...config.twitter, title: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="Để trống để dùng Meta Title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="twitterDescription">Twitter Description</Label>
        <Textarea
          id="twitterDescription"
          value={config.twitter?.description || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange({
              twitter: { ...config.twitter, description: e.target.value },
            })
          }
          disabled={disabled}
          placeholder="Để trống để dùng Meta Description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Twitter Images</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const images = config.twitter?.images || [];
              onChange({
                twitter: {
                  ...config.twitter,
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
        {config.twitter?.images?.map((image, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ảnh {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const images = [...(config.twitter?.images || [])];
                  images.splice(index, 1);
                  onChange({
                    twitter: { ...config.twitter, images },
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
                const images = [...(config.twitter?.images || [])];
                images[index] = { ...images[index], url: e.target.value };
                onChange({
                  twitter: { ...config.twitter, images },
                });
              }}
              placeholder="URL ảnh"
              disabled={disabled}
            />
            <Input
              value={image.alt || ""}
              onChange={(e) => {
                const images = [...(config.twitter?.images || [])];
                images[index] = { ...images[index], alt: e.target.value };
                onChange({
                  twitter: { ...config.twitter, images },
                });
              }}
              placeholder="Mô tả ảnh"
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </>
  );
}
