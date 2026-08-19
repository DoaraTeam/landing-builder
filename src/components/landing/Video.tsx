"use client";

import { useState } from "react";
import { Theme } from "@/types/landing";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { SmartImage } from "@/components/ui/smart-image";

interface VideoConfig {
  title?: string;
  subtitle?: string;
  description?: string;
  videoUrl: string;
  videoType?: "youtube" | "vimeo" | "direct";
  thumbnail?: string;
  autoPlay?: boolean;
  aspectRatio?: "16:9" | "4:3" | "21:9" | "1:1";
  background: {
    type: "solid";
    color?: string;
  };
  spacing?: {
    padding?: "md" | "lg" | "xl";
  };
  animation?: {
    type?:
      | "fadeIn"
      | "fadeInUp"
      | "fadeInDown"
      | "slideInLeft"
      | "slideInRight"
      | "zoomIn"
      | "none";
    duration?: number;
    delay?: number;
  };
}

interface VideoProps {
  config: VideoConfig;
  theme?: Theme;
}

export function Video({ config }: VideoProps) {
  const {
    title,
    subtitle,
    description,
    videoUrl,
    videoType = "youtube",
    thumbnail,
    autoPlay = false,
    aspectRatio = "16/9",
    background,
    spacing,
  } = config;

  const [playing, setPlaying] = useState(autoPlay);

  // Normalize animation config to have default type
  const normalizedAnimation = config.animation
    ? { type: "fadeInUp" as const, ...config.animation }
    : undefined;

  const primaryColor = "var(--color-primary)";
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const surfaceColor = "var(--color-surface)";
  const headingFont = "var(--font-heading)";
  const bodyFont = "var(--font-body)";

  const getBackgroundColor = () => {
    if (background.color === "background") return "var(--color-background)";
    if (background.color === "surface") return surfaceColor;
    return background.color || "#ffffff";
  };

  const getEmbedUrl = () => {
    if (videoType === "youtube") {
      const videoId = videoUrl.includes("watch?v=")
        ? videoUrl.split("watch?v=")[1]?.split("&")[0]
        : videoUrl.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}${autoPlay ? "?autoplay=1" : ""}`;
    } else if (videoType === "vimeo") {
      const videoId = videoUrl.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}${autoPlay ? "?autoplay=1" : ""}`;
    }
    return videoUrl;
  };

  const aspectRatioClass: Record<string, string> = {
    "16:9": "aspect-video",
    "16/9": "aspect-video", // backward compatibility
    "4:3": "aspect-[4/3]",
    "4/3": "aspect-[4/3]", // backward compatibility
    "21:9": "aspect-[21/9]",
    "1:1": "aspect-square",
  };

  const paddingClass =
    spacing?.padding === "xl" ? "py-20" : spacing?.padding === "md" ? "py-12" : "py-16";

  return (
    <AnimatedSection animation={normalizedAnimation}>
      <section className={`${paddingClass} px-4`} style={{ backgroundColor: getBackgroundColor() }}>
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          {(title || subtitle || description) && (
            <div className="text-center mb-12 max-w-3xl mx-auto">
              {subtitle && (
                <div
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: primaryColor }}
                >
                  {subtitle}
                </div>
              )}

              {title && (
                <h2
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: textColor, fontFamily: headingFont }}
                >
                  {title}
                </h2>
              )}

              {description && (
                <p className="text-lg" style={{ color: textMuted, fontFamily: bodyFont }}>
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Video */}
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            {!playing && thumbnail ? (
              <div
                className={`relative ${aspectRatioClass[aspectRatio]} cursor-pointer group`}
                onClick={() => setPlaying(true)}
              >
                <SmartImage
                  src={thumbnail}
                  alt={title || "Video thumbnail"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <svg
                      className="w-10 h-10 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className={aspectRatioClass[aspectRatio]}>
                <iframe
                  src={getEmbedUrl()}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
