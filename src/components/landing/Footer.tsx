"use client";

import { Theme, FooterConfig } from "@/types/landing";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github } from "lucide-react";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { SmartImage } from "@/components/ui/smart-image";

interface FooterProps {
  config: FooterConfig;
  theme?: Theme;
}

export function Footer({ config }: FooterProps) {
  const { logo, tagline, description, columns, links, social, copyright } = config;

  // Support both 'columns' and 'links' keys
  const footerColumns = columns || links || [];
  const footerDescription = description || tagline;

  // Get background and spacing with defaults
  const background = config.background || { type: "solid", color: "#0f172a" };
  const spacing = config.spacing || { padding: "xl", margin: "none" };

  // Use CSS variables for theme colors
  const textColor = "var(--color-text)";
  const textMuted = "var(--color-text-muted)";
  const bgColor = "var(--color-background)";

  const getBackgroundColor = () => {
    if (background?.type === "solid") {
      if (background?.color === "background") return bgColor;
      return background?.color;
    }
    return "#0f172a";
  };

  const isDark = background?.color === "#0f172a" || background?.color?.startsWith("#0");
  const finalTextColor = isDark ? "#f1f5f9" : textColor;
  const finalTextMuted = isDark ? "#94a3b8" : textMuted;

  const paddingClass = spacing?.padding === "xl" ? "py-16" : "py-12";

  // Get animation from config, default to 'none' for footer
  const animation = config.animation || { type: "none" as const, duration: 0, delay: 0 };

  const getSocialIcon = (platform: string) => {
    const iconClass = "h-5 w-5";
    switch (platform) {
      case "facebook":
        return <Facebook className={iconClass} />;
      case "twitter":
        return <Twitter className={iconClass} />;
      case "instagram":
        return <Instagram className={iconClass} />;
      case "linkedin":
        return <Linkedin className={iconClass} />;
      case "youtube":
        return <Youtube className={iconClass} />;
      case "github":
        return <Github className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <AnimatedSection animation={animation}>
      <footer className={`${paddingClass} px-4`} style={{ backgroundColor: getBackgroundColor() }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2">
              {logo && (
                <div className="mb-4">
                  {logo.image ? (
                    <SmartImage
                      src={logo.image}
                      alt={logo.text || "Logo"}
                      width={160}
                      height={32}
                      className="h-8 w-auto"
                    />
                  ) : logo.text ? (
                    <div className="text-xl font-bold" style={{ color: finalTextColor }}>
                      {logo.text}
                    </div>
                  ) : null}
                </div>
              )}

              {footerDescription && (
                <p className="text-base mb-6" style={{ color: finalTextMuted }}>
                  {footerDescription}
                </p>
              )}

              {social && social.length > 0 && (
                <div className="flex gap-4">
                  {social.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url || link.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: finalTextMuted }}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {footerColumns?.map((column) => {
              // Support both 'items' and 'links' keys in columns
              const columnLinks = column.items || column.links || [];

              return (
                <div key={column.id || column.title}>
                  <h3 className="font-semibold mb-4" style={{ color: finalTextColor }}>
                    {column.title}
                  </h3>
                  <ul className="space-y-2">
                    {columnLinks?.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link.link}
                          className="hover:opacity-70 transition-opacity"
                          style={{ color: finalTextMuted }}
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {copyright && (
            <div className="pt-8 border-t" style={{ borderColor: isDark ? "#1e293b" : "#e5e7eb" }}>
              <p className="text-center text-sm" style={{ color: finalTextMuted }}>
                {copyright}
              </p>
            </div>
          )}
        </div>
      </footer>
    </AnimatedSection>
  );
}
