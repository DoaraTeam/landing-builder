import {
  capVersions,
  withVersionAdded,
  withVersionRemoved,
  getPageSummaries,
  getPageEntry,
  upsertPageDraft,
  publishPage,
  renamePage,
  deletePage,
  upsertTheme,
} from "./landing-config-store";
import { LandingConfig, LandingPage, LandingPageVersion, PageEntry, Theme } from "@/types/landing";

function makePage(overrides: Partial<LandingPage> = {}): LandingPage {
  return {
    id: "p1",
    title: "t",
    description: "",
    slug: "s",
    theme: "modern",
    seo: { metaTitle: "", metaDescription: "", keywords: [] },
    components: [],
    ...overrides,
  };
}

function makeEntry(id: string, overrides: Partial<PageEntry> = {}): PageEntry {
  return {
    id,
    name: id,
    draft: makePage({ id, title: id, slug: id }),
    published: null,
    activeVersionId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeConfig(pages: Record<string, PageEntry> = {}): LandingConfig {
  return {
    version: "1",
    metadata: { lastUpdated: "", totalPages: 0, version: "1" },
    themes: {},
    pages,
  };
}

function makeVersion(id: string, createdAt: string): LandingPageVersion {
  return { id, name: id, createdAt, page: makePage({ id }) };
}

describe("capVersions", () => {
  it("returns the same list unchanged when under the cap", () => {
    const versions = [makeVersion("a", "2024-01-01"), makeVersion("b", "2024-01-02")];
    expect(capVersions(versions, 5)).toEqual(versions);
  });

  it("keeps only the most recently created versions when over the cap", () => {
    const versions = [
      makeVersion("oldest", "2024-01-01"),
      makeVersion("middle", "2024-01-02"),
      makeVersion("newest", "2024-01-03"),
    ];

    expect(capVersions(versions, 2).map((v) => v.id)).toEqual(["middle", "newest"]);
  });

  it("sorts by createdAt instead of trusting input order", () => {
    const versions = [
      makeVersion("newest", "2024-03-01"),
      makeVersion("oldest", "2024-01-01"),
      makeVersion("middle", "2024-02-01"),
    ];

    expect(capVersions(versions, 2).map((v) => v.id)).toEqual(["middle", "newest"]);
  });

  it("does not mutate the input array", () => {
    const versions = [makeVersion("a", "2024-01-01"), makeVersion("b", "2024-01-02")];
    const copy = [...versions];

    capVersions(versions, 1);

    expect(versions).toEqual(copy);
  });
});

describe("withVersionAdded", () => {
  it("appends the new version", () => {
    const versions = [makeVersion("a", "2024-01-01")];
    const result = withVersionAdded(versions, makeVersion("b", "2024-01-02"));

    expect(result.map((v) => v.id)).toEqual(["a", "b"]);
  });

  it("caps after appending", () => {
    const versions = [makeVersion("a", "2024-01-01"), makeVersion("b", "2024-01-02")];
    const result = withVersionAdded(versions, makeVersion("c", "2024-01-03"), 2);

    expect(result.map((v) => v.id)).toEqual(["b", "c"]);
  });
});

describe("withVersionRemoved", () => {
  it("removes only the matching version", () => {
    const versions = [makeVersion("a", "2024-01-01"), makeVersion("b", "2024-01-02")];
    expect(withVersionRemoved(versions, "a").map((v) => v.id)).toEqual(["b"]);
  });

  it("is a no-op when the id isn't found", () => {
    const versions = [makeVersion("a", "2024-01-01")];
    expect(withVersionRemoved(versions, "missing")).toEqual(versions);
  });
});

describe("getPageSummaries", () => {
  it("projects draft fields and isPublished, sorted newest-updated-first", () => {
    const config = makeConfig({
      old: makeEntry("old", { updatedAt: "2024-01-01T00:00:00.000Z", published: null }),
      newer: makeEntry("newer", {
        updatedAt: "2024-06-01T00:00:00.000Z",
        published: makePage({ id: "newer" }),
      }),
    });

    const summaries = getPageSummaries(config);

    expect(summaries.map((s) => s.id)).toEqual(["newer", "old"]);
    expect(summaries[0].isPublished).toBe(true);
    expect(summaries[1].isPublished).toBe(false);
    expect(summaries[0].title).toBe("newer");
  });

  it("derives isMultiPage from having any sub-pages, not a stored flag", () => {
    const config = makeConfig({
      a: makeEntry("a"),
      b: makeEntry("b", {
        draft: makePage({
          id: "b",
          subPages: [
            { id: "sp1", title: "Blog", slug: "blog", components: [], order: 0, visible: true },
          ],
        }),
      }),
    });

    const summaries = getPageSummaries(config);

    expect(summaries.find((s) => s.id === "a")?.isMultiPage).toBe(false);
    expect(summaries.find((s) => s.id === "b")?.isMultiPage).toBe(true);
  });
});

describe("getPageEntry", () => {
  it("returns the matching entry", () => {
    const entry = makeEntry("a");
    const config = makeConfig({ a: entry });
    expect(getPageEntry(config, "a")).toEqual(entry);
  });

  it("returns null when not found", () => {
    expect(getPageEntry(makeConfig(), "missing")).toBeNull();
  });
});

describe("upsertPageDraft", () => {
  it("creates a new entry with published null and name defaulted from the draft's title", () => {
    const config = makeConfig();
    const draft = makePage({ id: "new-page", title: "New Page" });

    const result = upsertPageDraft(config, "new-page", draft);

    expect(result.pages["new-page"]).toMatchObject({
      id: "new-page",
      name: "New Page",
      draft,
      published: null,
      activeVersionId: null,
    });
  });

  it("uses the explicit name instead of the draft's title when given", () => {
    const config = makeConfig();
    const draft = makePage({ id: "new-page", title: "Home" });

    const result = upsertPageDraft(config, "new-page", draft, "Copy of Original");

    expect(result.pages["new-page"].name).toBe("Copy of Original");
  });

  it("preserves the existing name when updating an existing entry", () => {
    const config = makeConfig({ a: makeEntry("a", { name: "Original Name" }) });

    const result = upsertPageDraft(config, "a", makePage({ id: "a", title: "edited" }));

    expect(result.pages.a.name).toBe("Original Name");
  });

  it("updates an existing entry's draft without touching published", () => {
    const existing = makeEntry("a", { published: makePage({ id: "a", title: "live" }) });
    const config = makeConfig({ a: existing });
    const newDraft = makePage({ id: "a", title: "edited" });

    const result = upsertPageDraft(config, "a", newDraft);

    expect(result.pages.a.draft).toEqual(newDraft);
    expect(result.pages.a.published).toEqual(existing.published);
  });

  it("does not mutate the input config", () => {
    const config = makeConfig({ a: makeEntry("a") });
    upsertPageDraft(config, "a", makePage({ id: "a", title: "changed" }));
    expect(config.pages.a.draft.title).toBe("a");
  });
});

describe("publishPage", () => {
  it("copies draft into published and sets publishedAt", () => {
    const config = makeConfig({ a: makeEntry("a", { draft: makePage({ id: "a", title: "v2" }) }) });

    const result = publishPage(config, "a");

    expect(result.pages.a.published).toEqual(config.pages.a.draft);
    expect(result.pages.a.publishedAt).toBeTruthy();
  });

  it("is a no-op when the page doesn't exist", () => {
    const config = makeConfig();
    expect(publishPage(config, "missing")).toBe(config);
  });
});

describe("renamePage", () => {
  it("renames the project's own name", () => {
    const config = makeConfig({ a: makeEntry("a", { name: "Old Name" }) });

    const result = renamePage(config, "a", "New Name");

    expect(result.pages.a.name).toBe("New Name");
  });

  it("never touches draft or published content", () => {
    const config = makeConfig({
      a: makeEntry("a", {
        name: "Old Name",
        draft: makePage({ id: "a", title: "Home" }),
        published: makePage({ id: "a", title: "Home" }),
      }),
    });

    const result = renamePage(config, "a", "New Name");

    expect(result.pages.a.draft.title).toBe("Home");
    expect(result.pages.a.published?.title).toBe("Home");
  });

  it("is a no-op when the page doesn't exist", () => {
    const config = makeConfig();
    expect(renamePage(config, "missing", "New Name")).toBe(config);
  });
});

describe("deletePage", () => {
  it("removes the entry", () => {
    const config = makeConfig({ a: makeEntry("a"), b: makeEntry("b") });
    const result = deletePage(config, "a");
    expect(result.pages).toEqual({ b: config.pages.b });
  });
});

describe("upsertTheme", () => {
  it("adds a new theme without touching existing ones", () => {
    const existing = { name: "existing" } as Theme;
    const config = { ...makeConfig(), themes: { existing } };
    const newTheme = { name: "new" } as Theme;

    const result = upsertTheme(config, "new-id", newTheme);

    expect(result.themes).toEqual({ existing, "new-id": newTheme });
  });

  it("overwrites a theme with the same id", () => {
    const config = { ...makeConfig(), themes: { a: { name: "old" } as Theme } };
    const updated = { name: "updated" } as Theme;

    expect(upsertTheme(config, "a", updated).themes.a).toEqual(updated);
  });
});
