"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ExternalLink, MoveRight } from "lucide-react";
import { landingPageTemplates } from "@/lib/landing-templates";
import { getTheme } from "@/lib/themes";
import { ComponentConfig, Theme } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { BrowserFrame } from "@/components/browser-frame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

// Pick a few templates that show off different categories, each with a distinct
// built-in theme so the previews don't all look the same shade of blue.
const FEATURED_TEMPLATES = [
  { templateId: "modern-business", themeId: "modern" },
  { templateId: "saas-product", themeId: "tech" },
  { templateId: "agency-creative", themeId: "vibrant" },
] as const;

// Mirrors applyTheme()'s CSS variables, but scoped to a wrapper element instead
// of the whole document — several previews with different themes render at once.
function themeStyleVars(theme: Theme): CSSProperties {
  return {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-accent": theme.colors.accent,
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-text": theme.colors.text,
    "--color-text-muted": theme.colors.textMuted,
    "--font-heading": theme.fonts.heading,
    "--font-body": theme.fonts.body,
    "--border-radius": theme.borderRadius,
  } as CSSProperties;
}

// The rendered content is laid out at 1/PREVIEW_SCALE % width so it always
// spans the full (responsive) card width once scaled back down.
const PREVIEW_SCALE = 0.3;

export function TemplateShowcase() {
  const router = useRouter();

  const previews = FEATURED_TEMPLATES.map(({ templateId, themeId }) => {
    const template = landingPageTemplates.find((t) => t.id === templateId);
    if (!template) return null;

    const components: ComponentConfig[] = template.components.map((component, index) => ({
      ...component,
      id: `${template.id}-${index}`,
      order: index,
    }));

    return {
      template,
      themeId,
      theme: getTheme(themeId),
      components: components.filter((c) => c.visible !== false).sort((a, b) => a.order - b.order),
    };
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <section id="templates" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Templates
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
            Start from a template
          </h2>
          <p className="text-muted-foreground mt-3">
            Real templates, rendered live — pick one and make it yours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {previews.map(({ template, themeId, theme, components }, index) => (
            <motion.div
              key={template.id}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="overflow-hidden rounded-2xl border bg-background shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: theme.colors.primary }} />

              <div className="relative p-3">
                {/* Rendered template components may include their own <a>/<button> elements
                    (nav links, CTAs) — those must never end up nested inside the Link below,
                    which is why the Link is a sibling overlay instead of a wrapper. */}
                <BrowserFrame url="yoursite.com">
                  <div className="pointer-events-none relative h-[280px] w-full overflow-hidden bg-muted/20">
                    <div
                      className="absolute left-0 top-0 origin-top-left"
                      style={{
                        width: `${100 / PREVIEW_SCALE}%`,
                        transform: `scale(${PREVIEW_SCALE})`,
                        ...themeStyleVars(theme),
                      }}
                    >
                      {components.map((component) => (
                        <ComponentRenderer key={component.id} component={component} theme={theme} />
                      ))}
                    </div>
                  </div>
                </BrowserFrame>

                <Link
                  href={`/preview-template/${template.id}?theme=${themeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-3 z-10 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/20 hover:opacity-100"
                >
                  <span className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium shadow-md">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview {template.name}
                  </span>
                </Link>
              </div>

              <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-1">
                <div>
                  <p className="font-semibold">{template.name}</p>
                  <Badge variant="secondary" className="mt-1.5 capitalize">
                    {template.category}
                  </Badge>
                </div>
                <Button size="sm" className="gap-1" onClick={() => router.push("/editor")}>
                  Use this <MoveRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
