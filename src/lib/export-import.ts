"use client";

import { ComponentConfig } from "@/types/landing";
import { HTMLGenerator } from "./html-generator";

interface ExportImportData {
  version: string;
  timestamp: string;
  components: ComponentConfig[];
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
  };
}

export class ExportImportManager {
  private static readonly VERSION = "1.0.0";

  static export(components: ComponentConfig[], metadata?: ExportImportData["metadata"]): string {
    const data: ExportImportData = {
      version: this.VERSION,
      timestamp: new Date().toISOString(),
      components,
      metadata,
    };

    return JSON.stringify(data, null, 2);
  }

  static downloadAsFile(
    components: ComponentConfig[],
    filename = "landing-page-template.json",
    metadata?: ExportImportData["metadata"]
  ): void {
    const jsonString = this.export(components, metadata);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static exportHTML(
    components: ComponentConfig[],
    metadata?: ExportImportData["metadata"]
  ): string {
    return HTMLGenerator.generate(components, {
      includeInlineCSS: true,
      title: metadata?.title || "Landing Page",
      description: metadata?.description || "Generated landing page",
    });
  }

  static downloadAsHTML(
    components: ComponentConfig[],
    filename = "landing-page.html",
    metadata?: ExportImportData["metadata"]
  ): void {
    const htmlString = this.exportHTML(components, metadata);
    const blob = new Blob([htmlString], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static exportMultiPageHTML(
    pages: Array<{
      slug: string;
      components: ComponentConfig[];
      title?: string;
      description?: string;
    }>,
    projectName = "landing-pages"
  ): void {
    // Dynamic import JSZip
    import("jszip")
      .then(({ default: JSZip }) => {
        const zip = new JSZip();

        // Generate HTML for each page
        pages.forEach((page) => {
          const htmlString = HTMLGenerator.generate(page.components, {
            includeInlineCSS: true,
            title: page.title || page.slug,
            description: page.description || `${page.slug} page`,
          });

          const filename = page.slug === "home" ? "index.html" : `${page.slug}.html`;
          zip.file(filename, htmlString);
        });

        // Generate index file with links to all pages
        const indexLinks = pages
          .map((page) => {
            const href = page.slug === "home" ? "index.html" : `${page.slug}.html`;
            return `<li><a href="${href}">${page.title || page.slug}</a></li>`;
          })
          .join("\n      ");

        const indexPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - Site Map</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #2563eb; }
    ul { list-style: none; padding: 0; }
    li { margin: 10px 0; }
    a {
      display: block;
      padding: 15px 20px;
      background: #f3f4f6;
      border-radius: 8px;
      text-decoration: none;
      color: #1f2937;
      transition: all 0.3s;
    }
    a:hover {
      background: #2563eb;
      color: white;
      transform: translateX(5px);
    }
  </style>
</head>
<body>
  <h1>${projectName}</h1>
  <p>Choose a page to view:</p>
  <ul>
    ${indexLinks}
  </ul>
</body>
</html>`;

        zip.file("sitemap.html", indexPage);

        // Generate and download ZIP
        zip.generateAsync({ type: "blob" }).then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${projectName}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      })
      .catch((error) => {
        console.error("Failed to load JSZip:", error);
        alert("Failed to export multi-page. Please make sure JSZip is installed.");
      });
  }

  static async import(jsonString: string): Promise<{
    components: ComponentConfig[];
    metadata?: ExportImportData["metadata"];
  }> {
    try {
      const data: ExportImportData = JSON.parse(jsonString);

      if (!this.validateImportData(data)) {
        throw new Error("Invalid import data format");
      }

      return {
        components: data.components,
        metadata: data.metadata,
      };
    } catch (error) {
      throw new Error(
        `Failed to import template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async importFromFile(file: File): Promise<{
    components: ComponentConfig[];
    metadata?: ExportImportData["metadata"];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const jsonString = event.target?.result as string;
          const result = await this.import(jsonString);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  }

  private static validateImportData(data: unknown): data is ExportImportData {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;

    return (
      typeof obj.version === "string" &&
      typeof obj.timestamp === "string" &&
      Array.isArray(obj.components) &&
      obj.components.every(this.validateComponent)
    );
  }

  private static validateComponent(component: unknown): component is ComponentConfig {
    if (typeof component !== "object" || component === null) {
      return false;
    }

    const obj = component as Record<string, unknown>;

    return (
      typeof obj.id === "string" &&
      typeof obj.type === "string" &&
      typeof obj.config === "object" &&
      obj.config !== null
    );
  }

  static createTemplate(
    components: ComponentConfig[],
    name: string,
    description = ""
  ): ExportImportData {
    return {
      version: this.VERSION,
      timestamp: new Date().toISOString(),
      components,
      metadata: {
        title: name,
        description,
        author: "Landing Page Builder",
      },
    };
  }
}
