"use client";

import { useState, useEffect } from "react";
import { LandingConfig, LandingPage } from "@/types/landing";
import { EditableLandingPage } from "@/components/editor/core/EditableLandingPage";
import MultiPageEditor from "@/components/editor/core/MultiPageEditor";

interface LandingPageEditorProps {
  pageId: string;
}

/**
 * LandingPageEditor - Entry point for editing a landing page
 * Loads config, handles save operations
 */
export function LandingPageEditor({ pageId }: LandingPageEditorProps) {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/landing-config");
      if (!response.ok) {
        throw new Error("Failed to load configuration");
      }

      const data: LandingConfig = await response.json();
      setConfig(data);

      const pageData = data.pages[pageId];
      if (!pageData) {
        throw new Error("Page not found");
      }

      setPage(pageData);
    } catch (err) {
      console.error("Error loading config:", err);
      setError(err instanceof Error ? err.message : "Failed to load page");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedPage: LandingPage) => {
    if (!config) return;

    try {
      // Update page in config
      const updatedConfig = {
        ...config,
        pages: {
          ...config.pages,
          [pageId]: {
            ...updatedPage,
            updatedAt: new Date().toISOString(),
          },
        },
      };

      // Save via API
      const response = await fetch("/api/landing-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          pageData: {
            ...updatedPage,
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save page");
      }

      // Update local state
      setConfig(updatedConfig);
      setPage(updatedPage);
    } catch (err) {
      console.error("Save error:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error || !page || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Page</h1>
          <p className="text-gray-600 mb-6">{error || "Page not found"}</p>
          <a
            href="/admin"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const theme = config.themes[page.theme];

  // Use MultiPageEditor if page is multi-page
  if (page.isMultiPage) {
    return (
      <MultiPageEditor
        page={page}
        config={config}
        onSave={handleSave}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
      />
    );
  }

  return <EditableLandingPage page={page} theme={theme} config={config} onSave={handleSave} />;
}
