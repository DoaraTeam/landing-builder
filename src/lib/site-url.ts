// Single source of truth for the site's public origin — used to build
// absolute URLs for metadataBase, sitemap.xml, and robots.txt. Set
// NEXT_PUBLIC_SITE_URL in production (e.g. "https://example.com", no
// trailing slash); falls back to localhost for local dev.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);
