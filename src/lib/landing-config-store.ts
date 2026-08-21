import type {
  LandingConfig,
  LandingPage,
  LandingPageVersion,
  PageEntry,
  PageSummary,
  Theme,
} from "@/types/landing";

const CONFIG_KEY = "landing-config";
const VERSIONS_KEY = "landing-config-versions";

// Version history entries are full page-tree snapshots (no diffing), so an
// unbounded history grows the versions file — and every read of it —
// linearly forever. Cap keeps it bounded to a generous but finite window.
export const MAX_STORED_VERSIONS = 30;

/**
 * Keeps only the `max` most recently created versions. Pure — does not
 * mutate its input, and sorts by `createdAt` rather than assuming input
 * order, so it's correct regardless of how the caller accumulated versions.
 */
export function capVersions(
  versions: LandingPageVersion[],
  max: number = MAX_STORED_VERSIONS
): LandingPageVersion[] {
  if (versions.length <= max) return versions;
  return [...versions].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-max);
}

/** Pure: append one version and enforce the cap in one step. */
export function withVersionAdded(
  versions: LandingPageVersion[],
  version: LandingPageVersion,
  max: number = MAX_STORED_VERSIONS
): LandingPageVersion[] {
  return capVersions([...versions, version], max);
}

/** Pure: remove one version by id. */
export function withVersionRemoved(
  versions: LandingPageVersion[],
  versionId: string
): LandingPageVersion[] {
  return versions.filter((v) => v.id !== versionId);
}

/** Lightweight projection of every page for the /pages dashboard grid, newest-first. */
export function getPageSummaries(config: LandingConfig): PageSummary[] {
  return Object.values(config.pages)
    .map((entry) => ({
      id: entry.id,
      title: entry.name,
      description: entry.draft.description,
      slug: entry.draft.slug,
      isMultiPage: (entry.draft.subPages?.length ?? 0) > 0,
      status: entry.draft.status,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      isPublished: entry.published !== null,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPageEntry(config: LandingConfig, pageId: string): PageEntry | null {
  return config.pages[pageId] ?? null;
}

/**
 * Pure: create-or-update a page's draft content, bumping `updatedAt`. On
 * first creation, the project's `name` defaults to the draft's own title
 * (override via `name` — e.g. "Make a Copy" naming the new project after the
 * original without renaming the copied content's own title) — after
 * creation they only diverge once someone renames the project independently.
 */
export function upsertPageDraft(
  config: LandingConfig,
  pageId: string,
  draft: LandingPage,
  name?: string
): LandingConfig {
  const existing = config.pages[pageId];
  const now = new Date().toISOString();
  const entry: PageEntry = existing
    ? { ...existing, draft, updatedAt: now }
    : {
        id: pageId,
        name: name ?? draft.title,
        draft,
        published: null,
        activeVersionId: null,
        createdAt: now,
        updatedAt: now,
      };
  return { ...config, pages: { ...config.pages, [pageId]: entry } };
}

/**
 * Pure: rename a project. Only touches its own identity (`name`) — never the
 * draft/published content, so this needs no save-then-publish cycle. No-op
 * if the page doesn't exist.
 */
export function renamePage(config: LandingConfig, pageId: string, name: string): LandingConfig {
  const existing = config.pages[pageId];
  if (!existing) return config;
  return {
    ...config,
    pages: {
      ...config.pages,
      [pageId]: { ...existing, name, updatedAt: new Date().toISOString() },
    },
  };
}

/** Pure: copy a page's draft into its own published slot. No-op if the page doesn't exist. */
export function publishPage(config: LandingConfig, pageId: string): LandingConfig {
  const existing = config.pages[pageId];
  if (!existing) return config;
  const now = new Date().toISOString();
  return {
    ...config,
    pages: {
      ...config.pages,
      [pageId]: { ...existing, published: existing.draft, publishedAt: now },
    },
  };
}

/** Pure: create-or-update one custom theme (a global, cross-page concern). */
export function upsertTheme(config: LandingConfig, themeId: string, theme: Theme): LandingConfig {
  return { ...config, themes: { ...config.themes, [themeId]: theme } };
}

/** Pure: remove a page entirely. */
export function deletePage(config: LandingConfig, pageId: string): LandingConfig {
  const pages = { ...config.pages };
  delete pages[pageId];
  return { ...config, pages };
}

// The @/lib/redis import is dynamic (not a static top-level import) so that
// importing this module's pure functions — which is all
// landing-config-store.test.ts does — never pulls in @upstash/redis. That
// package ships an ESM-only dependency (uncrypto) that Jest's default
// transform can't parse; a static import would break the pure-function
// tests just by loading the module, even though they never call these I/O
// functions.

/** Reads the config (every page's draft/published — no version history)
 * from Redis. No local cache: each serverless invocation is a fresh
 * process, so an in-memory cache never survives long enough to pay for
 * itself the way it did with a shared local file. */
export async function readBaseLandingConfig(): Promise<LandingConfig> {
  const { redis } = await import("@/lib/redis");
  const config = await redis.get<LandingConfig>(CONFIG_KEY);
  if (!config) {
    throw new Error(`Landing config not found in Redis under key "${CONFIG_KEY}"`);
  }
  return config;
}

/** Persists the config to Redis. */
export async function writeBaseLandingConfig(config: LandingConfig): Promise<void> {
  const { redis } = await import("@/lib/redis");
  await redis.set(CONFIG_KEY, config);
}

type VersionsFile = Record<string, LandingPageVersion[]>;

async function readVersionsFile(): Promise<VersionsFile> {
  const { redis } = await import("@/lib/redis");
  const file = await redis.get<VersionsFile>(VERSIONS_KEY);
  return file ?? {};
}

async function writeVersionsFile(file: VersionsFile): Promise<void> {
  const { redis } = await import("@/lib/redis");
  await redis.set(VERSIONS_KEY, file);
}

/** Lazy — only ever called when the editor's History sidebar is opened for this page. */
export async function readVersionsForPage(pageId: string): Promise<LandingPageVersion[]> {
  const file = await readVersionsFile();
  return file[pageId] ?? [];
}

export async function addVersionForPage(
  pageId: string,
  version: LandingPageVersion
): Promise<LandingPageVersion[]> {
  const file = await readVersionsFile();
  const updated = withVersionAdded(file[pageId] ?? [], version);
  await writeVersionsFile({ ...file, [pageId]: updated });
  return updated;
}

export async function deleteVersionForPage(
  pageId: string,
  versionId: string
): Promise<LandingPageVersion[]> {
  const file = await readVersionsFile();
  const updated = withVersionRemoved(file[pageId] ?? [], versionId);
  await writeVersionsFile({ ...file, [pageId]: updated });
  return updated;
}
