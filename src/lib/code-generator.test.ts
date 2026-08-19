import { generateReactCode } from "./code-generator";
import type { GridLayout } from "./types";

describe("generateReactCode", () => {
  it("wraps the output in a GeneratedUI component with the container width applied", () => {
    const layout: GridLayout = { columns: [], containerWidth: "800px" };

    const code = generateReactCode(layout);

    expect(code).toContain("export default function GeneratedUI()");
    expect(code).toContain('style={{ width: "800px", margin: "0 auto" }}');
  });

  it("defaults the container width to 100% when not specified", () => {
    const code = generateReactCode({ columns: [], containerWidth: "" });

    expect(code).toContain('width: "100%"');
  });

  it("imports Button/Input only when those component types are present", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [
        {
          id: "col-1",
          width: 12,
          orientation: "horizontal",
          components: [
            { id: "btn-1", type: "button", props: { text: "Click" } },
            { id: "input-1", type: "input", props: { placeholder: "Name" } },
          ],
        },
      ],
    };

    const code = generateReactCode(layout);

    expect(code).toContain('import { useState, useEffect } from "react";');
    expect(code).toContain('import { Button, Input } from "@/components/ui";');
  });

  it("omits the @/components/ui import line when no known components are used", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [
        {
          id: "col-1",
          width: 12,
          orientation: "horizontal",
          components: [{ id: "text-1", type: "text", props: { text: "Hello" } }],
        },
      ],
    };

    expect(generateReactCode(layout)).not.toContain("@/components/ui");
  });

  it("renders a button with its text and variant prop", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [
        {
          id: "col-1",
          width: 6,
          orientation: "horizontal",
          components: [
            { id: "btn-1", type: "button", props: { text: "Save", variant: "outline" } },
          ],
        },
      ],
    };

    const code = generateReactCode(layout);

    expect(code).toContain('<Button variant="outline">Save</Button>');
    expect(code).toContain("w-6/12");
  });

  it("renders text elements using the requested tag, defaulting to <p>", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [
        {
          id: "col-1",
          width: 12,
          orientation: "horizontal",
          components: [
            { id: "t1", type: "text", props: {} },
            { id: "t2", type: "text", props: { element: "h1", text: "Title" } },
          ],
        },
      ],
    };

    const code = generateReactCode(layout);

    expect(code).toContain("<p>Paragraph text</p>");
    expect(code).toContain("<h1>Title</h1>");
  });

  it("renders an image with src and alt props", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [
        {
          id: "col-1",
          width: 12,
          orientation: "horizontal",
          components: [{ id: "img-1", type: "image", props: { src: "/a.png", alt: "A" } }],
        },
      ],
    };

    expect(generateReactCode(layout)).toContain('<img src="/a.png" alt="A" />');
  });

  it("falls back to a placeholder for unknown component types", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [
        {
          id: "col-1",
          width: 12,
          orientation: "horizontal",
          components: [{ id: "x-1", type: "mystery", props: {} }],
        },
      ],
    };

    expect(generateReactCode(layout)).toContain("<div>Unknown component: mystery</div>");
  });

  it("recurses into nested child columns", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [
        {
          id: "col-1",
          width: 12,
          orientation: "horizontal",
          components: [],
          childColumns: [
            {
              id: "col-1-1",
              width: 12,
              orientation: "horizontal",
              components: [{ id: "btn-1", type: "button", props: { text: "Nested" } }],
            },
          ],
        },
      ],
    };

    expect(generateReactCode(layout)).toContain("<Button>Nested</Button>");
  });

  it("renders an empty flex placeholder when there are no columns at all", () => {
    const layout: GridLayout = { containerWidth: "100%", columns: [] };

    expect(generateReactCode(layout)).toContain('<div className="flex flex-wrap"></div>');
  });

  it("renders a column's wrapper divs even when it has no components", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [{ id: "col-1", width: 12, orientation: "horizontal", components: [] }],
    };

    const code = generateReactCode(layout);

    expect(code).toContain('<div className="w-full p-2">');
    expect(code).toContain("flex flex-row items-start justify-start gap-0");
  });

  it("serializes style-related props into an inline style object", () => {
    const layout: GridLayout = {
      containerWidth: "100%",
      columns: [
        {
          id: "col-1",
          width: 12,
          orientation: "horizontal",
          components: [
            { id: "div-1", type: "div", props: { width: "100px", backgroundColor: "red" } },
          ],
        },
      ],
    };

    const code = generateReactCode(layout);

    expect(code).toContain('style={{width: "100px", backgroundColor: "red"}}');
  });
});
