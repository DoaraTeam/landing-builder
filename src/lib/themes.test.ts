import {
  themes,
  getTheme,
  getThemeIds,
  getThemePreview,
  getThemesArray,
  applyTheme,
  generateThemeCSS,
} from "./themes";

describe("getTheme", () => {
  it("returns the theme for a known id", () => {
    expect(getTheme("dark").name).toBe("Professional Dark");
  });

  it("falls back to the modern theme for an unknown id", () => {
    expect(getTheme("does-not-exist")).toBe(themes.modern);
  });
});

describe("getThemeIds", () => {
  it("returns every key of the themes map", () => {
    expect(getThemeIds()).toEqual(Object.keys(themes));
    expect(getThemeIds().length).toBeGreaterThan(0);
  });
});

describe("getThemePreview", () => {
  it("extracts id, name, and key colors for a theme", () => {
    expect(getThemePreview("modern")).toEqual({
      id: "modern",
      name: themes.modern.name,
      primary: themes.modern.colors.primary,
      secondary: themes.modern.colors.secondary,
      accent: themes.modern.colors.accent,
      background: themes.modern.colors.background,
    });
  });
});

describe("getThemesArray", () => {
  it("returns one preview per theme, matching the theme map size", () => {
    const previews = getThemesArray();

    expect(previews).toHaveLength(Object.keys(themes).length);
    expect(previews.map((p) => p.id)).toEqual(expect.arrayContaining(Object.keys(themes)));
  });
});

describe("applyTheme", () => {
  it("sets CSS custom properties and the shadow attribute on the document root", () => {
    applyTheme(themes.dark);

    const root = document.documentElement;
    expect(root.style.getPropertyValue("--color-primary")).toBe(themes.dark.colors.primary);
    expect(root.style.getPropertyValue("--color-background")).toBe(themes.dark.colors.background);
    expect(root.style.getPropertyValue("--font-heading")).toBe(themes.dark.fonts.heading);
    expect(root.style.getPropertyValue("--border-radius")).toBe(themes.dark.borderRadius);
    expect(root.getAttribute("data-shadow")).toBe(themes.dark.shadows);
  });
});

describe("generateThemeCSS", () => {
  it("embeds the theme's colors and fonts into a :root block", () => {
    const css = generateThemeCSS(themes.modern);

    expect(css).toContain(":root {");
    expect(css).toContain(`--color-primary: ${themes.modern.colors.primary};`);
    expect(css).toContain(`--font-heading: ${themes.modern.fonts.heading};`);
    expect(css).toContain(`--border-radius: ${themes.modern.borderRadius};`);
  });
});
