"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ComponentConfig, LandingConfig } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { ThemeProvider } from "@/components/landing/ThemeProvider";
import { LandingPageLoader } from "@/components/landing/LandingPageLoader";
import { getTheme } from "@/lib/themes";

function Message({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">{description}</p>
        <a href="/editor" className="text-blue-600 hover:underline">
          Go to Editor
        </a>
      </div>
    </div>
  );
}

/**
 * Client-fetched, client-rendered preview: saves the whole site (from the
 * editor's Preview button), then shows the current draft here from data it
 * fetches itself. Nav links to sub-pages are intercepted and just swap
 * `?path=` instead of doing a real navigation, since the real production
 * route for a sub-page that was never published wouldn't exist (or would
 * show stale content) — the preview never has to touch that route at all.
 */
export function PreviewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const path = searchParams.get("path") || "";

  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/landing-config")
      .then((r) => r.json())
      .then((data: LandingConfig) => {
        setConfig(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching preview data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => setLoading(false));
  }, [pageId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading preview...
      </div>
    );
  }

  if (error) {
    return <Message title="Preview Error" description={`Failed to load the preview: ${error}`} />;
  }

  if (!pageId) {
    return <Message title="No Page Specified" description="This preview link is missing a page." />;
  }

  const entry = config?.pages[pageId];
  const page = entry?.draft;

  if (!page) {
    return (
      <Message
        title="No Draft Available"
        description="Please create a landing page in the editor first."
      />
    );
  }

  const activeSubPage = path ? page.subPages?.find((sp) => sp.slug === path) : null;

  if (path && !activeSubPage) {
    return (
      <Message title="Sub-page Not Found" description={`"${path}" doesn't exist on this page.`} />
    );
  }

  const components: ComponentConfig[] = activeSubPage ? activeSubPage.components : page.components;

  if (!components || components.length === 0) {
    return <Message title="Empty Page" description="This page doesn't have any components yet." />;
  }

  const theme = getTheme(page.theme || "modern", config?.themes);
  const sortedComponents = [...components]
    .filter((c) => c.visible !== false)
    .sort((a, b) => a.order - b.order);

  const loadingConfig = page.loading || {
    enabled: false,
    type: "spin" as const,
    color: "#f97316",
    duration: 1000,
    minDuration: 500,
  };

  // Intercept clicks on internal nav links (uniform "/{pageSlug}/{subSlug}"
  // or "/{pageSlug}" format) and swap the preview's own path instead of
  // letting the browser navigate to the real (possibly unpublished)
  // production route. Anything else (external links, scroll anchors) is
  // left completely alone.
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest("a");
    const href = anchor?.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const homeHref = `/${page.slug}`;
    if (href === homeHref) {
      e.preventDefault();
      router.push(`/preview?pageId=${pageId}`);
      return;
    }

    if (href.startsWith(`${homeHref}/`)) {
      const subSlug = href.slice(homeHref.length + 1);
      if (page.subPages?.some((sp) => sp.slug === subSlug)) {
        e.preventDefault();
        router.push(`/preview?pageId=${pageId}&path=${subSlug}`);
      }
    }
  };

  const bannerLabel = activeSubPage ? `${page.title} – ${activeSubPage.title}` : page.title;

  return (
    <div onClick={handleClick}>
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white py-2 px-4 text-center text-sm">
        <strong>Preview Mode</strong> - {bannerLabel} - This is how your landing page will look when
        published
      </div>
      <div style={{ marginTop: "40px" }}>
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
      </div>
    </div>
  );
}
