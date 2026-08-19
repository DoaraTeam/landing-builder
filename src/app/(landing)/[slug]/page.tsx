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
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/site-url";

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

    // A sub-page with its own SEOConfig is fully independent — the user has
    // already set title/description/robots/canonical/OG/Twitter/etc.
    // themselves, so no fallback/override is needed.
    if (subPage.seo) {
      return seoConfigToMetadata(subPage.seo);
    }

    // Older sub-pages (created before per-page SEO existed) have no seo of
    // their own — inherit the parent page's SEOConfig as a base, overridden
    // with subpage-specific title/description, same as before.
    const baseMetadata = publishedPage.seo ? seoConfigToMetadata(publishedPage.seo) : {};

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

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: publishedPage.title,
          item: `${SITE_URL}/publish`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: subPage.title,
          item: `${SITE_URL}/${subPage.slug}`,
        },
      ],
    };

    return (
      <>
        <JsonLd data={breadcrumbJsonLd} />
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
    console.error("Error rendering sub-page:", error);
    notFound();
  }
}
