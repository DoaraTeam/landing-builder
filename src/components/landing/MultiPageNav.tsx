"use client";

import { useRouter } from "next/navigation";
import { LandingPage, Theme } from "@/types/landing";
import MultiPageNavigation from "@/components/landing/MultiPageNavigation";

interface MultiPageNavProps {
  page: LandingPage;
  // "main" for the page's own top-level route, or a subPage's own id.
  activePageId: string;
  theme?: Theme;
}

/**
 * Bridges the page's saved `navigation` settings (style/icons/sticky/position
 * — configured in the editor's Navigation Settings panel) to the actual
 * public-site rendering, which needs a real client-side navigate (this
 * renders inside Server Components, which can't hold the router themselves).
 * Renders nothing when navigation hasn't been configured or there are no
 * sub-pages to navigate between — the Header's own auto-generated sub-page
 * links (see syncHeaderTabs) cover that default case instead.
 */
export function MultiPageNav({ page, activePageId, theme }: MultiPageNavProps) {
  const router = useRouter();
  const navigation = page.navigation;
  const subPages = page.subPages ?? [];

  if (!navigation || subPages.length === 0) {
    return null;
  }

  const handleNavigate = (pageId: string) => {
    if (pageId === "main") {
      router.push(`/${page.slug}`);
      return;
    }
    const target = subPages.find((sp) => sp.id === pageId);
    if (target) {
      router.push(`/${page.slug}/${target.slug}`);
    }
  };

  return (
    <MultiPageNavigation
      subPages={subPages}
      activePageId={activePageId}
      onNavigate={handleNavigate}
      style={navigation.style}
      position={navigation.position}
      showIcons={navigation.showIcons}
      sticky={navigation.sticky}
      theme={theme}
      mainPageTitle={page.title}
    />
  );
}
