import { landingPageTemplates, getTemplateById, getTemplatesByCategory } from "./landing-templates";

describe("landingPageTemplates", () => {
  it("has at least one template", () => {
    expect(landingPageTemplates.length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = landingPageTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every template a name, description, category, and at least one component", () => {
    const validCategories = ["business", "saas", "ecommerce", "agency", "portfolio"];

    landingPageTemplates.forEach((template) => {
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
      expect(validCategories).toContain(template.category);
      expect(template.components.length).toBeGreaterThan(0);
      template.components.forEach((component) => {
        expect(typeof component.type).toBe("string");
        expect(typeof component.visible).toBe("boolean");
        expect(component.config).toBeTruthy();
      });
    });
  });
});

describe("getTemplateById", () => {
  it("finds a template that exists", () => {
    const first = landingPageTemplates[0];

    expect(getTemplateById(first.id)).toBe(first);
  });

  it("returns undefined for an id that doesn't exist", () => {
    expect(getTemplateById("does-not-exist")).toBeUndefined();
  });
});

describe("getTemplatesByCategory", () => {
  it("only returns templates matching the requested category", () => {
    const businessTemplates = getTemplatesByCategory("business");

    expect(businessTemplates.length).toBeGreaterThan(0);
    businessTemplates.forEach((template) => expect(template.category).toBe("business"));
  });

  it("returns an empty array when no template matches", () => {
    const categoriesInUse = new Set(landingPageTemplates.map((t) => t.category));
    const allCategories: Array<(typeof landingPageTemplates)[number]["category"]> = [
      "business",
      "saas",
      "ecommerce",
      "agency",
      "portfolio",
    ];
    const unusedCategory = allCategories.find((c) => !categoriesInUse.has(c));

    if (unusedCategory) {
      expect(getTemplatesByCategory(unusedCategory)).toEqual([]);
    }
  });
});
