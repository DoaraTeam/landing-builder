import { readFile, writeFile, stat } from "fs/promises";
import { join } from "path";
import type {
  LandingConfig,
  LandingPage,
  LandingPageVersion,
  PageEntry,
  PageSummary,
  Theme,
} from "@/types/landing";

const CONFIG_PATH = join(process.cwd(), "public/data/landing-config.json");
const VERSIONS_PATH = join(process.cwd(), "public/data/landing-config.versions.json");

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

// Every request to a public route (/[slug], /[slug]/[subpage], /preview)
// used to readFile + JSON.parse the whole config from scratch —
// some of them multiple times per request (generateMetadata + the page body
// each reading it independently). That's real, avoidable work on every hit.
// This cross-request, mtime-checked cache means repeat calls (whether from
// the same request or a later one) skip straight back to the parsed object
// as long as no save/publish has touched the file since.
let baseCache: { mtimeMs: number; config: LandingConfig } | null = null;

/** Reads landing-config.json (every page's draft/published — no version history). */
export async function readBaseLandingConfig(): Promise<LandingConfig> {
  const stats = await stat(CONFIG_PATH);
  if (baseCache && baseCache.mtimeMs === stats.mtimeMs) {
    return baseCache.config;
  }

  const raw = await readFile(CONFIG_PATH, "utf-8");
  const config: LandingConfig = JSON.parse(raw);
  baseCache = { mtimeMs: stats.mtimeMs, config };
  return config;
}

/** Persists landing-config.json and invalidates the read cache. */
export async function writeBaseLandingConfig(config: LandingConfig): Promise<void> {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  baseCache = null;
}

type VersionsFile = Record<string, LandingPageVersion[]>;

async function readVersionsFile(): Promise<VersionsFile> {
  const raw = await readFile(VERSIONS_PATH, "utf-8");
  return JSON.parse(raw) as VersionsFile;
}

async function writeVersionsFile(file: VersionsFile): Promise<void> {
  await writeFile(VERSIONS_PATH, JSON.stringify(file, null, 2), "utf-8");
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
