import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTemplateById } from "@/lib/landing-templates";
import { getTheme } from "@/lib/themes";
import { ComponentConfig } from "@/types/landing";
import { ComponentRenderer } from "@/components/landing/ComponentRenderer";
import { ThemeProvider } from "@/components/landing/ThemeProvider";

interface PageProps {
  params: { id: string };
  searchParams: { theme?: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const template = getTemplateById(params.id);
  return { title: template ? `${template.name} — Template Preview` : "Template Preview" };
}

export default function PreviewTemplatePage({ params, searchParams }: PageProps) {
  const template = getTemplateById(params.id);

  if (!template) {
    notFound();
  }

  const theme = getTheme(searchParams.theme || "modern");

  const components: ComponentConfig[] = template.components
    .map((component, index) => ({
      ...component,
      id: `${template.id}-${index}`,
      order: index,
    }))
    .filter((c) => c.visible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <ThemeProvider theme={theme}>
      <div className="sticky top-0 z-50 bg-yellow-500 py-2 text-center text-sm text-white">
        <strong>Template Preview</strong> — {template.name}
      </div>
      <main className="min-h-screen">
        {components.map((component) => (
          <ComponentRenderer key={component.id} component={component} theme={theme} />
        ))}
      </main>
    </ThemeProvider>
  );
}
