import { Metadata } from "next";
import { readFile } from "fs/promises";
import { join } from "path";
import { LandingConfig } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { ThemeProvider } from "@/components/landing/ThemeProvider";
import { LandingPageLoader } from "@/components/landing/LandingPageLoader";
import MultiPageRenderer from "@/components/landing/MultiPageRenderer";
import { getTheme } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Preview - Landing Page",
  description: "Preview your landing page before publishing",
};

/**
 * Preview page - Shows the draft version before publishing
 */
export default async function PreviewPage() {
  try {
    // Read configuration
    const configPath = join(process.cwd(), "public/data/landing-config.json");
    const data = await readFile(configPath, "utf-8");
    const config: LandingConfig = JSON.parse(data);

    // Get draft page
    const page = config.currentLanding?.draft;

    if (!page) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">No Draft Available</h1>
            <p className="text-gray-600 mb-4">Please create a landing page in the editor first.</p>
            <a href="/editor" className="text-blue-600 hover:underline">
              Go to Editor
            </a>
          </div>
        </div>
      );
    }

    // Validate page has components
    if (!page.components || page.components.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Empty Page</h1>
            <p className="text-gray-600 mb-4">This page doesn&apos;t have any components yet.</p>
            <a href="/editor" className="text-blue-600 hover:underline">
              Go to Editor
            </a>
          </div>
        </div>
      );
    }

    // Get theme
    const theme = getTheme(page.theme || "modern", config.themes);

    // Check if multi-page (either by flag or presence of subPages)
    const isMultiPage = page.isMultiPage || (page.subPages && page.subPages.length > 0);

    // If multi-page, use MultiPageRenderer
    if (isMultiPage) {
      return (
        <>
          <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white py-2 px-4 text-center text-sm">
            <strong>Preview Mode</strong> - {page.title} (
            {page.isMultiPage ? "Multi-Page" : "Single-Page"}) - This is how your landing page will
            look when published
          </div>
          <div style={{ marginTop: "40px" }}>
            <MultiPageRenderer page={page} customThemes={config.themes} />
          </div>
        </>
      );
    }

    // Single page - sort components and filter visible ones
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white py-2 px-4 text-center text-sm">
          <strong>Preview Mode</strong> - {page.title} - This is how your landing page will look
          when published
        </div>
        <div style={{ marginTop: "40px" }}>
          <LandingPageLoader
            enabled={loadingConfig.enabled}
            type={loadingConfig.type}
            color={loadingConfig.color || "#f97316"}
            duration={loadingConfig.duration || 1000}
            minDuration={loadingConfig.minDuration || 500}
          >
            <main className="min-h-screen">
              {sortedComponents.map((component) => (
                <ComponentRenderer key={component.id} component={component} theme={theme} />
              ))}
            </main>
          </LandingPageLoader>
        </div>
      </ThemeProvider>
    );
  } catch (error) {
    console.error("Error rendering preview:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-red-600">Preview Error</h1>
          <p className="text-gray-600 mb-4">
            Failed to load the preview. Please check the console for details.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <a href="/editor" className="text-blue-600 hover:underline">
            Go to Editor
          </a>
        </div>
      </div>
    );
  }
}
