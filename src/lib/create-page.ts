import { LandingPage } from "@/types/landing";
import { LandingPageTemplate } from "@/lib/landing-templates";

/** Shared by the editor (File > New, Layout > Change Template) and the
 * /pages dashboard's "+" card, so both build a page the same way. Every page
 * starts with no sub-pages — whether it ends up "multi-page" is purely
 * derived later from whether sub-pages get added, not chosen up front. */
export function buildPageFromTemplate(template: LandingPageTemplate, id: string): LandingPage {
  return {
    id,
    title: template.name,
    description: template.description,
    slug: template.id,
    theme: "modern",
    seo: {
      metaTitle: template.name,
      metaDescription: template.description,
      keywords: [],
    },
    components: template.components.map((comp, idx) => ({
      ...comp,
      id: `comp-${Date.now()}-${idx}`,
      order: idx + 1,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft",
    subPages: [],
  };
}

/** POSTs a brand new page built from a template. Returns its id, or null on failure. */
export async function createPage(
  template: LandingPageTemplate
): Promise<{ pageId: string; page: LandingPage } | null> {
  const pageId = `page-${Date.now()}`;
  const page = buildPageFromTemplate(template, pageId);

  const response = await fetch("/api/landing-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageId, draft: page }),
  });

  return response.ok ? { pageId, page } : null;
}
