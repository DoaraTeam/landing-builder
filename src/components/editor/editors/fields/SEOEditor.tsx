"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOConfig, OpenGraphConfig, TwitterConfig } from "@/types/landing";
import { Plus, Trash2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SEOEditorProps {
  config: SEOConfig;
  onChange: (config: SEOConfig) => void;
  disabled?: boolean;
}

export default function SEOEditor({ config, onChange, disabled = false }: SEOEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const updateConfig = (updates: Partial<SEOConfig>) => {
    onChange({ ...config, ...updates });
  };

  const InfoTooltip = ({ text }: { text: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-gray-400 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="basic" className="text-xs">
            Cơ bản
          </TabsTrigger>
          <TabsTrigger value="opengraph" className="text-xs">
            Open Graph
          </TabsTrigger>
          <TabsTrigger value="twitter" className="text-xs">
            Twitter
          </TabsTrigger>
          <TabsTrigger value="robots" className="text-xs">
            Robots
          </TabsTrigger>
          <TabsTrigger value="verification" className="text-xs">
            Xác minh
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">
            Nâng cao
          </TabsTrigger>
        </TabsList>

        {/* Basic SEO Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="metaTitle">Meta Title *</Label>
              <InfoTooltip text="Tiêu đề hiển thị trên kết quả tìm kiếm. Nên từ 50-60 ký tự." />
            </div>
            <Input
              id="metaTitle"
              value={config.metaTitle}
              onChange={(e) => updateConfig({ metaTitle: e.target.value })}
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
                updateConfig({ metaDescription: e.target.value })
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
                updateConfig({
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
                updateConfig({
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
              onChange={(e) => updateConfig({ applicationName: e.target.value })}
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
              onChange={(e) => updateConfig({ icons: { ...config.icons, icon: e.target.value } })}
              disabled={disabled}
              placeholder="/favicon.ico"
            />
          </div>
        </TabsContent>

        {/* Open Graph Tab */}
        <TabsContent value="opengraph" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="ogTitle">OG Title</Label>
            <Input
              id="ogTitle"
              value={config.openGraph?.title || ""}
              onChange={(e) =>
                updateConfig({
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
                updateConfig({
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
                updateConfig({
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
                updateConfig({
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
                updateConfig({
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
                updateConfig({
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
                  updateConfig({
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
                      updateConfig({
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
                    updateConfig({
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
                    updateConfig({
                      openGraph: { ...config.openGraph, images },
                    });
                  }}
                  placeholder="Mô tả ảnh"
                  disabled={disabled}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={image.width || ""}
                    onChange={(e) => {
                      const images = [...(config.openGraph?.images || [])];
                      images[index] = { ...images[index], width: parseInt(e.target.value) };
                      updateConfig({
                        openGraph: { ...config.openGraph, images },
                      });
                    }}
                    placeholder="Width"
                    disabled={disabled}
                  />
                  <Input
                    type="number"
                    value={image.height || ""}
                    onChange={(e) => {
                      const images = [...(config.openGraph?.images || [])];
                      images[index] = { ...images[index], height: parseInt(e.target.value) };
                      updateConfig({
                        openGraph: { ...config.openGraph, images },
                      });
                    }}
                    placeholder="Height"
                    disabled={disabled}
                  />
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
                    updateConfig({
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
                    updateConfig({
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
                    updateConfig({
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
                    updateConfig({
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
        </TabsContent>

        {/* Twitter Tab */}
        <TabsContent value="twitter" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="twitterCard">Card Type</Label>
            <Select
              value={config.twitter?.card || "summary"}
              onValueChange={(value) =>
                updateConfig({
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
                updateConfig({
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
                updateConfig({
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
                updateConfig({
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
                updateConfig({
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
                  updateConfig({
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
                      updateConfig({
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
                    updateConfig({
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
                    updateConfig({
                      twitter: { ...config.twitter, images },
                    });
                  }}
                  placeholder="Mô tả ảnh"
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Robots Tab */}
        <TabsContent value="robots" className="space-y-4 mt-4">
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
                  updateConfig({
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
                  updateConfig({
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
                  updateConfig({
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
                  updateConfig({
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
                  updateConfig({
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
                  updateConfig({
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
                  updateConfig({
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
                  updateConfig({
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
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="googleVerification">Google Verification</Label>
              <InfoTooltip text="Mã xác minh Google Search Console." />
            </div>
            <Input
              id="googleVerification"
              value={config.verification?.google || ""}
              onChange={(e) =>
                updateConfig({
                  verification: { ...config.verification, google: e.target.value },
                })
              }
              disabled={disabled}
              placeholder="Mã xác minh Google"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="bingVerification">Bing Verification</Label>
              <InfoTooltip text="Mã xác minh Bing Webmaster Tools." />
            </div>
            <Input
              id="bingVerification"
              value={config.verification?.bing || ""}
              onChange={(e) =>
                updateConfig({
                  verification: { ...config.verification, bing: e.target.value },
                })
              }
              disabled={disabled}
              placeholder="Mã xác minh Bing"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="yandexVerification">Yandex Verification</Label>
              <InfoTooltip text="Mã xác minh Yandex Webmaster." />
            </div>
            <Input
              id="yandexVerification"
              value={config.verification?.yandex || ""}
              onChange={(e) =>
                updateConfig({
                  verification: { ...config.verification, yandex: e.target.value },
                })
              }
              disabled={disabled}
              placeholder="Mã xác minh Yandex"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="yahooVerification">Yahoo Verification</Label>
              <InfoTooltip text="Mã xác minh Yahoo." />
            </div>
            <Input
              id="yahooVerification"
              value={config.verification?.yahoo || ""}
              onChange={(e) =>
                updateConfig({
                  verification: { ...config.verification, yahoo: e.target.value },
                })
              }
              disabled={disabled}
              placeholder="Mã xác minh Yahoo"
            />
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="manifest">Web App Manifest</Label>
              <InfoTooltip text="Đường dẫn đến file manifest.json cho PWA." />
            </div>
            <Input
              id="manifest"
              value={config.manifest || ""}
              onChange={(e) => updateConfig({ manifest: e.target.value })}
              disabled={disabled}
              placeholder="/manifest.json"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="viewport">Viewport</Label>
              <InfoTooltip text="Cấu hình viewport cho thiết bị di động." />
            </div>
            <Input
              id="viewport"
              value={config.viewport || ""}
              onChange={(e) => updateConfig({ viewport: e.target.value })}
              disabled={disabled}
              placeholder="width=device-width, initial-scale=1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorScheme">Color Scheme</Label>
            <Select
              value={config.colorScheme || "light dark"}
              onValueChange={(value) =>
                updateConfig({
                  colorScheme: value as "light" | "dark" | "light dark",
                })
              }
              disabled={disabled}
            >
              <SelectTrigger id="colorScheme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light dark">Light & Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referrer">Referrer Policy</Label>
            <Select
              value={config.referrer || "origin-when-cross-origin"}
              onValueChange={(value) =>
                updateConfig({
                  referrer: value as SEOConfig["referrer"],
                })
              }
              disabled={disabled}
            >
              <SelectTrigger id="referrer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-referrer">No Referrer</SelectItem>
                <SelectItem value="no-referrer-when-downgrade">
                  No Referrer When Downgrade
                </SelectItem>
                <SelectItem value="origin">Origin</SelectItem>
                <SelectItem value="origin-when-cross-origin">Origin When Cross Origin</SelectItem>
                <SelectItem value="same-origin">Same Origin</SelectItem>
                <SelectItem value="strict-origin">Strict Origin</SelectItem>
                <SelectItem value="strict-origin-when-cross-origin">
                  Strict Origin When Cross Origin
                </SelectItem>
                <SelectItem value="unsafe-url">Unsafe URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-sm">Apple Web App</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="appleCapable">Capable</Label>
              <Switch
                id="appleCapable"
                checked={config.appleWebApp?.capable || false}
                onCheckedChange={(checked: boolean) =>
                  updateConfig({
                    appleWebApp: { ...config.appleWebApp, capable: checked },
                  })
                }
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appleTitle">Apple Web App Title</Label>
              <Input
                id="appleTitle"
                value={config.appleWebApp?.title || ""}
                onChange={(e) =>
                  updateConfig({
                    appleWebApp: { ...config.appleWebApp, title: e.target.value },
                  })
                }
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appleStatusBar">Status Bar Style</Label>
              <Select
                value={config.appleWebApp?.statusBarStyle || "default"}
                onValueChange={(value) =>
                  updateConfig({
                    appleWebApp: {
                      ...config.appleWebApp,
                      statusBarStyle: value as "default" | "black" | "black-translucent",
                    },
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger id="appleStatusBar">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="black-translucent">Black Translucent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-sm">Format Detection</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="detectTelephone">Telephone</Label>
              <Switch
                id="detectTelephone"
                checked={config.formatDetection?.telephone !== false}
                onCheckedChange={(checked: boolean) =>
                  updateConfig({
                    formatDetection: { ...config.formatDetection, telephone: checked },
                  })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="detectEmail">Email</Label>
              <Switch
                id="detectEmail"
                checked={config.formatDetection?.email !== false}
                onCheckedChange={(checked: boolean) =>
                  updateConfig({
                    formatDetection: { ...config.formatDetection, email: checked },
                  })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="detectAddress">Address</Label>
              <Switch
                id="detectAddress"
                checked={config.formatDetection?.address !== false}
                onCheckedChange={(checked: boolean) =>
                  updateConfig({
                    formatDetection: { ...config.formatDetection, address: checked },
                  })
                }
                disabled={disabled}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
