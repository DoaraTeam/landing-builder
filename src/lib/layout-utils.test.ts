import {
  getContainerClass,
  getPaddingClass,
  getMarginClass,
  getSpacingClasses,
  getAlignmentClass,
  getGridColumnsClass,
  getLayoutClasses,
} from "./layout-utils";

describe("getContainerClass", () => {
  it("maps a known width to its class", () => {
    expect(getContainerClass("narrow")).toBe("max-w-3xl mx-auto");
  });

  it("defaults to the default container when width is missing", () => {
    expect(getContainerClass(undefined)).toBe("max-w-7xl mx-auto");
  });

  it("defaults to the default container for an unknown width", () => {
    expect(getContainerClass("not-a-width")).toBe("max-w-7xl mx-auto");
  });
});

describe("getPaddingClass", () => {
  it("returns a fallback when no spacing is given", () => {
    expect(getPaddingClass(undefined)).toBe("py-16 px-4");
  });

  it("supports the legacy string format", () => {
    expect(getPaddingClass("sm")).toBe("py-8 px-4");
  });

  it("reads padding from a SpacingConfig object", () => {
    expect(getPaddingClass({ padding: "2xl" })).toBe("py-24 px-4");
  });

  it("defaults padding to xl when the object has none", () => {
    expect(getPaddingClass({})).toBe("py-20 px-4");
  });
});

describe("getMarginClass", () => {
  it("returns an empty string when no spacing is given", () => {
    expect(getMarginClass(undefined)).toBe("");
  });

  it("returns an empty string for the legacy string format", () => {
    expect(getMarginClass("lg")).toBe("");
  });

  it("reads margin from a SpacingConfig object", () => {
    expect(getMarginClass({ margin: "lg" })).toBe("my-12");
  });

  it("defaults to no margin when unset", () => {
    expect(getMarginClass({})).toBe("");
  });
});

describe("getSpacingClasses", () => {
  it("combines padding and margin classes", () => {
    expect(getSpacingClasses({ padding: "sm", margin: "md" })).toBe("py-8 px-4 my-8");
  });

  it("trims trailing whitespace when there is no margin", () => {
    expect(getSpacingClasses({ padding: "sm" })).toBe("py-8 px-4");
  });
});

describe("getAlignmentClass", () => {
  it("maps left/right/center", () => {
    expect(getAlignmentClass("left")).toBe("text-left items-start");
    expect(getAlignmentClass("right")).toBe("text-right items-end");
  });

  it("defaults to center when missing or unknown", () => {
    expect(getAlignmentClass(undefined)).toBe("text-center items-center");
    expect(getAlignmentClass("diagonal")).toBe("text-center items-center");
  });
});

describe("getGridColumnsClass", () => {
  it("maps a known column count", () => {
    expect(getGridColumnsClass(4)).toBe("grid-cols-1 md:grid-cols-2 lg:grid-cols-4");
  });

  it("defaults to 3 columns when missing or unknown", () => {
    expect(getGridColumnsClass(undefined)).toBe("grid-cols-1 md:grid-cols-2 lg:grid-cols-3");
    expect(getGridColumnsClass(99)).toBe("grid-cols-1 md:grid-cols-2 lg:grid-cols-3");
  });
});

describe("getLayoutClasses", () => {
  it("combines all layout helpers into one object", () => {
    expect(
      getLayoutClasses({
        spacing: { padding: "sm", margin: "sm" },
        containerWidth: "lg",
        alignment: "left",
        columns: 2,
      })
    ).toEqual({
      section: "py-8 px-4 my-4",
      container: "max-w-4xl mx-auto",
      alignment: "text-left items-start",
      grid: "grid-cols-1 md:grid-cols-2",
    });
  });
});
