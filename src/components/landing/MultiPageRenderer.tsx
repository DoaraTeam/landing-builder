"use client";

import { LandingPage, Theme } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { ThemeProvider } from "@/components/landing/ThemeProvider";
import { LandingPageLoader } from "@/components/landing/LandingPageLoader";
import { MultiPageNav } from "@/components/landing/MultiPageNav";
import { CustomCode } from "@/components/landing/CustomCode";
import { getTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface MultiPageRendererProps {
  page: LandingPage;
  customThemes?: Record<string, Theme>;
}

export default function MultiPageRenderer({ page, customThemes }: MultiPageRendererProps) {
  const theme = getTheme(page.theme || "modern", customThemes);

  // Sort and filter components
  const sortedComponents = [...page.components]
    .filter((c) => c.visible !== false)
    .sort((a, b) => a.order - b.order);

  // Get loading configuration
  const loadingConfig = page.loading || {
    enabled: false,
    type: "spin" as const,
    color: "#f97316",
    duration: 1000,
    minDuration: 500,
  };

  return (
    <ThemeProvider theme={theme}>
      <LandingPageLoader
        enabled={loadingConfig.enabled}
        type={loadingConfig.type}
        color={loadingConfig.color || "#f97316"}
        duration={loadingConfig.duration || 1000}
        minDuration={loadingConfig.minDuration || 500}
      >
        <CustomCode code={page.customCode} />
        <MultiPageNav page={page} activePageId="main" theme={theme} />
        <main
          className={cn(
            "min-h-screen",
            page.navigation?.style === "sidebar" &&
              (page.navigation.position === "right" ? "mr-64" : "ml-64")
          )}
        >
          {sortedComponents.map((component) => (
            <ComponentRenderer key={component.id} component={component} theme={theme} />
          ))}
        </main>
      </LandingPageLoader>
    </ThemeProvider>
  );
}
