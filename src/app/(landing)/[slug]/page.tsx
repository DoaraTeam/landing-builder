import { Metadata } from "next";
import { readFile } from "fs/promises";
import { join } from "path";
import { notFound } from "next/navigation";
import { LandingConfig } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { ThemeProvider } from "@/components/landing/ThemeProvider";
import { LandingPageLoader } from "@/components/landing/LandingPageLoader";
import { getTheme } from "@/lib/themes";
import { seoConfigToMetadata } from "@/lib/seo-utils";

interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate static params for all sub-pages at build time
 */
export async function generateStaticParams() {
  try {
    const configPath = join(process.cwd(), "public/data/landing-config.json");
    const data = await readFile(configPath, "utf-8");
    const config: LandingConfig = JSON.parse(data);

    const publishedPage = config.currentLanding?.published;

    if (!publishedPage || !publishedPage.isMultiPage || !publishedPage.subPages) {
      return [];
    }

    return publishedPage.subPages.map((subPage) => ({
      slug: subPage.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const configPath = join(process.cwd(), "public/data/landing-config.json");
    const data = await readFile(configPath, "utf-8");
    const config: LandingConfig = JSON.parse(data);

    const publishedPage = config.currentLanding?.published;

    if (!publishedPage || !publishedPage.isMultiPage || !publishedPage.subPages) {
      return {
        title: "Page Not Found",
      };
    }

    const subPage = publishedPage.subPages.find((p) => p.slug === params.slug);

    if (!subPage) {
      return {
        title: "Page Not Found",
      };
    }

    // Use parent page SEO config as base
    const baseMetadata = publishedPage.seo ? seoConfigToMetadata(publishedPage.seo) : {};

    // Override with subpage specific info
    return {
      ...baseMetadata,
      title: `${subPage.title} - ${publishedPage.title}`,
      description: subPage.description || publishedPage.seo?.metaDescription || "",
      openGraph: {
        ...baseMetadata.openGraph,
        title: `${subPage.title} - ${publishedPage.title}`,
        description: subPage.description || publishedPage.seo?.metaDescription || "",
      },
      twitter: {
        ...baseMetadata.twitter,
        title: `${subPage.title} - ${publishedPage.title}`,
        description: subPage.description || publishedPage.seo?.metaDescription || "",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
    };
  }
}

/**
 * Sub-page component for multi-page landing (Server-side rendered)
 */
export default async function SubPage({ params }: PageProps) {
  try {
    // Read configuration
    const configPath = join(process.cwd(), "public/data/landing-config.json");
    const data = await readFile(configPath, "utf-8");
    const config: LandingConfig = JSON.parse(data);

    // Get published page
    const publishedPage = config.currentLanding?.published;

    if (!publishedPage) {
      notFound();
    }

    // If not multi-page, redirect to home
    if (!publishedPage.isMultiPage || !publishedPage.subPages) {
      notFound();
    }

    // Find sub-page by slug
    const subPage = publishedPage.subPages.find((p) => p.slug === params.slug);

    if (!subPage) {
      notFound();
    }

    // Get theme
    const theme = getTheme(publishedPage.theme || "modern", config.themes);

    // Sort components by order and filter visible ones
    const sortedComponents = [...subPage.components]
      .filter((c) => c.visible !== false)
      .sort((a, b) => a.order - b.order);

    // Get loading configuration from main page
    const loadingConfig = publishedPage.loading || {
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
          <main className="min-h-screen">
            {sortedComponents.map((component) => (
              <ComponentRenderer key={component.id} component={component} theme={theme} />
            ))}
          </main>
        </LandingPageLoader>
      </ThemeProvider>
    );
  } catch (error) {
    console.error("Error rendering sub-page:", error);
    notFound();
  }
}
