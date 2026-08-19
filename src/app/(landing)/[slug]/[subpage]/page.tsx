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
    subpage: string;
  };
}

/**
 * Generate static params for all subpages at build time
 */
export async function generateStaticParams() {
  try {
    const configPath = join(process.cwd(), "public/data/landing-config.json");
    const data = await readFile(configPath, "utf-8");
    const config: LandingConfig = JSON.parse(data);

    const params: Array<{ slug: string; subpage: string }> = [];

    // Iterate through all pages and their subpages
    Object.values(config.pages).forEach((page) => {
      if (page.subPages && page.subPages.length > 0) {
        page.subPages.forEach((subPage) => {
          if (subPage.visible !== false) {
            params.push({
              slug: page.slug,
              subpage: subPage.slug,
            });
          }
        });
      }
    });

    return params;
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

    const page = Object.values(config.pages).find((p) => p.slug === params.slug);

    if (!page) {
      return {
        title: "Page Not Found",
      };
    }

    const subPage = page.subPages?.find((sp) => sp.slug === params.subpage);

    if (!subPage) {
      return {
        title: "Page Not Found",
      };
    }

    // A sub-page with its own SEOConfig is fully independent — no
    // fallback/override needed.
    if (subPage.seo) {
      return seoConfigToMetadata(subPage.seo);
    }

    // Older sub-pages (created before per-page SEO existed) inherit the
    // parent page's SEOConfig as a base, overridden with subpage-specific
    // title/description, same as before.
    const baseMetadata = page.seo ? seoConfigToMetadata(page.seo) : {};

    return {
      ...baseMetadata,
      title: `${subPage.title} - ${page.title}`,
      description: subPage.description || page.seo?.metaDescription || "",
      openGraph: {
        ...baseMetadata.openGraph,
        title: `${subPage.title} - ${page.title}`,
        description: subPage.description || page.seo?.metaDescription || "",
      },
      twitter: {
        ...baseMetadata.twitter,
        title: `${subPage.title} - ${page.title}`,
        description: subPage.description || page.seo?.metaDescription || "",
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
 * Subpage component (Server-side rendered)
 */
export default async function SubPage({ params }: PageProps) {
  try {
    // Read configuration
    const configPath = join(process.cwd(), "public/data/landing-config.json");
    const data = await readFile(configPath, "utf-8");
    const config: LandingConfig = JSON.parse(data);

    // Find parent page by slug
    const page = Object.values(config.pages).find((p) => p.slug === params.slug);

    if (!page) {
      notFound();
    }

    // Find subpage
    const subPage = page.subPages?.find((sp) => sp.slug === params.subpage);

    if (!subPage || subPage.visible === false) {
      notFound();
    }

    // Get theme from themes.ts
    const theme = getTheme(page.theme || "modern", config.themes);

    // Sort components by order and filter visible ones
    const sortedComponents = [...subPage.components]
      .filter((c) => c.visible !== false)
      .sort((a, b) => a.order - b.order);

    // Get loading configuration from parent page
    const loadingConfig = page.loading || {
      enabled: false,
      type: "spin" as const,
      color: "#f97316",
      duration: 1000,
      minDuration: 500,
    };

    // Legacy pages (unlike the current-landing model) have no route of their
    // own at just /{slug} — only /{slug}/{subpage} — so there's no real URL
    // for a "page root" crumb to point to. Only the reachable page is listed.
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: `${page.title} – ${subPage.title}`,
          item: `${SITE_URL}/${page.slug}/${subPage.slug}`,
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
    console.error("Error rendering subpage:", error);
    notFound();
  }
}
