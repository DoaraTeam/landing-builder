/* eslint-disable @next/next/no-img-element */
"use client";

import { Theme, HeroConfig } from "@/types/landing";
import { Button } from "@/components/ui/button";
import { getBackgroundStyle, isBackgroundDark } from "@/lib/background-utils";
import { getLayoutClasses } from "@/lib/layout-utils";
import { AnimatedSection } from "@/components/landing/AnimatedSection";

interface HeroProps {
  config: HeroConfig;
  theme?: Theme;
}

export function Hero({ config, theme }: HeroProps) {
  const {
    title,
    subtitle,
    description,
    primaryCTA,
    secondaryCTA,
    image,
    alignment = "center",
    background,
    spacing,
    containerWidth,
    animation,
  } = config;

  // Use CSS variables for theme colors (these are set by applyTheme())
  const primaryColor = "var(--color-primary)";
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const headingFont = "var(--font-heading)";
  const bodyFont = "var(--font-body)";

  // Check if background is dark
  const isDarkBg = isBackgroundDark(background);

  // Layout classes
  const layout = getLayoutClasses({ spacing, containerWidth, alignment });

  // Handle CTA click - support both hash links and page navigation
  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    // Handle hash links for smooth scrolling
    if (link.startsWith("#")) {
      e.preventDefault();
      const targetId = link.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerHeight = 80; // Approximate header height
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
      return;
    }
    // For other links (like /slug/subpage), let the browser handle it naturally
  };

  return (
    <AnimatedSection animation={animation}>
      <section
        className={`relative ${layout.section} overflow-hidden`}
        style={getBackgroundStyle(background, theme?.colors.background)}
      >
        {/* Overlay for image backgrounds - handled in getBackgroundStyle */}

        <div className={`relative z-10 flex flex-col ${layout.alignment} ${layout.container}`}>
          {/* Subtitle */}
          {subtitle && (
            <div
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{
                color: isDarkBg ? "#ffffff" : primaryColor,
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl"
            style={{
              color: isDarkBg ? "#ffffff" : textColor,
              fontFamily: headingFont,
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            className="text-lg md:text-xl mb-8 max-w-2xl"
            style={{
              color: isDarkBg ? "rgba(255,255,255,0.9)" : textMuted,
              fontFamily: bodyFont,
            }}
          >
            {description}
          </p>

          {/* CTAs */}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-wrap gap-4">
              {primaryCTA && (
                <Button
                  asChild
                  size="lg"
                  style={{
                    backgroundColor: isDarkBg ? "#ffffff" : primaryColor,
                    color: isDarkBg ? "#000000" : "#ffffff",
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  <a href={primaryCTA.link} onClick={(e) => handleCTAClick(e, primaryCTA.link)}>
                    {primaryCTA.text}
                  </a>
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  style={{
                    borderColor: isDarkBg ? "#ffffff" : primaryColor,
                    color: isDarkBg ? "#ffffff" : primaryColor,
                    backgroundColor: "transparent",
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <a href={secondaryCTA.link} onClick={(e) => handleCTAClick(e, secondaryCTA.link)}>
                    {secondaryCTA.text}
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Hero Image */}
          {image && (
            <div className="mt-12 w-full max-w-5xl">
              <img src={image} alt={title} className="w-full h-auto rounded-lg shadow-2xl" />
            </div>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}
