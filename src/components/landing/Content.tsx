"use client";

import { Theme, AnimationConfig } from "@/types/landing";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { SmartImage } from "@/components/ui/smart-image";

interface ContentConfig {
  title: string;
  subtitle?: string;
  content: string; // HTML or Markdown content
  image?:
    | {
        url: string;
        position: "left" | "right" | "top" | "bottom";
        alt?: string;
      }
    | string; // Support both object and string format
  imagePosition?: "left" | "right" | "top" | "bottom"; // Legacy support
  cta?: {
    text: string;
    link: string;
  };
  background: {
    type: "solid";
    color?: string;
  };
  spacing?: {
    padding?: "md" | "lg" | "xl";
  };
  animation?: AnimationConfig;
}

interface ContentProps {
  config: ContentConfig;
  theme?: Theme;
}

export function Content({ config, theme }: ContentProps) {
  const { title, subtitle, content, image, imagePosition, cta, background, spacing } = config;

  const primaryColor = "var(--color-primary)";
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const surfaceColor = "var(--color-surface)";
  const headingFont = "var(--font-heading)";
  const bodyFont = "var(--font-body)";

  // Handle CTA click - support both hash links and page navigation
  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (link.startsWith("#")) {
      e.preventDefault();
      const element = document.getElementById(link.substring(1));
      element?.scrollIntoView({ behavior: "smooth" });
    }
    // Otherwise let the browser handle the navigation
  };

  // Normalize image data to support both formats
  const imageData =
    typeof image === "string"
      ? { url: image, position: imagePosition || ("right" as const), alt: title }
      : image;

  const getBackgroundColor = () => {
    if (background?.color === "background") return "var(--color-background)";
    if (background?.color === "surface") return surfaceColor;
    return background?.color || "#ffffff";
  };

  const paddingClass = spacing?.padding === "xl" ? "py-20" : "py-16";

  const renderWithImage = () => {
    if (!imageData) return null;

    const imageElement = (
      <div className="w-full">
        <SmartImage
          src={imageData.url}
          alt={imageData.alt || title}
          width={800}
          height={600}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
    );

    const contentElement = (
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          {subtitle && (
            <div
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: primaryColor }}
            >
              {subtitle}
            </div>
          )}

          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: textColor, fontFamily: headingFont }}
          >
            {title}
          </h2>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-8"
          style={{ color: textMuted, fontFamily: bodyFont }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* CTA */}
        {cta && (
          <Button asChild size="lg" style={{ backgroundColor: primaryColor }}>
            <a href={cta.link} onClick={(e) => handleCTAClick(e, cta.link)}>
              {cta.text}
            </a>
          </Button>
        )}
      </div>
    );

    if (imageData.position === "left") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {imageElement}
          {contentElement}
        </div>
      );
    } else if (imageData.position === "right") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {contentElement}
          {imageElement}
        </div>
      );
    } else if (imageData.position === "top") {
      return (
        <div className="space-y-12">
          {imageElement}
          {contentElement}
        </div>
      );
    } else {
      // bottom
      return (
        <div className="space-y-12">
          {contentElement}
          {imageElement}
        </div>
      );
    }
  };

  return (
    <AnimatedSection animation={config.animation}>
      <section className={`${paddingClass} px-4`} style={{ backgroundColor: getBackgroundColor() }}>
        <div className="container mx-auto max-w-6xl">
          {imageData ? (
            renderWithImage()
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                {subtitle && (
                  <div
                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                    style={{ color: primaryColor }}
                  >
                    {subtitle}
                  </div>
                )}

                <h2
                  className="text-3xl md:text-4xl font-bold mb-6"
                  style={{ color: textColor, fontFamily: headingFont }}
                >
                  {title}
                </h2>
              </div>

              {/* Content */}
              <div
                className="prose prose-lg max-w-none mb-8"
                style={{ color: textMuted, fontFamily: bodyFont }}
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* CTA */}
              {cta && (
                <Button asChild size="lg" style={{ backgroundColor: primaryColor }}>
                  <a href={cta.link} onClick={(e) => handleCTAClick(e, cta.link)}>
                    {cta.text}
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}
