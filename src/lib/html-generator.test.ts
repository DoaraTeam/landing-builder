import { HTMLGenerator } from "./html-generator";
import { ComponentConfig } from "@/types/landing";

const heroComponent: ComponentConfig = {
  id: "hero-1",
  type: "hero",
  order: 1,
  visible: true,
  config: {
    title: "Welcome",
    subtitle: "Sub",
    description: "Desc",
    background: { type: "solid", color: "#ffffff" },
    animation: { type: "none" },
    spacing: {},
  },
};

const hiddenComponent: ComponentConfig = {
  id: "hidden-1",
  type: "cta",
  order: 0,
  visible: false,
  config: {
    title: "Should not render",
    description: "Desc",
    background: { type: "solid" },
    animation: { type: "none" },
    spacing: {},
  },
};

describe("HTMLGenerator.generate", () => {
  it("produces a full HTML document with the escaped title and description", () => {
    const html = HTMLGenerator.generate([heroComponent], {
      title: 'A "Great" Page',
      description: "Some & description",
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>A &quot;Great&quot; Page</title>");
    expect(html).toContain('content="Some &amp; description"');
  });

  it("defaults the title and description when not provided", () => {
    const html = HTMLGenerator.generate([heroComponent]);

    expect(html).toContain("<title>Landing Page</title>");
  });

  it("includes the component's content", () => {
    const html = HTMLGenerator.generate([heroComponent]);

    expect(html).toContain("Welcome");
  });

  it("excludes components marked as not visible", () => {
    const html = HTMLGenerator.generate([heroComponent, hiddenComponent]);

    expect(html).not.toContain("Should not render");
  });

  it("renders components in ascending order regardless of input order", () => {
    const first: ComponentConfig = { ...hiddenComponent, id: "a", order: 2, visible: true };
    const second: ComponentConfig = { ...hiddenComponent, id: "b", order: 1, visible: true };

    const html = HTMLGenerator.generate([first, second]);

    expect(html.indexOf('id="b"')).toBeLessThan(html.indexOf('id="a"'));
  });

  it("includes an inline <style> block by default", () => {
    const html = HTMLGenerator.generate([heroComponent]);

    expect(html).toContain("<style>");
  });

  it("omits the inline <style> block when includeInlineCSS is false", () => {
    const html = HTMLGenerator.generate([heroComponent], { includeInlineCSS: false });

    expect(html).not.toContain("<style>");
  });
});
