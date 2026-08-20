"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, FileJson, Copy, Check, FileCode } from "lucide-react";
import { ComponentConfig, SubPage } from "@/types/landing";
import { ExportImportManager } from "@/lib/export-import";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/editor/dialogs/ConfirmDialog";

interface ExportImportDialogProps {
  isOpen: boolean;
  // Which tab to land on when opened — File > Export opens on "export",
  // Layout > Import opens on "import". Still freely switchable once open.
  initialTab?: "export" | "import";
  onClose: () => void;
  components: ComponentConfig[];
  onImport: (components: ComponentConfig[]) => void;
  isMultiPage?: boolean;
  subPages?: SubPage[];
  pageTitle?: string;
}

export function ExportImportDialog({
  isOpen,
  initialTab = "export",
  onClose,
  components,
  onImport,
  isMultiPage = false,
  subPages = [],
  pageTitle = "Landing Page",
}: ExportImportDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"export" | "import">(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);
  const [exportData, setExportData] = useState("");
  const [exportHTML, setExportHTML] = useState("");
  const [importData, setImportData] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "html">("json");
  const [confirmReplace, setConfirmReplace] = useState<{
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const handleExport = () => {
    const metadata = {
      title: templateName || "Landing Page Template",
      description: templateDescription || "Exported landing page configuration",
      author: "Landing Page Builder",
    };

    if (exportFormat === "json") {
      const exported = ExportImportManager.export(components, metadata);
      setExportData(exported);
    } else {
      const exported = ExportImportManager.exportHTML(components, metadata);
      setExportHTML(exported);
    }
  };

  const handleDownload = () => {
    const metadata = {
      title: templateName || "Landing Page Template",
      description: templateDescription || "Exported landing page configuration",
      author: "Landing Page Builder",
    };

    if (exportFormat === "json") {
      const filename = templateName
        ? `${templateName.toLowerCase().replace(/\s+/g, "-")}.json`
        : "landing-page-template.json";

      ExportImportManager.downloadAsFile(components, filename, metadata);

      toast.success({
        title: "Template exported",
        description: `Downloaded as ${filename}`,
      });
    } else {
      // Check if multi-page
      if (isMultiPage && subPages.length > 0) {
        const projectName = templateName || pageTitle.toLowerCase().replace(/\s+/g, "-");
        const pages = [
          {
            slug: "home",
            components,
            title: pageTitle,
            description: templateDescription || metadata.description,
          },
          ...subPages.map((sp) => ({
            slug: sp.slug,
            components: sp.components,
            title: sp.title,
            description: sp.description || `${sp.title} page`,
          })),
        ];

        ExportImportManager.exportMultiPageHTML(pages, projectName);

        toast.success({
          title: "Multi-page HTML exported",
          description: `Downloaded ${pages.length} pages as ${projectName}.zip`,
        });
      } else {
        const filename = templateName
          ? `${templateName.toLowerCase().replace(/\s+/g, "-")}.html`
          : "landing-page.html";

        ExportImportManager.downloadAsHTML(components, filename, metadata);

        toast.success({
          title: "HTML exported",
          description: `Downloaded as ${filename}`,
        });
      }
    }
  };

  const handleCopyToClipboard = async () => {
    const dataToExport = exportFormat === "json" ? exportData : exportHTML;

    if (!dataToExport) {
      handleExport();
      return;
    }

    try {
      await navigator.clipboard.writeText(dataToExport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast.success({
        title: "Copied to clipboard",
        description: `${exportFormat.toUpperCase()} code copied successfully`,
      });
    } catch (error) {
      toast.error({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await ExportImportManager.importFromFile(file);
      setImportData(JSON.stringify(result, null, 2));

      toast.success({
        title: "File loaded",
        description: "Template file loaded successfully. Click Import to apply.",
      });
    } catch (error) {
      toast.error({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import template",
      });
    }
  };

  const handleImportFromText = async () => {
    if (!importData.trim()) {
      toast.warning({
        title: "No data",
        description: "Please paste template data or upload a file",
      });
      return;
    }

    // Parse/validate first so the confirmation shows accurate counts instead
    // of asking to confirm something that then fails on bad JSON anyway.
    try {
      const result = await ExportImportManager.import(importData);

      setConfirmReplace({
        description: `This will replace all ${components.length} current component(s) with ${result.components.length} imported component(s). This cannot be undone.`,
        onConfirm: () => {
          onImport(result.components);
          onClose();

          toast.success({
            title: "Import successful",
            description: `Imported ${result.components.length} components`,
          });
        },
      });
    } catch (error) {
      toast.error({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import template",
      });
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Import / Export Templates</SheetTitle>
          </SheetHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "export" | "import")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="My Landing Page Template"
                  />
                </div>

                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="A brief description of this template"
                  />
                </div>

                <div>
                  <Label>Export Format</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={exportFormat === "json" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setExportFormat("json");
                        setExportData("");
                        setExportHTML("");
                      }}
                      className="flex items-center gap-2"
                    >
                      <FileJson className="h-4 w-4" />
                      JSON
                    </Button>
                    <Button
                      variant={exportFormat === "html" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setExportFormat("html");
                        setExportData("");
                        setExportHTML("");
                      }}
                      className="flex items-center gap-2"
                    >
                      <FileCode className="h-4 w-4" />
                      HTML
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exportFormat === "json"
                      ? "Export as JSON configuration (can be imported back)"
                      : "Export as standalone HTML file (ready to deploy)"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download {exportFormat.toUpperCase()}
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    {exportFormat === "json" ? (
                      <FileJson className="h-4 w-4 mr-2" />
                    ) : (
                      <FileCode className="h-4 w-4 mr-2" />
                    )}
                    Generate Preview
                  </Button>
                </div>

                {(exportData || exportHTML) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Export Preview</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-2"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <textarea
                      className="w-full h-64 p-2 border rounded-md font-mono text-xs"
                      value={exportFormat === "json" ? exportData : exportHTML}
                      readOnly
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Upload Template File</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="import-data">Or Paste Template JSON</Label>
                  <textarea
                    id="import-data"
                    className="w-full h-32 p-2 border rounded-md font-mono text-sm"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your template JSON here..."
                  />
                </div>

                <Button onClick={handleImportFromText} className="w-full">
                  Import Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!confirmReplace}
        onOpenChange={(open) => !open && setConfirmReplace(null)}
        title="Replace all components?"
        description={confirmReplace?.description ?? ""}
        confirmText="Replace"
        variant="destructive"
        onConfirm={() => confirmReplace?.onConfirm()}
      />
    </>
  );
}
