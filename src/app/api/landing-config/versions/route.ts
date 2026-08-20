import { NextRequest, NextResponse } from "next/server";
import { LandingPageVersion } from "@/types/landing";
import {
  readVersionsForPage,
  addVersionForPage,
  deleteVersionForPage,
} from "@/lib/landing-config-store";

/**
 * GET /api/landing-config/versions?pageId=X
 * Lazy — only ever called when the editor's History sidebar is opened for
 * this page, not loaded eagerly with the page's draft/published content.
 */
export async function GET(request: NextRequest) {
  try {
    const pageId = request.nextUrl.searchParams.get("pageId");
    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId parameter" }, { status: 400 });
    }

    return NextResponse.json({ versions: await readVersionsForPage(pageId) });
  } catch (error) {
    console.error("Error reading versions:", error);
    return NextResponse.json({ error: "Failed to read versions" }, { status: 500 });
  }
}

/**
 * POST /api/landing-config/versions
 * Appends one version (id/createdAt already set by the caller, same as
 * before this endpoint existed) and enforces the cap.
 * Body: { pageId: string, version: LandingPageVersion }
 */
export async function POST(request: NextRequest) {
  try {
    const body: { pageId?: string; version?: LandingPageVersion } = await request.json();
    const { pageId, version } = body;

    if (!pageId || !version) {
      return NextResponse.json({ error: "Missing pageId or version" }, { status: 400 });
    }

    return NextResponse.json({ versions: await addVersionForPage(pageId, version) });
  } catch (error) {
    console.error("Error saving version:", error);
    return NextResponse.json({ error: "Failed to save version" }, { status: 500 });
  }
}

/**
 * DELETE /api/landing-config/versions?pageId=X&versionId=Y
 */
export async function DELETE(request: NextRequest) {
  try {
    const pageId = request.nextUrl.searchParams.get("pageId");
    const versionId = request.nextUrl.searchParams.get("versionId");
    if (!pageId || !versionId) {
      return NextResponse.json({ error: "Missing pageId or versionId parameter" }, { status: 400 });
    }

    return NextResponse.json({ versions: await deleteVersionForPage(pageId, versionId) });
  } catch (error) {
    console.error("Error deleting version:", error);
    return NextResponse.json({ error: "Failed to delete version" }, { status: 500 });
  }
}
