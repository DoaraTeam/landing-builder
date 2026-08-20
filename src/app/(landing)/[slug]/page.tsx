import { Metadata } from "next";
import { notFound } from "next/navigation";
import { readBaseLandingConfig } from "@/lib/landing-config-store";
import { LandingConfig } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { ThemeProvider } from "@/components/landing/ThemeProvider";
import { LandingPageLoader } from "@/components/landing/LandingPageLoader";
import { CustomCode } from "@/components/landing/CustomCode";
import MultiPageRenderer from "@/components/landing/MultiPageRenderer";
import { getTheme } from "@/lib/themes";
import { seoConfigToMetadata } from "@/lib/seo-utils";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/site-url";

interface PageProps {
  params: {
    slug: string;
  };
}

function findPublishedPageBySlug(config: LandingConfig, slug: string) {
  return Object.values(config.pages)
    .map((entry) => entry.published)
    .find((p): p is NonNullable<typeof p> => p?.slug === slug);
}

/**
 * Generate static params for every published page's own top-level route.
 */
export async function generateStaticParams() {
  try {
    const config = await readBaseLandingConfig();

    return Object.values(config.pages)
      .filter((entry) => entry.published)
      .map((entry) => ({ slug: entry.published!.slug }));
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
    const config = await readBaseLandingConfig();
    const page = findPublishedPageBySlug(config, params.slug);

    if (!page || !page.seo) {
      return {
        title: "Page Not Found",
      };
    }

    return seoConfigToMetadata(page.seo);
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
    };
  }
}

/**
 * A page's own top-level content, at its own slug — every page gets this
 * route uniformly, there's no special "main" site anymore.
 */
export default async function SitePage({ params }: PageProps) {
  try {
    const config = await readBaseLandingConfig();
    const page = findPublishedPageBySlug(config, params.slug);

    if (!page) {
      notFound();
    }

    const theme = getTheme(page.theme || "modern", config.themes);
    const isMultiPage = (page.subPages?.length ?? 0) > 0;

    const websiteJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: page.title,
      url: `${SITE_URL}/${page.slug}`,
      ...(page.description ? { description: page.description } : {}),
    };

    if (isMultiPage) {
      return (
        <>
          <JsonLd data={websiteJsonLd} />
          <MultiPageRenderer page={page} customThemes={config.themes} />
        </>
      );
    }

    const sortedComponents = [...page.components]
      .filter((c) => c.visible !== false)
      .sort((a, b) => a.order - b.order);

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
            <CustomCode code={page.customCode} />
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
    console.error("Error rendering page:", error);
    notFound();
  }
}
