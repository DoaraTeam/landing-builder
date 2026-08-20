import { ExportImportManager } from "./export-import";
import { ComponentConfig } from "@/types/landing";

const sampleComponents: ComponentConfig[] = [
  {
    id: "hero-1",
    type: "hero",
    order: 0,
    visible: true,
    config: {
      title: "Title",
      subtitle: "Subtitle",
      description: "Description",
      background: { type: "solid", color: "#fff" },
      animation: { type: "none" },
      spacing: {},
    },
  },
];

describe("ExportImportManager.export", () => {
  it("serializes components with a version and timestamp", () => {
    const json = ExportImportManager.export(sampleComponents, { title: "My Page" });
    const parsed = JSON.parse(json);

    expect(parsed.version).toBe("1.0.0");
    expect(typeof parsed.timestamp).toBe("string");
    expect(parsed.components).toEqual(sampleComponents);
    expect(parsed.metadata).toEqual({ title: "My Page" });
  });
});

describe("ExportImportManager.exportHTML", () => {
  it("delegates to the HTML generator and includes the page title", () => {
    const html = ExportImportManager.exportHTML(sampleComponents, { title: "My Landing" });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>My Landing</title>");
  });
});

describe("ExportImportManager.import", () => {
  it("round-trips data produced by export()", async () => {
    const json = ExportImportManager.export(sampleComponents, { title: "Round Trip" });

    const result = await ExportImportManager.import(json);

    expect(result.components).toEqual(sampleComponents);
    expect(result.metadata).toEqual({ title: "Round Trip" });
  });

  it("rejects invalid JSON", async () => {
    await expect(ExportImportManager.import("not json")).rejects.toThrow(
      "Failed to import template"
    );
  });

  it("rejects data missing required fields", async () => {
    await expect(ExportImportManager.import(JSON.stringify({ version: "1.0.0" }))).rejects.toThrow(
      "Invalid import data format"
    );
  });

  it("rejects components that are missing id/type/config", async () => {
    const badData = JSON.stringify({
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      components: [{ id: "x" }],
    });

    await expect(ExportImportManager.import(badData)).rejects.toThrow("Invalid import data format");
  });
});

describe("ExportImportManager.importFromFile", () => {
  it("reads a File and parses its JSON content", async () => {
    const json = ExportImportManager.export(sampleComponents, { title: "From File" });
    const file = new File([json], "template.json", { type: "application/json" });

    const result = await ExportImportManager.importFromFile(file);

    expect(result.components).toEqual(sampleComponents);
    expect(result.metadata).toEqual({ title: "From File" });
  });
});

describe("ExportImportManager.createTemplate", () => {
  it("wraps components with a name/description and fixed author", () => {
    const template = ExportImportManager.createTemplate(sampleComponents, "My Template", "Desc");

    expect(template.version).toBe("1.0.0");
    expect(template.components).toEqual(sampleComponents);
    expect(template.metadata).toEqual({
      title: "My Template",
      description: "Desc",
      author: "Landing Page Builder",
    });
  });

  it("defaults description to an empty string", () => {
    const template = ExportImportManager.createTemplate(sampleComponents, "My Template");

    expect(template.metadata?.description).toBe("");
  });
});
