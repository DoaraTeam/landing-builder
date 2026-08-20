import { NextRequest, NextResponse } from "next/server";
import { LandingConfig, LandingPage } from "@/types/landing";
import {
  readBaseLandingConfig,
  writeBaseLandingConfig,
  getPageEntry,
  upsertPageDraft,
  renamePage,
  deletePage,
} from "@/lib/landing-config-store";

/**
 * GET /api/landing-config
 * GET /api/landing-config?pageId=X
 * Fetch the config (themes + navigation/metadata — no version history,
 * that's a separate lazy endpoint). With `pageId`, `pages` is trimmed down
 * to just that one page's entry — the editor and preview only ever work on
 * one page at a time, so there's no reason to ship every other page's full
 * draft/published component tree (images included) along with it. Anything
 * that needs every page's slug for a uniqueness check should use the
 * lightweight `/api/landing-config/pages` endpoint instead. Omit `pageId` to
 * get the untrimmed `pages` map (e.g. for tooling that genuinely needs it).
 */
export async function GET(request: NextRequest) {
  try {
    const config = await readBaseLandingConfig();
    const pageId = request.nextUrl.searchParams.get("pageId");

    if (pageId) {
      const entry = config.pages[pageId];
      return NextResponse.json({
        ...config,
        pages: entry ? { [pageId]: entry } : {},
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading landing config:", error);
    return NextResponse.json({ error: "Failed to read configuration" }, { status: 500 });
  }
}

/**
 * POST /api/landing-config
 * Create or update one page's draft content. `name` only matters when
 * creating a new page — it seeds the project's own name (defaulting to the
 * draft's title if omitted); ignored for an update to an existing page.
 * Body: { pageId: string, draft: LandingPage, name?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body: { pageId?: string; draft?: LandingPage; name?: string } = await request.json();
    const { pageId, draft, name } = body;

    if (!pageId || !draft) {
      return NextResponse.json({ error: "Missing pageId or draft" }, { status: 400 });
    }

    const config: LandingConfig = await readBaseLandingConfig();
    const updated = upsertPageDraft(config, pageId, draft, name);
    updated.metadata = {
      ...updated.metadata,
      lastUpdated: new Date().toISOString(),
      totalPages: Object.keys(updated.pages).length,
    };

    await writeBaseLandingConfig(updated);

    return NextResponse.json({ success: true, page: updated.pages[pageId] });
  } catch (error) {
    console.error("Error saving landing config:", error);
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
  }
}

/**
 * PATCH /api/landing-config
 * Rename a project — only its own identity, never draft/published content,
 * so no save-then-publish cycle needed. Lighter than POST since the caller
 * (e.g. the /pages dashboard) only has a PageSummary, not the full draft.
 * Body: { pageId: string, name: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body: { pageId?: string; name?: string } = await request.json();
    const { pageId, name } = body;

    if (!pageId || !name?.trim()) {
      return NextResponse.json({ error: "Missing pageId or name" }, { status: 400 });
    }

    const config = await readBaseLandingConfig();
    if (!getPageEntry(config, pageId)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const updated = renamePage(config, pageId, name.trim());
    await writeBaseLandingConfig(updated);

    return NextResponse.json({ success: true, page: updated.pages[pageId] });
  } catch (error) {
    console.error("Error renaming page:", error);
    return NextResponse.json({ error: "Failed to rename page" }, { status: 500 });
  }
}

/**
 * DELETE /api/landing-config?pageId=X
 * Remove a page entirely.
 */
export async function DELETE(request: NextRequest) {
  try {
    const pageId = request.nextUrl.searchParams.get("pageId");
    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId parameter" }, { status: 400 });
    }

    const config = await readBaseLandingConfig();
    if (!getPageEntry(config, pageId)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await writeBaseLandingConfig(deletePage(config, pageId));

    return NextResponse.json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
