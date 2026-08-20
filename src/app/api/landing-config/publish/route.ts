import { NextRequest, NextResponse } from "next/server";
import {
  readBaseLandingConfig,
  writeBaseLandingConfig,
  getPageEntry,
  publishPage,
} from "@/lib/landing-config-store";

/**
 * POST /api/landing-config/publish
 * Copies one page's draft into its own published slot — every page is an
 * independent project, so publishing one never affects any other page.
 * Body: { pageId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { pageId }: { pageId?: string } = await request.json();
    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
    }

    const config = await readBaseLandingConfig();
    if (!getPageEntry(config, pageId)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const updated = publishPage(config, pageId);
    await writeBaseLandingConfig(updated);

    return NextResponse.json({ success: true, page: updated.pages[pageId] });
  } catch (error) {
    console.error("Error publishing page:", error);
    return NextResponse.json({ error: "Failed to publish page" }, { status: 500 });
  }
}
