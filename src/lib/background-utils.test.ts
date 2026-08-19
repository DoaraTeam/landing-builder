import { getBackgroundStyle, isBackgroundDark, type BackgroundConfig } from "./background-utils";

describe("getBackgroundStyle", () => {
  it("returns a linear-gradient for gradient backgrounds", () => {
    const bg: BackgroundConfig = {
      type: "gradient",
      gradient: { from: "#111827", to: "#1f2937", direction: "to-r" },
    };

    expect(getBackgroundStyle(bg)).toEqual({
      background: "linear-gradient(to-r, #111827, #1f2937)",
    });
  });

  it("defaults gradient direction to to-br when not specified", () => {
    const bg: BackgroundConfig = { type: "gradient", gradient: { from: "#fff", to: "#000" } };

    expect(getBackgroundStyle(bg)).toEqual({ background: "linear-gradient(to-br, #fff, #000)" });
  });

  it("returns an image background with overlay, position, and size", () => {
    const bg: BackgroundConfig = {
      type: "image",
      image: { url: "/photo.jpg", overlay: "rgba(0,0,0,0.5)", position: "top", size: "contain" },
    };

    expect(getBackgroundStyle(bg)).toEqual({
      backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(/photo.jpg)",
      backgroundPosition: "top",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
    });
  });

  it("omits the overlay gradient when no overlay is set", () => {
    const bg: BackgroundConfig = { type: "image", image: { url: "/photo.jpg" } };

    const style = getBackgroundStyle(bg);

    expect(style.backgroundImage).toBe("url(/photo.jpg)");
    expect(style.backgroundPosition).toBe("center");
    expect(style.backgroundSize).toBe("cover");
  });

  it("uses the solid color when provided", () => {
    const bg: BackgroundConfig = { type: "solid", color: "#3B82F6" };

    expect(getBackgroundStyle(bg)).toEqual({ backgroundColor: "#3B82F6" });
  });

  it("falls back to the fallback color when solid has no color", () => {
    const bg: BackgroundConfig = { type: "solid" };

    expect(getBackgroundStyle(bg, "#fallback")).toEqual({ backgroundColor: "#fallback" });
  });

  it("uses the default fallback color when none is passed", () => {
    const bg: BackgroundConfig = { type: "solid" };

    expect(getBackgroundStyle(bg)).toEqual({ backgroundColor: "var(--color-surface)" });
  });
});

describe("isBackgroundDark", () => {
  it("returns false for a falsy background", () => {
    expect(isBackgroundDark(undefined as unknown as BackgroundConfig)).toBe(false);
  });

  it("detects a dark solid color", () => {
    expect(isBackgroundDark({ type: "solid", color: "#000000" })).toBe(true);
  });

  it("detects a light solid color", () => {
    expect(isBackgroundDark({ type: "solid", color: "#FFFFFF" })).toBe(false);
  });

  it("checks the gradient's 'from' color", () => {
    expect(
      isBackgroundDark({ type: "gradient", gradient: { from: "#000000", to: "#ffffff" } })
    ).toBe(true);
  });

  it("checks the image overlay color when present", () => {
    expect(
      isBackgroundDark({
        type: "image",
        image: { url: "/x.jpg", overlay: "rgba(255,255,255,0.9)" },
      })
    ).toBe(false);
  });

  it("assumes dark for an image background without an overlay", () => {
    expect(isBackgroundDark({ type: "image", image: { url: "/x.jpg" } })).toBe(true);
  });

  it("defaults to false when solid has no color", () => {
    expect(isBackgroundDark({ type: "solid" })).toBe(false);
  });
});
