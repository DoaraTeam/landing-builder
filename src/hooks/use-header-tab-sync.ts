"use client";

import { useCallback, useEffect, type MutableRefObject } from "react";
import { ComponentConfig, LandingPage } from "@/types/landing";

// Text shown on the header's own auto-generated nav tabs (distinct from
// component-labels.ts's getComponentDisplayName, which labels editor UI
// chrome like the toolbar/section tree — this is end-user-facing copy on
// the published site itself). Pure and side-effect-free, so it lives at
// module scope rather than being redefined every render.
function getNavTabLabel(component: ComponentConfig): string {
  const typeNames: Record<string, string> = {
    hero: "Home",
    features: "Features",
    pricing: "Pricing",
    testimonials: "Testimonials",
    cta: "Get Started",
    stats: "Stats",
    team: "Team",
    faq: "FAQ",
    gallery: "Gallery",
    "logo-cloud": "Partners",
    contact: "Contact",
    content: "About",
    newsletter: "Newsletter",
    video: "Video",
  };

  return typeNames[component.type] || component.type;
}

interface UseHeaderTabSyncParams {
  editingPage: LandingPage;
  setEditingPage: (page: LandingPage) => void;
  editingPageRef: MutableRefObject<LandingPage>;
}

// Keeps the header component's auto-generated nav tabs (hash links to
// visible sections + sub-page links) in sync with the page's components and
// subPages/navigation settings. Extracted verbatim from
// EditableLandingPage.tsx.
export function useHeaderTabSync({
  editingPage,
  setEditingPage,
  editingPageRef,
}: UseHeaderTabSyncParams) {
  // Reads the page's subPages/slug via editingPageRef (rather than closing
  // over `editingPage` directly) so this can stay a stable useCallback
  // identity — handlers like handleToggleVisibility/handleDeleteComponent
  // depend on it, and a fresh reference every render would defeat their own
  // memoization.
  const syncHeaderTabs = useCallback(
    (components: ComponentConfig[]) => {
      const headerComponent = components.find((c) => c.type === "header");
      if (!headerComponent) return components;

      // Get all visible non-header components
      const visibleComponents = components.filter(
        (c) => c.type !== "header" && c.visible && c.type !== "footer"
      );

      // Create tabs for each component (hash links)
      const componentTabs = visibleComponents.map((comp) => ({
        id: comp.id,
        text: getNavTabLabel(comp),
        link: `#${comp.id}`,
      }));

      // Add subpage tabs to header — every page's sub-pages live under its own
      // slug uniformly (e.g. /my-page/blog), no special case for any page.
      // Skipped once Navigation Settings has been configured for this page —
      // that renders its own dedicated sub-page nav (MultiPageNav) on the
      // public site, so the header doesn't need to duplicate those links too.
      const currentPage = editingPageRef.current;
      let newTabs = [...componentTabs];

      if (!currentPage.navigation && (currentPage.subPages?.length ?? 0) > 0) {
        const subPageTabs =
          currentPage.subPages
            ?.filter((sp) => sp.visible)
            .map((sp) => ({
              id: sp.id,
              text: sp.title,
              link: `/${currentPage.slug}/${sp.slug}`,
            })) || [];
        newTabs = [...componentTabs, ...subPageTabs];
      }

      // Update header config with new tabs
      const updatedHeader = {
        ...headerComponent,
        config: {
          ...headerComponent.config,
          tabs: newTabs,
        },
      };

      return components.map((c) => (c.id === headerComponent.id ? updatedHeader : c));
    },
    [editingPageRef]
  );

  // Sync header tabs when subpages (or the navigation settings that decide
  // whether the header should even offer sub-page links itself) change.
  useEffect(() => {
    const headerComponent = editingPage.components.find((c) => c.type === "header");
    if (headerComponent) {
      const syncedComponents = syncHeaderTabs(editingPage.components);
      if (JSON.stringify(syncedComponents) !== JSON.stringify(editingPage.components)) {
        setEditingPage({
          ...editingPage,
          components: syncedComponents,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPage.subPages, editingPage.navigation]);

  return { syncHeaderTabs };
}
