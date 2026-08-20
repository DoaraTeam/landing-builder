import { NextResponse } from "next/server";
import { readBaseLandingConfig, getPageSummaries } from "@/lib/landing-config-store";

/**
 * GET /api/landing-config/pages
 * Lightweight summaries of every page (no component trees) — used by the
 * /pages dashboard grid and the editor's File > Open picker, so listing
 * pages doesn't ship every page's full content just to show a title and date.
 */
export async function GET() {
  try {
    const config = await readBaseLandingConfig();
    return NextResponse.json({ pages: getPageSummaries(config) });
  } catch (error) {
    console.error("Error reading page summaries:", error);
    return NextResponse.json({ error: "Failed to read pages" }, { status: 500 });
  }
}
