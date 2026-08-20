"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { AnimatedSection } from "./AnimatedSection";
import { getBackgroundStyle } from "@/lib/background-utils";
import { getSpacingClasses } from "@/lib/layout-utils";
import { BackgroundConfig, SpacingConfig, AnimationConfig, Theme } from "@/types/landing";
import { useEditMode } from "@/contexts/EditModeContext";

export interface HeaderTab {
  id: string;
  text: string;
  link: string;
}

export interface HeaderConfig {
  logo?: {
    type: "text" | "image";
    text?: string;
    image?: string;
    link?: string;
  };
  tabs: HeaderTab[];
  ctaButton?: {
    text: string;
    link: string;
    style?: "primary" | "secondary" | "outline";
  };
  position?: "fixed" | "sticky" | "static";
  transparent?: boolean; // Transparent on scroll top
  background: BackgroundConfig;
  spacing?: SpacingConfig;
  animation?: AnimationConfig;
}

interface HeaderProps {
  config: HeaderConfig;
  theme?: Theme;
}

export function Header({ config, theme }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isEditMode } = useEditMode();

  // Handle navigation click - supports both hash links and page navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    // Close mobile menu
    setMobileMenuOpen(false);

    // Handle hash links for smooth scrolling
    if (link.startsWith("#")) {
      e.preventDefault();
      e.stopPropagation();
      const targetId = link.substring(1);
      const targetElement = document.getElementById(targetId);
      targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // For other links (like /slug/subpage), let the browser handle it naturally
    // No need to preventDefault(), the <a> tag will navigate normally
  };

  const {
    logo,
    tabs = [],
    ctaButton,
    position = "sticky",
    transparent = false,
    background,
    spacing,
    animation,
  } = config;

  // Handle scroll effect
  useEffect(() => {
    // Only handle scroll in public view (not edit mode)
    if (isEditMode) {
      return;
    }

    // Only handle scroll for transparent mode or shadow effect
    if (!transparent && position === "static") {
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent, position, isEditMode]);

  // Use theme background color as fallback, prioritize theme over config
  const themeBackgroundColor = theme?.colors.background || "#ffffff";

  // For solid backgrounds, always use theme color to ensure consistency
  // For gradient/image backgrounds, respect the config
  const backgroundConfig =
    background.type === "solid" ? { ...background, color: themeBackgroundColor } : background;

  const bgStyle = getBackgroundStyle(backgroundConfig, themeBackgroundColor);
  const spacingClasses = spacing ? getSpacingClasses(spacing) : "py-2";

  // In edit mode, force static position to prevent overlapping
  const effectivePosition = isEditMode ? "static" : position;

  const positionClasses = {
    fixed: "fixed top-0 left-0 right-0 w-full z-40",
    sticky: "sticky top-0 w-full z-40",
    static: "static w-full",
  };

  const headerClasses = `
    ${positionClasses[effectivePosition]}
    ${scrolled ? "shadow-md" : ""}
    transition-all duration-300
  `.trim();

  // Apply transparent background only when not scrolled and transparent mode is enabled
  // Otherwise, always use theme background
  const headerStyle =
    transparent && !scrolled && effectivePosition !== "static"
      ? { backgroundColor: "transparent" }
      : bgStyle;

  // Use CSS variables for theme colors (these are set by applyTheme())
  const primaryColor = "var(--color-primary)";
  const secondaryColor = "var(--color-secondary)";
  const textColor = "var(--color-text)";

  // Get button styles - uses CSS variables so they auto-update when theme changes
  const getButtonStyles = (style?: "primary" | "secondary" | "outline"): React.CSSProperties => {
    switch (style) {
      case "secondary":
        return {
          backgroundColor: secondaryColor,
          color: "#ffffff",
        };
      case "outline":
        return {
          border: `2px solid ${primaryColor}`,
          borderStyle: "solid",
          color: primaryColor,
          backgroundColor: "transparent",
        };
      case "primary":
      default:
        return {
          backgroundColor: primaryColor,
          color: "#ffffff",
        };
    }
  };

  const renderLogo = () => {
    const logoLink = logo?.link || "/";

    if (logo?.type === "image") {
      // Use provided image or fallback to default logo
      const logoSrc = logo.image || "/assets/images/default-logo.svg";
      return (
        <a href={logoLink} className="flex items-center">
          <Image
            src={logoSrc}
            alt="Logo"
            width={160}
            height={8}
            className="h-8 md:h-10 w-auto max-w-[180px]"
          />
        </a>
      );
    }

    if (logo?.text) {
      return (
        <a href={logoLink} className="text-xl md:text-2xl font-bold" style={{ color: textColor }}>
          {logo.text}
        </a>
      );
    }

    return (
      <a href={logoLink} className="text-xl md:text-2xl font-bold" style={{ color: textColor }}>
        Your Brand
      </a>
    );
  };

  const headerContent = (
    <header className={headerClasses} style={headerStyle}>
      <nav className={`container mx-auto px-4 ${spacingClasses}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">{renderLogo()}</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {tabs.map((tab) => (
              <a
                key={tab.id}
                href={tab.link}
                onClick={(e) => handleNavClick(e, tab.link)}
                className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
                // Scroll-to-section links stay clickable even inside the
                // editor's canvas (where a parent wraps components in
                // pointer-events-none so clicks select the block instead of
                // triggering real interactions) — it's a same-page smooth
                // scroll, not a real navigation, so there's nothing unsafe
                // about letting it still work while editing.
                style={{
                  color: textColor,
                  pointerEvents: tab.link.startsWith("#") ? "auto" : undefined,
                }}
              >
                {tab.text}
              </a>
            ))}

            {/* CTA Button */}
            {ctaButton && (
              <a
                href={ctaButton.link}
                onClick={(e) => handleNavClick(e, ctaButton.link)}
                className="px-5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer hover:shadow-lg active:scale-95"
                style={{
                  ...getButtonStyles(ctaButton.style),
                  filter: "brightness(1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(0.9)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {ctaButton.text}
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={24} style={{ color: textColor }} />
              ) : (
                <Menu size={24} style={{ color: textColor }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-3">
              {tabs.map((tab) => (
                <a
                  key={tab.id}
                  href={tab.link}
                  onClick={(e) => handleNavClick(e, tab.link)}
                  className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: textColor }}
                >
                  {tab.text}
                </a>
              ))}

              {ctaButton && (
                <a
                  href={ctaButton.link}
                  onClick={(e) => handleNavClick(e, ctaButton.link)}
                  className="px-5 py-1.5 rounded-lg text-sm font-medium text-center transition-all cursor-pointer active:scale-95"
                  style={{
                    ...getButtonStyles(ctaButton.style),
                    filter: "brightness(1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "brightness(0.9)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                >
                  {ctaButton.text}
                </a>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );

  // Create a wrapper that includes a spacer for fixed/sticky headers
  const content = (
    <>
      {headerContent}
      {/* Spacer to prevent content from being hidden under fixed header */}
      {position === "fixed" && (
        <div className={`w-full ${spacingClasses}`} style={{ height: "auto" }} />
      )}
    </>
  );

  // Wrap with animation if configured
  if (animation && animation.type !== "none") {
    return <AnimatedSection animation={animation}>{content}</AnimatedSection>;
  }

  return content;
}
