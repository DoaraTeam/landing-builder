import { NextRequest, NextResponse } from "next/server";
import { Theme } from "@/types/landing";
import {
  readBaseLandingConfig,
  writeBaseLandingConfig,
  upsertTheme,
} from "@/lib/landing-config-store";

/**
 * POST /api/landing-config/themes
 * Create or update one custom theme. Themes are global (shared across every
 * page), so this is its own endpoint rather than riding along on a
 * page-scoped save.
 * Body: { themeId: string, theme: Theme }
 */
export async function POST(request: NextRequest) {
  try {
    const body: { themeId?: string; theme?: Theme } = await request.json();
    const { themeId, theme } = body;

    if (!themeId || !theme) {
      return NextResponse.json({ error: "Missing themeId or theme" }, { status: 400 });
    }

    const config = await readBaseLandingConfig();
    await writeBaseLandingConfig(upsertTheme(config, themeId, theme));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving custom theme:", error);
    return NextResponse.json({ error: "Failed to save custom theme" }, { status: 500 });
  }
}
