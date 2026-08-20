import type { MetadataRoute } from "next";
import { readBaseLandingConfig } from "@/lib/landing-config-store";
import { SITE_URL } from "@/lib/site-url";

// Only the actual customer-facing site is listed here — not "/", which is
// this tool's own marketing/intro page (see src/components/builder-intro.tsx),
// and not internal routes like /editor or /preview.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  const config = await readBaseLandingConfig().catch(() => null);
  if (!config) return entries;

  // Every page is equal — each gets its own top-level route, plus one per
  // sub-page. A page with no published copy yet has nothing publicly
  // reachable to list.
  for (const entry of Object.values(config.pages)) {
    const page = entry.published;
    if (!page) continue;

    entries.push({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: page.updatedAt,
    });

    for (const subPage of page.subPages ?? []) {
      if (subPage.visible === false) continue;
      entries.push({
        url: `${SITE_URL}/${page.slug}/${subPage.slug}`,
        lastModified: page.updatedAt,
      });
    }
  }

  return entries;
}
