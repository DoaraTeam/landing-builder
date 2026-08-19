import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal/tool routes — never meant to be indexed. /publish and the
      // /[slug]* customer-site routes are left implicitly allowed.
      disallow: ["/editor", "/editor/*", "/preview", "/preview-template/*", "/api/*"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
