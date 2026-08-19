import type { MetadataRoute } from "next";
import { readFile } from "fs/promises";
import { join } from "path";
import { LandingConfig } from "@/types/landing";
import { SITE_URL } from "@/lib/site-url";

// Only the actual customer-facing site is listed here — not "/", which is
// this tool's own marketing/intro page (see src/components/builder-intro.tsx),
// and not internal routes like /editor or /preview.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const configPath = join(process.cwd(), "public/data/landing-config.json");
  const entries: MetadataRoute.Sitemap = [];

  let config: LandingConfig;
  try {
    config = JSON.parse(await readFile(configPath, "utf-8"));
  } catch {
    return entries;
  }

  const published = config.currentLanding?.published;

  if (published) {
    entries.push({
      url: `${SITE_URL}/publish`,
      lastModified: published.updatedAt,
    });

    // The /[slug] route doesn't filter hidden sub-pages itself (unlike the
    // legacy route below), so the sitemap has to apply that filter itself.
    for (const subPage of published.subPages ?? []) {
      if (subPage.visible === false) continue;
      entries.push({
        url: `${SITE_URL}/${subPage.slug}`,
        lastModified: published.updatedAt,
      });
    }
  }

  // Legacy pages map — only reachable via /[slug]/[subpage], matching how
  // that route itself filters (see generateStaticParams there).
  for (const page of Object.values(config.pages ?? {})) {
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
