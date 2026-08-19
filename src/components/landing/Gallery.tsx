"use client";

import { useState } from "react";
import { Theme, AnimationConfig } from "@/types/landing";
import { BackgroundConfig, getBackgroundStyle, isBackgroundDark } from "@/lib/background-utils";
import { SmartImage } from "@/components/ui/smart-image";
import { motion } from "framer-motion";
import { useStaggerAnimation } from "@/hooks/use-scroll-animation";
import { ensureAnimation } from "@/lib/animation-defaults";

interface GalleryItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
  category?: string;
}

interface GalleryConfig {
  title: string;
  subtitle?: string;
  description?: string;
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
  layout?: "grid" | "masonry";
  aspectRatio?: "square" | "landscape" | "portrait" | "auto";
  background: BackgroundConfig;
  spacing?: {
    padding?: "md" | "lg" | "xl" | "2xl";
  };
  animation?: AnimationConfig;
}

interface GalleryProps {
  config: GalleryConfig;
  theme?: Theme;
}

export function Gallery({ config }: GalleryProps) {
  const configWithAnimation = ensureAnimation(config, "gallery");
  const {
    title,
    subtitle,
    description,
    items = [],
    columns = 3,
    aspectRatio = "landscape",
    background,
    spacing,
  } = configWithAnimation;

  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const stagger = useStaggerAnimation({
    animation: configWithAnimation.animation,
    staggerDelay: 0.1,
  });

  const primaryColor = "var(--color-primary)";
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const bgColor = "var(--color-background)";
  const headingFont = "var(--font-heading)";
  const bodyFont = "var(--font-body)";

  const isDarkBg = isBackgroundDark(background);

  const gridColsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const aspectRatioClass = {
    square: "aspect-square",
    landscape: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "aspect-auto",
  };

  const paddingClass =
    spacing?.padding === "2xl"
      ? "py-24"
      : spacing?.padding === "xl"
        ? "py-20"
        : spacing?.padding === "md"
          ? "py-12"
          : "py-16";

  return (
    <>
      <section className={`${paddingClass} px-4`} style={getBackgroundStyle(background, bgColor)}>
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {subtitle && (
              <div
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: isDarkBg ? "#ffffff" : primaryColor }}
              >
                {subtitle}
              </div>
            )}

            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: isDarkBg ? "#ffffff" : textColor,
                fontFamily: headingFont,
              }}
            >
              {title}
            </h2>

            {description && (
              <p
                className="text-lg"
                style={{
                  color: isDarkBg ? "rgba(255,255,255,0.9)" : textMuted,
                  fontFamily: bodyFont,
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Gallery Grid */}
          <motion.div
            className={`grid grid-cols-1 ${gridColsClass[columns]} gap-6`}
            variants={stagger.containerVariants}
            initial="hidden"
            animate={stagger.animate}
            ref={stagger.ref}
          >
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <motion.div
                  key={item.id || `gallery-${index}`}
                  className="relative group overflow-hidden rounded-lg cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
                  onClick={() => setSelectedImage(item)}
                  variants={stagger.itemVariants}
                >
                  <div className={`relative ${aspectRatioClass[aspectRatio]} overflow-hidden`}>
                    <SmartImage
                      src={item.image}
                      alt={item.title || "Gallery item"}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
                      }}
                    />
                  </div>
                  {/* Overlay */}
                  {(item.title || item.description) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      {item.category && (
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-yellow-400">
                          {item.category}
                        </div>
                      )}
                      {item.title && (
                        <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      )}
                      {item.description && (
                        <p className="text-sm text-white/90">{item.description}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p style={{ color: isDarkBg ? "rgba(255,255,255,0.7)" : textMuted }}>
                  No images to display
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Lightbox shows the image at its natural size with no fixed
                box to size against, and only renders after a click (never
                part of initial page load) — not worth forcing into
                next/image's width/height or fill constraints. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage.image}
              alt={selectedImage.title || "Gallery item"}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="text-center mt-4 text-white">
                {selectedImage.title && (
                  <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-gray-300">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
