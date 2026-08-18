import { seoConfigToMetadata, mergeMetadata, getDefaultSEOConfig } from "./seo-utils";
import { SEOConfig } from "@/types/landing";

const baseSEO: SEOConfig = {
  metaTitle: "My Page",
  metaDescription: "My description",
  keywords: ["a", "b"],
};

describe("seoConfigToMetadata", () => {
  it("maps basic fields", () => {
    const metadata = seoConfigToMetadata(baseSEO);

    expect(metadata.title).toBe("My Page");
    expect(metadata.description).toBe("My description");
    expect(metadata.keywords).toEqual(["a", "b"]);
  });

  it("falls back openGraph title/description to the page's meta fields", () => {
    const metadata = seoConfigToMetadata({ ...baseSEO, openGraph: { type: "website" } });

    expect(metadata.openGraph?.title).toBe("My Page");
    expect(metadata.openGraph?.description).toBe("My description");
    // `type` isn't on every member of Next's OpenGraph union, so narrow via toMatchObject.
    expect(metadata.openGraph).toMatchObject({ type: "website" });
  });

  it("uses legacy ogImage when openGraph has no images", () => {
    const metadata = seoConfigToMetadata({
      ...baseSEO,
      ogImage: "/legacy.png",
      openGraph: { type: "website" },
    });

    expect(metadata.openGraph?.images).toEqual([{ url: "/legacy.png" }]);
  });

  it("prefers explicit openGraph images over the legacy ogImage", () => {
    const metadata = seoConfigToMetadata({
      ...baseSEO,
      ogImage: "/legacy.png",
      openGraph: { type: "website", images: [{ url: "/og.png" }] },
    });

    expect(metadata.openGraph?.images).toEqual([{ url: "/og.png" }]);
  });

  it("falls back twitter images to openGraph images, then legacy ogImage", () => {
    const withOgImages = seoConfigToMetadata({
      ...baseSEO,
      openGraph: { images: [{ url: "/og.png", alt: "og" }] },
      twitter: {},
    });
    expect(withOgImages.twitter?.images).toEqual([{ url: "/og.png", alt: "og" }]);

    const withLegacyImage = seoConfigToMetadata({
      ...baseSEO,
      ogImage: "/legacy.png",
      twitter: {},
    });
    expect(withLegacyImage.twitter?.images).toEqual([{ url: "/legacy.png" }]);
  });

  it("defaults the twitter card to summary_large_image", () => {
    const metadata = seoConfigToMetadata({ ...baseSEO, twitter: {} });

    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("maps robots config, using Next.js's dashed keys", () => {
    const metadata = seoConfigToMetadata({
      ...baseSEO,
      robots: { index: false, follow: true, maxImagePreview: "large" },
    });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: true,
      "max-image-preview": "large",
    });
  });

  it("uses alternates.canonical, falling back to the legacy canonical field", () => {
    expect(seoConfigToMetadata({ ...baseSEO, canonical: "/legacy" }).alternates).toEqual({
      canonical: "/legacy",
    });

    expect(
      seoConfigToMetadata({
        ...baseSEO,
        canonical: "/legacy",
        alternates: { canonical: "/new" },
      }).alternates?.canonical
    ).toBe("/new");
  });

  it("maps bing verification into the 'other' verification bucket", () => {
    const metadata = seoConfigToMetadata({
      ...baseSEO,
      verification: { google: "g-code", bing: "b-code" },
    });

    expect(metadata.verification?.google).toBe("g-code");
    expect(metadata.verification?.other).toEqual({ "msvalidate.01": "b-code" });
  });

  it("omits optional sections that are not provided", () => {
    const metadata = seoConfigToMetadata(baseSEO);

    expect(metadata.openGraph).toBeUndefined();
    expect(metadata.twitter).toBeUndefined();
    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates).toBeUndefined();
  });
});

describe("mergeMetadata", () => {
  it("returns the base metadata unchanged when no SEO config is given", () => {
    const base = { title: "Base" };

    expect(mergeMetadata(base)).toBe(base);
  });

  it("lets the SEO config override the base metadata", () => {
    const merged = mergeMetadata({ title: "Base", description: "Base desc" }, baseSEO);

    expect(merged.title).toBe("My Page");
    expect(merged.description).toBe("My description");
  });

  it("shallow-merges nested openGraph/twitter/alternates/verification objects", () => {
    // seoConfigToMetadata always sets openGraph.siteName (even to undefined), so it
    // overrides the base's siteName; only keys the SEO config never touches survive from base.
    const merged = mergeMetadata(
      { openGraph: { images: [{ url: "/base.png" }] } },
      { ...baseSEO, openGraph: { type: "article" } }
    );

    expect(merged.openGraph).toMatchObject({ images: [{ url: "/base.png" }], type: "article" });
  });
});

describe("getDefaultSEOConfig", () => {
  it("builds a sensible default SEO config from title/description/keywords", () => {
    const config = getDefaultSEOConfig("Title", "Description", ["x"]);

    expect(config.metaTitle).toBe("Title");
    expect(config.metaDescription).toBe("Description");
    expect(config.keywords).toEqual(["x"]);
    expect(config.robots).toEqual({ index: true, follow: true, maxImagePreview: "large" });
    expect(config.openGraph).toEqual({ type: "website", locale: "vi_VN" });
    expect(config.twitter).toEqual({ card: "summary_large_image" });
  });

  it("defaults keywords to an empty array when omitted", () => {
    expect(getDefaultSEOConfig("Title", "Description").keywords).toEqual([]);
  });
});
