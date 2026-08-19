import { readFile } from "fs/promises";
import { join } from "path";
import { LandingConfig } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { ThemeProvider } from "@/components/landing/ThemeProvider";
import { LandingPageLoader } from "@/components/landing/LandingPageLoader";
import MultiPageRenderer from "@/components/landing/MultiPageRenderer";
import { getTheme } from "@/lib/themes";
import { Metadata } from "next";
import { seoConfigToMetadata } from "@/lib/seo-utils";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/site-url";

/**
 * Generate metadata for SEO from published page
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const configPath = join(process.cwd(), "public/data/landing-config.json");
    const data = await readFile(configPath, "utf-8");
    const config: LandingConfig = JSON.parse(data);

    const page = config.currentLanding?.published;

    if (!page || !page.seo) {
      return {
        title: "Landing Page Builder",
        description: "Create stunning landing pages with ease",
      };
    }

    return seoConfigToMetadata(page.seo);
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Landing Page Builder",
      description: "Create stunning landing pages with ease",
    };
  }
}

export default async function PublishedPage() {
  try {
    // Read configuration
    const configPath = join(process.cwd(), "public/data/landing-config.json");
    const data = await readFile(configPath, "utf-8");
    const config: LandingConfig = JSON.parse(data);

    // Get published page
    const page = config.currentLanding?.published;

    if (!page) {
      // No published page yet
      return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">Coming Soon</h1>
            <p className="text-xl mb-8">We&apos;re working on something amazing!</p>
            <a
              href="/editor"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Go to Editor
            </a>
          </div>
        </main>
      );
    }

    // Get theme
    const theme = getTheme(page.theme || "modern", config.themes);

    // Check if multi-page (either by flag or presence of subPages)
    const isMultiPage = page.isMultiPage || (page.subPages && page.subPages.length > 0);

    const websiteJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: page.title,
      url: `${SITE_URL}/publish`,
      ...(page.description ? { description: page.description } : {}),
    };

    // If multi-page, use MultiPageRenderer
    if (isMultiPage) {
      return (
        <>
          <JsonLd data={websiteJsonLd} />
          <MultiPageRenderer page={page} customThemes={config.themes} />
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
      <>
        <JsonLd data={websiteJsonLd} />
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
      </>
    );
  } catch (error) {
    console.error("Error rendering landing page:", error);
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-600">Error Loading Page</h1>
          <p className="text-gray-600 mb-4">Something went wrong. Please try again later.</p>
          <a href="/editor" className="text-blue-600 hover:underline">
            Go to Editor
          </a>
        </div>
      </main>
    );
  }
}
